/* script.js - 图片压缩与格式转换核心逻辑（原生 JS，纯浏览器端处理） */
"use strict";

// 支持的输入格式白名单：拖拽无法依赖 accept 属性，需要在这里二次过滤
const ACCEPTED_TYPES = ["image/webp", "image/jpeg", "image/png"];

// 目标格式对应的扩展名，用于生成下载文件名
const MIME_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const state = { items: [] }; // 每项: { id, file, bitmap, blob, status, error }

let idCounter = 0;
function nextId() {
  // crypto.randomUUID 仅在安全上下文（HTTPS/localhost）可用，
  // 通过 HTTP + IP 访问时不存在，会让整个添加流程崩溃，因此改用计数器方案
  return "img-" + Date.now().toString(36) + "-" + ++idCounter;
}

const els = {
  dropZone: document.getElementById("drop-zone"),
  fileInput: document.getElementById("file-input"),
  dropError: document.getElementById("drop-error"),
  format: document.getElementById("target-format"),
  quality: document.getElementById("quality"),
  qualityValue: document.getElementById("quality-value"),
  maxEdge: document.getElementById("max-edge"),
  list: document.getElementById("file-list"),
  emptyTip: document.getElementById("empty-tip"),
  processAll: document.getElementById("process-all"),
  downloadAll: document.getElementById("download-all"),
};

/* ---------- 工具函数 ---------- */

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function fileKey(file) {
  // name + size + lastModified 组合足以区分绝大多数重复文件
  return file.name + "|" + file.size + "|" + file.lastModified;
}

// 浏览器是否支持导出 WebP（Safari 旧版本不支持，需提前禁用选项）
function webpSupported() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

function releaseItem(item) {
  if (item.bitmap && item.bitmap.close) item.bitmap.close();
  if (item.url) URL.revokeObjectURL(item.url);
}

/* ---------- 文件接入 ---------- */

function addFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;

  const existing = new Set(state.items.map((it) => fileKey(it.file)));
  const invalid = [];
  let added = 0;

  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      invalid.push(file.name);
      continue;
    }
    if (existing.has(fileKey(file))) continue;
    existing.add(fileKey(file));

    const item = { id: nextId(), file, bitmap: null, blob: null, url: null, status: "pending", error: "" };
    state.items.push(item);
    added++;
    renderThumb(item); // 缩略图与解码一起做，尽早暴露坏文件
  }

  showDropError(
    invalid.length
      ? "已跳过不支持的文件：" + invalid.join("、") + "（仅支持 webp / jpg / jpeg / png）"
      : ""
  );

  if (added) renderList();
}

function showDropError(msg) {
  els.dropError.hidden = !msg;
  els.dropError.textContent = msg;
}

async function renderThumb(item) {
  try {
    // from-image 让浏览器按 EXIF 方向摆正图片，否则手机竖拍照片会横着显示
    item.bitmap = await createImageBitmap(item.file, { imageOrientation: "from-image" });
    item.status = "ready";
  } catch (err) {
    item.status = "failed";
    item.error = "解码失败，可能不是有效图片";
  }
  const row = els.list.querySelector(`[data-id="${item.id}"]`);
  if (row) updateRow(row, item);
  // 添加文件时列表还是 pending 状态，"全部处理"按钮被禁用；
  // 解码完成后必须在这里重新计算按钮状态，否则按钮永远点不了
  updateBatchButtons();
}

/* ---------- 列表渲染 ---------- */

function renderList() {
  els.list.innerHTML = "";
  els.emptyTip.hidden = state.items.length > 0;

  for (const item of state.items) {
    const li = document.createElement("li");
    li.className = "file-item";
    li.dataset.id = item.id;
    updateRow(li, item);
    els.list.appendChild(li);
  }

  updateBatchButtons();
}

function updateRow(li, item) {
  const saved =
    item.blob
      ? item.file.size - item.blob.size
      : null;
  const savedText =
    saved === null
      ? ""
      : saved > 0
        ? `<span class="saved">↓ ${formatSize(saved)}（节省 ${Math.round((saved / item.file.size) * 100)}%）</span>`
        : `<span class="bigger">↑ ${formatSize(-saved)}（反而更大）</span>`;

  const statusText = {
    pending: "解码中…",
    ready: "待处理",
    processing: "处理中…",
    done: "完成",
    failed: item.error || "失败",
  }[item.status];

  li.innerHTML = `
    <img class="thumb" alt="缩略图" ${item.bitmap ? `src="${makeThumbUrl(item)}"` : ""} />
    <div class="file-info">
      <div class="name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</div>
      <div class="meta">
        ${item.bitmap ? `${item.bitmap.width}×${item.bitmap.height} · ` : ""}${formatSize(item.file.size)}
        ${item.blob ? ` → ${formatSize(item.blob.size)} ${savedText}` : ""}
      </div>
    </div>
    <span class="file-status ${item.status}">${statusText}</span>
    ${item.blob ? `<button class="download-btn">下载</button>` : ""}
    <button class="remove" title="移除">✕</button>
  `;
}

