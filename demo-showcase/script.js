// script.js - 页面交互演示
let clicks = 0;

document.getElementById("demo-btn").addEventListener("click", () => {
  clicks++;
  const now = new Date().toLocaleTimeString("zh-CN");
  document.getElementById("demo-output").textContent =
    `script.js 运行正常！这是第 ${clicks} 次点击，当前时间 ${now}`;
});
