// _shared/js/deck.js — 演示页导航与图表
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var counter = document.getElementById('counter');
  var progress = document.getElementById('progress');
  var index = 0;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('active', i === index); });
    counter.textContent = ('0' + (index + 1)).slice(-2) + ' / ' + ('0' + slides.length).slice(-2);
    progress.style.width = ((index + 1) / slides.length * 100) + '%';
    draw();
  }

  document.getElementById('next').addEventListener('click', function () { show(index + 1); });
  document.getElementById('prev').addEventListener('click', function () { show(index - 1); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { show(index + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(index - 1); e.preventDefault(); }
    if (e.key === 'Home') { show(0); }
    if (e.key === 'End') { show(slides.length - 1); }
  });

  var charts = [];

  function draw() {
    charts.forEach(function (c) { c.resize(); });
  }

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted-dark').trim();
  var rule = style.getPropertyValue('--rule').trim();

  var types = ['单元测试生成', '集成测试编排', '代码评审辅助', '存量代码重构', '技术文档编写',
    '线上问题定位', 'SQL 与查询优化', 'CI 流水线维护', '需求拆解澄清', '发布与回滚脚本'];
  var auto = [92.4, 78.6, 84.1, 62.5, 88.9, 58.3, 71.8, 94.0, 66.2, 89.5];

  var el1 = document.getElementById('chart-automation');
  if (el1) {
    var c1 = echarts.init(el1, null, { renderer: 'svg' });
    c1.setOption({
      animation: false,
      textStyle: { color: ink, fontSize: 12 },
      tooltip: {
        trigger: 'axis', appendToBody: true,
        backgroundColor: '#fff', borderColor: rule, textStyle: { color: ink, fontSize: 12 }
      },
      grid: { left: 6, right: 10, top: 18, bottom: 6, containLabel: true },
      xAxis: {
        type: 'category', data: types,
        axisLabel: { color: muted, fontSize: 10, interval: 0, rotate: 32 },
        axisLine: { lineStyle: { color: rule } }, axisTick: { show: false }
      },
      yAxis: {
        type: 'value', max: 100, name: '%',
        axisLabel: { color: muted, fontSize: 10 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      series: [{
        type: 'bar', data: auto, barMaxWidth: 24,
        itemStyle: {
          color: function (p) { return p.value < 65 ? accent2 : accent; },
          borderRadius: [3, 3, 0, 0]
        },
        markLine: {
          symbol: 'none', lineStyle: { color: accent2, type: 'dashed' },
          label: { formatter: '改进线 65%', color: accent2, fontSize: 10 },
          data: [{ yAxis: 65 }]
        }
      }]
    });
    charts.push(c1);
  }

  var el2 = document.getElementById('chart-trend');
  if (el2) {
    var c2 = echarts.init(el2, null, { renderer: 'svg' });
    c2.setOption({
      animation: false,
      textStyle: { color: ink, fontSize: 12 },
      tooltip: {
        trigger: 'axis', appendToBody: true,
        backgroundColor: '#fff', borderColor: rule, textStyle: { color: ink, fontSize: 12 }
      },
      legend: { data: ['平均耗时(分钟)', '自动化率(%)'], top: 0, textStyle: { color: muted, fontSize: 11 } },
      grid: { left: 6, right: 6, top: 40, bottom: 4, containLabel: true },
      xAxis: {
        type: 'category', data: ['5月', '6月', '7月', '8月', '9月', '10月'],
        axisLabel: { color: muted, fontSize: 11 }, axisLine: { lineStyle: { color: rule } }, axisTick: { show: false }
      },
      yAxis: [
        { type: 'value', min: 12, max: 20, name: '分钟', axisLabel: { color: muted, fontSize: 10 }, splitLine: { lineStyle: { color: rule, type: 'dashed' } } },
        { type: 'value', min: 70, max: 84, name: '%', axisLabel: { color: muted, fontSize: 10 }, splitLine: { show: false } }
      ],
      series: [
        {
          name: '平均耗时(分钟)', type: 'line', yAxisIndex: 0, data: [17.4, 16.8, 16.1, 15.9, 15.1, 14.6],
          smooth: true, symbolSize: 6, lineStyle: { width: 3, color: accent }, itemStyle: { color: accent }
        },
        {
          name: '自动化率(%)', type: 'line', yAxisIndex: 1, data: [74.2, 76.5, 77.8, 78.9, 79.8, 80.7],
          smooth: true, symbolSize: 6, lineStyle: { width: 3, color: accent2 }, itemStyle: { color: accent2 }
        }
      ]
    });
    charts.push(c2);
  }

  window.addEventListener('resize', draw);
  show(0);
})();
