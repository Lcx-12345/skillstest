#!/bin/bash
# PreToolUse Hook 验证脚本
# 为什么这样设计：验证事件是否触发最直接的方式是"可观测"——
# 把每次工具调用的 stdin JSON 原样落盘到日志文件，事后检查日志即可确认触发时机和入参。
# 同时返回 permissionDecision: allow 放行所有工具，避免验证过程干扰正常会话；
# 如需验证拦截效果，将 permissionDecision 改为 deny 或 ask 即可。

LOG_FILE="$TRAE_PROJECT_DIR/.trae/hooks/pretooluse.log"

INPUT=$(cat)

{
  echo "===== $(date '+%Y-%m-%d %H:%M:%S') PreToolUse ====="
  echo "$INPUT"
  echo ""
} >> "$LOG_FILE"

# 退出码 0 + allow 决策，让工具调用正常继续执行
printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"PreToolUse hook fired, event logged to pretooluse.log"}}'
exit 0
