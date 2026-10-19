const pptxgen = require("pptxgenjs");
const fs = require("fs");

// ============ SLIDE DIMENSIONS ============
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
const SLIDE_W = 10, SLIDE_H = 5.625, MARGIN = 0.5;
const CONTENT_X = MARGIN, CONTENT_Y = MARGIN;
const CONTENT_W = SLIDE_W - 2 * MARGIN;
const CONTENT_H = SLIDE_H - 2 * MARGIN;

// ============ THEME ============
const NAVY = "1E2761", ICE = "CADCFC", WHITE = "FFFFFF";
const LIGHT_BG = "F7F9FC", GRAY = "6B7280";
const TITLE_FONT = "Noto Serif CJK SC", BODY_FONT = "Noto Sans CJK SC";

// ============ CONTAINER SYSTEM ============
function parseImageDimensions(path) {
  const match = path.match(/_(\d+)x(\d+)\.(png|jpg|jpeg|gif|webp)$/i);
  if (match) return { width: parseInt(match[1]), height: parseInt(match[2]) };
  return null;
}
function calculateScaledImageOpts(opts) {
  const { path, w: targetW, h: targetH, x = 0, y = 0, ...rest } = opts;
  if (!path || !targetW || !targetH) return opts;
  const dims = parseImageDimensions(path);
  if (!dims) return opts;
  const imgAspect = dims.width / dims.height;
  const targetAspect = targetW / targetH;
  let scaledW, scaledH, offsetX = 0, offsetY = 0;
  if (imgAspect > targetAspect) { scaledW = targetW; scaledH = targetW / imgAspect; offsetY = (targetH - scaledH) / 2; }
  else { scaledH = targetH; scaledW = targetH * imgAspect; offsetX = (targetW - scaledW) / 2; }
  return { path, x: x + offsetX, y: y + offsetY, w: scaledW, h: scaledH, ...rest };
}
function createVirtualNode(type, data, parentX = 0, parentY = 0) {
  const opts = data.opts || {};
  const node = { type, data, absX: parentX + (opts.x || 0), absY: parentY + (opts.y || 0), w: opts.w || 0, h: opts.h || 0, children: [] };
  node.addShape = function(shapeType, o = {}) { const c = createVirtualNode("shape", { shapeType, opts: o }, node.absX, node.absY); node.children.push(c); return c; };
  node.addText = function(text, o = {}) { const c = createVirtualNode("text", { text, opts: { fit: "shrink", ...o } }, node.absX, node.absY); node.children.push(c); return c; };
  node.addImage = function(o = {}) { const c = createVirtualNode("image", { opts: calculateScaledImageOpts(o) }, node.absX, node.absY); node.children.push(c); return c; };
  return node;
}
function flattenNode(node, realSlide) {
  const absOpts = { ...node.data.opts, x: node.absX, y: node.absY };
  if (node.type === "shape") realSlide.addShape(node.data.shapeType, absOpts);
  else if (node.type === "text") realSlide.addText(node.data.text, absOpts);
  else if (node.type === "image") realSlide.addImage(absOpts);
  node.children.forEach(c => flattenNode(c, realSlide));
}
const originalAddSlide = pres.addSlide.bind(pres);
pres.addSlide = function() {
  const realSlide = originalAddSlide();
  const virtualSlide = {
    children: [], _realSlide: realSlide,
    set background(v) { realSlide.background = v; },
    addShape(t, o = {}) { const n = createVirtualNode("shape", { shapeType: t, opts: o }, 0, 0); this.children.push(n); return n; },
    addText(t, o = {}) { const n = createVirtualNode("text", { text: t, opts: { fit: "shrink", ...o } }, 0, 0); this.children.push(n); return n; },
    addImage(o = {}) { const n = createVirtualNode("image", { opts: calculateScaledImageOpts(o) }, 0, 0); this.children.push(n); return n; },
    render() { this.children.forEach(c => flattenNode(c, realSlide)); },
  };
  return virtualSlide;
};

// ---------- helpers ----------
function titleBar(slide, text) {
  slide.addText(text, { x: CONTENT_X, y: CONTENT_Y, w: CONTENT_W, h: 0.6, fontSize: 26, bold: true, fontFace: TITLE_FONT, color: NAVY, charSpacing: 1.5 });
}
function card(slide, x, y, w, h) {
  const c = slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: WHITE }, line: { color: "E3E8F2", width: 1 }, rectRadius: 0.06 });
  c.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.12, w: 0.07, h: h - 0.24, fill: { color: NAVY } });
  return c;
}

