// 计数器
let count = 0;
const counterEl = document.getElementById('counter');
document.getElementById('increment').addEventListener('click', () => {
  count += 1;
  counterEl.textContent = count;
});
document.getElementById('reset').addEventListener('click', () => {
  count = 0;
  counterEl.textContent = count;
});

// 深色模式切换
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// 新增列表项
let itemIndex = 4;
document.getElementById('addItem').addEventListener('click', () => {
  const li = document.createElement('li');
  li.textContent = '动态新增项 ' + itemIndex++;
  document.getElementById('featureList').appendChild(li);
});