// 用小 canvas 生成缩略图 URL，避免把几 MB 的原图塞进 <img>（大 PNG 会明显卡顿）
function makeThumbUrl(item) {
  const size = 128;
  const scale = Math.min(size / item.bitmap.width, size / item.bitmap.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(item.bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(item.bitmap.height * scale));
  canvas.getContext("2d").drawImage(item.bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function updateBatchButtons() {
  els.processAll.disabled = !state.items.some((it) => it.status === "ready" || it.status === "done");
  els.downloadAll.disabled = !state.items.some((it) => it.status === "done");
}

/* ---------- 压缩与转换 ---------- */

function resolveTargetMime(item) {
  const choice = els.format.value;
  if (choice === "auto") {
    // 原格式若不在可导出列表（理论上不会发生，白名单已保证），回退为 PNG
    return MIME_EXT[item.file.type] ? item.file.type : "image/png";
  }
  return choice;
}

async function processItem(item) {
  if (!item.bitmap) {
    item.status = "failed";
    item.error = item.error || "未解码";
    return;
  }

  item.status = "processing";
  const row = els.list.querySelector(`[data-id="${item.id}"]`);
  if (row) updateRow(row, item);

  // 最长边缩放：保持宽高比，且不放大
  const maxEdge = parseInt(els.maxEdge.value, 10);
  let w = item.bitmap.width;
  let h = item.bitmap.height;
  if (maxEdge > 0 && Math.max(w, h) > maxEdge) {
    const scale = maxEdge / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const mime = resolveTargetMime(item);
  // PNG 是无损格式，质量参数无效，固定传 1 保持语义清晰
  const quality = mime === "image/png" ? 1 : parseFloat(els.quality.value);

  // 让出主线程一帧，确保大图处理前 UI 状态已刷新
  await new Promise((r) => requestAnimationFrame(() => r()));

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  // JPG 没有透明通道，透明区域必须先垫白，否则会渲染成黑色
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(item.bitmap, 0, 0, w, h);

  try {
    item.blob = await canvas.convertToBlob({ type: mime, quality });
    if (item.url) URL.revokeObjectURL(item.url);
    item.url = URL.createObjectURL(item.blob);
    item.status = "done";
  } catch (err) {
    item.status = "failed";
    item.error = "编码失败：" + (err && err.message ? err.message : "未知错误");
  }

  if (row) updateRow(row, item);
  updateBatchButtons();
}

async function processAll() {
  const targets = state.items.filter((it) => it.status === "ready" || it.status === "done");
  for (const item of targets) {
    await processItem(item); // 逐个处理，避免多张大图同时占满内存
  }
}

/* ---------- 下载 ---------- */

function buildDownloadName(item) {
  const base = item.file.name.replace(/\.[^.]+$/, "");
  const ext = MIME_EXT[resolveTargetMime(item)] || "png";
  return `${base}-压缩.${ext}`;
}

function downloadItem(item) {
  if (!item.blob) return;
  const a = document.createElement("a");
  a.href = item.url;
  a.download = buildDownloadName(item);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadAll() {
  for (const item of state.items) {
    if (item.status === "done") downloadItem(item);
  }
}

/* ---------- 事件绑定 ---------- */

els.dropZone.addEventListener("click", () => els.fileInput.click());
els.fileInput.addEventListener("change", () => {
  addFiles(els.fileInput.files);
  els.fileInput.value = ""; // 允许再次选择同一文件
});

els.dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  els.dropZone.classList.add("dragover");
});
els.dropZone.addEventListener("dragleave", () => els.dropZone.classList.remove("dragover"));
els.dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  els.dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});

els.quality.addEventListener("input", () => {
  els.qualityValue.textContent = parseFloat(els.quality.value).toFixed(2);
});

// PNG 无损，质量滑块对它无意义，选 PNG 时禁用避免误解
els.format.addEventListener("change", () => {
  const isPng = els.format.value === "image/png";
  els.quality.disabled = isPng;
  els.qualityValue.textContent = isPng ? "不适用" : parseFloat(els.quality.value).toFixed(2);
});

els.processAll.addEventListener("click", processAll);
els.downloadAll.addEventListener("click", downloadAll);

els.list.addEventListener("click", (e) => {
  const li = e.target.closest(".file-item");
  if (!li) return;
  const item = state.items.find((it) => it.id === li.dataset.id);
  if (!item) return;

  if (e.target.classList.contains("remove")) {
    releaseItem(item);
    state.items = state.items.filter((it) => it !== item);
    renderList();
  } else if (e.target.classList.contains("download-btn")) {
    downloadItem(item);
  }
});

// 不支持 WebP 导出的浏览器直接禁用该选项
if (!webpSupported()) {
  const webpOption = els.format.querySelector('option[value="image/webp"]');
  webpOption.disabled = true;
  webpOption.textContent = "WebP（当前浏览器不支持）";
}