// ---------- Slide 1: Cover ----------
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 7.5, y: 0.25, w: 2.2, h: 2.2, fill: { color: ICE, transparency: 88 } });
  s.addShape(pres.shapes.OVAL, { x: 0.25, y: 3.25, w: 2.0, h: 2.0, fill: { color: ICE, transparency: 92 } });
  s.addImage({ path: "/workspace/.demo-build/assets/hero_2240x1680.jpg", x: 5.45, y: 1.0, w: 4.05, h: 3.6 });
  s.addText("Trae 内置工具 × 文件格式", { x: CONTENT_X, y: 1.45, w: 4.7, h: 1.6, fontSize: 34, bold: true, fontFace: TITLE_FONT, color: WHITE, charSpacing: 2.5 });
  s.addText("全量能力演示", { x: CONTENT_X, y: 3.05, w: 4.7, h: 0.5, fontSize: 18, fontFace: TITLE_FONT, color: ICE, charSpacing: 1 });
  s.addText("26 个内置工具 · 15 种文件格式 · 2026-10-19", { x: CONTENT_X, y: 3.6, w: 4.7, h: 0.4, fontSize: 12, fontFace: BODY_FONT, color: ICE });
  s.addText("office-plugin:pptx 技能（pptxgenjs）生成", { x: CONTENT_X, y: 4.95, w: 4.7, h: 0.35, fontSize: 10, fontFace: BODY_FONT, color: ICE, transparency: 30 });
  s.render();
}

// ---------- Slide 2: TOC ----------
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_BG };
  titleBar(s, "目录");
  const items = [
    ["01", "支持的文件格式", "文本与代码 / Office / 图片 / 网页幻灯片 / 归档 / 云端文档"],
    ["02", "内置工具全景", "26 个工具，按九大类全覆盖"],
    ["03", "演示产出与结语", "输出目录 /workspace/demo-output/ 与预览方式"],
  ];
  items.forEach(([no, t, d], i) => {
    const y = 1.5 + i * 1.1;
    const badge = s.addShape(pres.shapes.OVAL, { x: CONTENT_X + 0.1, y: y + 0.08, w: 0.5, h: 0.5, fill: { color: NAVY } });
    badge.addText(no, { x: 0, y: 0, w: 0.5, h: 0.5, align: "center", fontSize: 13, bold: true, color: WHITE, fontFace: BODY_FONT });
    s.addText(t, { x: CONTENT_X + 0.85, y: y, w: 4.4, h: 0.45, fontSize: 18, bold: true, color: NAVY, fontFace: BODY_FONT });
    s.addText(d, { x: CONTENT_X + 0.85, y: y + 0.46, w: 4.6, h: 0.4, fontSize: 11, color: GRAY, fontFace: BODY_FONT });
  });
  const stat = s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 1.6, w: 3.2, h: 2.9, fill: { color: NAVY }, rectRadius: 0.08 });
  stat.addText("26", { x: 0.2, y: 0.35, w: 2.8, h: 0.9, align: "center", fontSize: 48, bold: true, color: WHITE, fontFace: TITLE_FONT });
  stat.addText("个内置工具", { x: 0.2, y: 1.2, w: 2.8, h: 0.35, align: "center", fontSize: 13, color: ICE, fontFace: BODY_FONT });
  stat.addText("15", { x: 0.2, y: 1.65, w: 2.8, h: 0.9, align: "center", fontSize: 48, bold: true, color: WHITE, fontFace: TITLE_FONT });
  stat.addText("种文件格式", { x: 0.2, y: 2.5, w: 2.8, h: 0.35, align: "center", fontSize: 13, color: ICE, fontFace: BODY_FONT });
  s.render();
}

