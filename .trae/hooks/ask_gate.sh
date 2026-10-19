#!/bin/bash
# PreToolUse "ask" 卡点演示脚本
# 为什么单独成脚本：不改动原 logger 的"放行+落日志"行为；
# 返回 ask 决策时，TRAE 会在工具执行前弹确认框，由用户人工决定是否放行。
# 注意：hook 配置在会话启动时加载，需新会话才能生效。
# 验证完若不想保留：删除本脚本，并移除 hooks.json 中 matcher 为 "WebSearch|WebFetch" 的 Hook 组。

echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"hook ask 卡点演示：请人工确认是否放行本次工具调用"}}'
exit 0
