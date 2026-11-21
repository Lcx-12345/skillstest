// assets/charts.js — 报告图表（ECharts，颜色统一取自 CSS 变量）
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var accentSoft = accent + '33';

  var baseText = { color: ink, fontFamily: 'inherit', fontSize: 12 };
  var axisCommon = {
    axisLine: { lineStyle: { color: rule } },
    axisTick: { show: false },
    axisLabel: { color: muted, fontSize: 11 },
    splitLine: { lineStyle: { color: rule, type: 'dashed' } }
  };
  var tooltipCommon = {
    trigger: 'axis',
    appendToBody: true,
    backgroundColor: bg2,
    borderColor: rule,
    textStyle: { color: ink, fontSize: 12 }
  };

  // -------------------------------------------------- 图 1：场景自动化率
  var types = ['单元测试生成', '集成测试编排', '代码评审辅助', '存量代码重构', '技术文档编写',
    '线上问题定位', 'SQL 与查询优化', 'CI 流水线维护', '需求拆解澄清', '发布与回滚脚本'];
  var auto = [92.4, 78.6, 84.1, 62.5, 88.9, 58.3, 71.8, 94.0, 66.2, 89.5];
  var pass = [87.5, 74.2, 91.3, 66.8, 93.1, 61.5, 69.4, 88.7, 72.8, 90.2];
  var cost = [12.4, 26.8, 9.6, 41.2, 7.3, 38.9, 15.2, 5.1, 11.4, 6.3];

  var chart1 = echarts.init(document.getElementById('chart-automation'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    textStyle: baseText,
    tooltip: Object.assign({}, tooltipCommon, {
      formatter: function (p) {
        var i = p[0].dataIndex;
        return '<strong>' + types[i] + '</strong><br/>自动化率 ' + auto[i] + '%<br/>一次通过率 ' + pass[i] + '%<br/>单任务成本 ¥' + cost[i];
      }
    }),
    legend: { data: ['自动化率', '一次通过率'], top: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { left: 8, right: 12, top: 44, bottom: 8, containLabel: true },
    xAxis: Object.assign({}, axisCommon, {
      type: 'category',
      data: types,
      axisLabel: { color: muted, fontSize: 10, interval: 0, rotate: 32 }
    }),
    yAxis: Object.assign({}, axisCommon, { type: 'value', max: 100, name: '%' }),
    series: [
      {
        name: '自动化率',
        type: 'bar',
        data: auto,
        barMaxWidth: 22,
        itemStyle: {
          color: function (p) { return p.value < 65 ? accent2 : accent; },
          borderRadius: [3, 3, 0, 0]
        },
        markLine: {
          symbol: 'none',
          lineStyle: { color: accent2, type: 'dashed', width: 1 },
          label: { formatter: '改进线 65%', color: accent2, fontSize: 10 },
          data: [{ yAxis: 65 }]
        }
      },
      {
        name: '一次通过率',
        type: 'line',
        data: pass,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2, color: accentSoft },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function () { chart1.resize(); });

  // -------------------------------------------------- 图 2：月度趋势
  var months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
  var mTasks = [980, 1120, 1250, 1180, 1340, 1060];
  var mMins = [17.4, 16.8, 16.1, 15.9, 15.1, 14.6];
  var mAuto = [74.2, 76.5, 77.8, 78.9, 79.8, 80.7];

  var chart2 = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    textStyle: baseText,
    tooltip: Object.assign({}, tooltipCommon),
    legend: { data: ['任务数', '平均耗时(分钟)', '自动化率(%)'], top: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { left: 8, right: 8, top: 46, bottom: 6, containLabel: true },
    xAxis: Object.assign({}, axisCommon, { type: 'category', boundaryGap: true, data: months }),
    yAxis: [
      Object.assign({}, axisCommon, { type: 'value', name: '分钟', min: 12, max: 20 }),
      Object.assign({}, axisCommon, { type: 'value', name: '%', min: 70, max: 84, splitLine: { show: false } })
    ],
    series: [
      {
        name: '任务数',
        type: 'bar',
        yAxisIndex: 0,
        data: mTasks,
        barMaxWidth: 26,
        itemStyle: { color: bg2 === '#FFFFFF' ? '#E8EEF4' : '#E8EEF4', borderRadius: [3, 3, 0, 0] }
      },
      {
        name: '平均耗时(分钟)',
        type: 'line',
        yAxisIndex: 0,
        data: mMins,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent }
      },
      {
        name: '自动化率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: mAuto,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: accent2 },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function () { chart2.resize(); });

  // -------------------------------------------------- 图 3：成本结构
  var chart3 = echarts.init(document.getElementById('chart-cost'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    textStyle: baseText,
    tooltip: Object.assign({}, tooltipCommon, {
      trigger: 'item',
      formatter: '{b}<br/>单任务成本 ¥{c}（占比 {d}%）'
    }),
    legend: { orient: 'vertical', right: 0, top: 'center', itemWidth: 10, itemHeight: 10, textStyle: { color: muted, fontSize: 11 } },
    series: [{
      name: '单任务成本',
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['38%', '52%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: bg2, borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, formatter: '{b}\n¥{c}', color: ink, fontSize: 12, lineHeight: 16 } },
      data: types.map(function (t, i) { return { name: t, value: cost[i] }; })
    }]
  });
  window.addEventListener('resize', function () { chart3.resize(); });
})();
