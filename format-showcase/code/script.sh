#!/usr/bin/env bash
# AI 研发效能数据集校验脚本
# 用法: ./script.sh
set -euo pipefail

DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../data" && pwd)"
CSV="${DATA_DIR}/metrics.csv"
JSON="${DATA_DIR}/metrics.json"

if [[ ! -f "${CSV}" || ! -f "${JSON}" ]]; then
  echo "缺少数据文件: ${CSV} / ${JSON}" >&2
  exit 1
fi

rows=$(($(wc -l < "${CSV}") - 1))
echo "任务类型数量: ${rows}"

total=$(awk -F, 'NR>1 {s+=$2} END {print s}' "${CSV}")
echo "任务总量: ${total}"

w_auto=$(awk -F, -v t="${total}" 'NR>1 {sa+=$3*$2} END {printf "%.1f", sa/t}' "${CSV}")
w_pass=$(awk -F, -v t="${total}" 'NR>1 {sp+=$5*$2} END {printf "%.1f", sp/t}' "${CSV}")
w_min=$(awk -F, -v t="${total}" 'NR>1 {sm+=$4*$2} END {printf "%.1f", sm/t}' "${CSV}")
cost=$(awk -F, 'NR>1 {c+=$6*$2} END {printf "%.2f", c}' "${CSV}")

echo "加权自动化率: ${w_auto}%"
echo "加权一次通过率: ${w_pass}%"
echo "加权平均耗时: ${w_min} 分钟"
echo "总成本: ¥${cost}"

echo
echo "重点改进区（自动化率 < 65%）:"
awk -F, 'NR>1 && $3 < 65 {printf "  - %s（%.1f%%）\n", $1, $3}' "${CSV}"

echo
echo "校验通过。"