// ---------- Slide 3: Formats ----------
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_BG };
  titleBar(s, "一、支持的文件格式");
  const cards = [
    ["9 种", "文本与代码", "txt / md / csv / json / yaml / xml / svg / html / py"],
    ["4 种", "Office 文档", "docx / xlsx / pptx / pdf（office-plugin 技能）"],
    ["2 类", "图片", "jpg / png · GenerateImage 工具"],
    ["Deck", "网页幻灯片", "html-deck 技能 · 动画放映"],
    ["ZIP", "归档", "RunCommand 终端命令打包"],
    ["云文档", "飞书云端", "Lark 插件 · 需授权（本次未演示）"],
  ];
  const cw = 2.8, ch = 1.5, gx = 0.3, gy = 0.25;
  cards.forEach(([num, name, desc], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const c = card(s, CONTENT_X + col * (cw + gx), 1.35 + row * (ch + gy), cw, ch);
    c.addText(num, { x: 0.2, y: 0.12, w: 2.4, h: 0.5, fontSize: 22, bold: true, color: NAVY, fontFace: TITLE_FONT });
    c.addText(name, { x: 0.2, y: 0.62, w: 2.4, h: 0.35, fontSize: 13, bold: true, color: "333333", fontFace: BODY_FONT });
    c.addText(desc, { x: 0.2, y: 0.97, w: 2.45, h: 0.45, fontSize: 9.5, color: GRAY, fontFace: BODY_FONT });
  });
  s.addText("结论：15 种本地格式全部实际生成于 /workspace/demo-output/，图片格式由生成器自动决定（本次为 jpg）。", { x: CONTENT_X, y: 4.95, w: CONTENT_W, h: 0.4, fontSize: 11, italic: true, color: GRAY, fontFace: BODY_FONT });
  s.render();
}

// ---------- Slide 4: Tools ----------
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_BG };
  titleBar(s, "二、内置工具全景（26 个）");
  const cats = [
    ["文件与搜索 · 8", "Read / Write / Edit / DeleteFile / Glob / Grep / LS / SearchCodebase"],
    ["终端 · 3", "RunCommand / CheckCommandStatus / StopCommand"],
    ["网络 · 2", "WebSearch / WebFetch"],
    ["图像 · 1", "GenerateImage（AI 文生图）"],
    ["子智能体 · 3 类", "search / general_purpose_task / browser_use"],
    ["规划交互 · 5", "TodoWrite / AskUserQuestion / NotifyUser / OpenPreview / 等待用户交互"],
    ["目标管理 · 3", "get_goal / create_goal / update_goal"],
    ["定时任务 · 1", "Schedule（cron 定时任务）"],
    ["技能与扩展 · 2", "Skill 技能调用 / run_mcp（MCP: Exec）"],
  ];
  const cw = 2.8, ch = 1.05, gx = 0.3, gy = 0.22;
  cats.forEach(([name, desc], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const c = card(s, CONTENT_X + col * (cw + gx), 1.3 + row * (ch + gy), cw, ch);
    c.addText(name, { x: 0.2, y: 0.1, w: 2.45, h: 0.32, fontSize: 12.5, bold: true, color: NAVY, fontFace: BODY_FONT });
    c.addText(desc, { x: 0.2, y: 0.44, w: 2.45, h: 0.55, fontSize: 9, color: GRAY, fontFace: BODY_FONT });
  });
  s.addText("覆盖文件操作、终端命令、网络检索、多模态生成、子智能体调度与状态管理的完整闭环。", { x: CONTENT_X, y: 5.05, w: CONTENT_W, h: 0.35, fontSize: 11, italic: true, color: GRAY, fontFace: BODY_FONT });
  s.render();
}

// ---------- Slide 5: Closing ----------
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 0.3, y: 0.3, w: 2.0, h: 2.0, fill: { color: ICE, transparency: 88 } });
  s.addShape(pres.shapes.OVAL, { x: 7.7, y: 3.35, w: 2.0, h: 2.0, fill: { color: ICE, transparency: 92 } });
  s.addText("谢谢观看", { x: 0, y: 1.35, w: SLIDE_W, h: 0.95, align: "center", fontSize: 34, bold: true, fontFace: TITLE_FONT, color: WHITE, charSpacing: 2.5 });
  s.addText("26 工具 × 15 格式 · 一次演示全部跑通", { x: 0, y: 2.5, w: SLIDE_W, h: 0.5, align: "center", fontSize: 18, bold: true, fontFace: TITLE_FONT, color: ICE, charSpacing: 1 });
  s.addText("产出目录：/workspace/demo-output/ ｜ HTML 预览：demo.html", { x: 0, y: 3.2, w: SLIDE_W, h: 0.4, align: "center", fontSize: 12, fontFace: BODY_FONT, color: ICE });
  s.addText("由 office-plugin:pptx 技能（pptxgenjs）生成 · 2026-10-19", { x: 0, y: 4.9, w: SLIDE_W, h: 0.35, align: "center", fontSize: 10, fontFace: BODY_FONT, color: ICE, transparency: 30 });
  s.render();
}

pres.writeFile({ fileName: "/workspace/demo-output/presentation.pptx" }).then(() => {
  console.log("presentation.pptx written:", fs.statSync("/workspace/demo-output/presentation.pptx").size, "bytes");
});
