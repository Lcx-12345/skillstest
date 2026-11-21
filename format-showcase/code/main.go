// AI 研发效能汇总（Go 版）
// 运行: go run main.go
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
)

type TaskRow struct {
	TaskType       string  `json:"task_type"`
	Tasks          int     `json:"tasks"`
	AutomationRate float64 `json:"automation_rate"`
	AvgMinutes     float64 `json:"avg_minutes"`
	FirstPassRate  float64 `json:"first_pass_rate"`
	CostCNY        float64 `json:"cost_cny"`
}

type Dataset struct {
	TaskTypes []TaskRow `json:"task_types"`
}

func segment(rate float64) string {
	switch {
	case rate >= 80:
		return "高自动化区"
	case rate < 65:
		return "重点改进区"
	default:
		return "平稳区"
	}
}

func main() {
	raw, err := os.ReadFile("../data/metrics.json")
	if err != nil {
		fmt.Fprintln(os.Stderr, "读取数据失败:", err)
		os.Exit(1)
	}
	var ds Dataset
	if err := json.Unmarshal(raw, &ds); err != nil {
		fmt.Fprintln(os.Stderr, "解析 JSON 失败:", err)
		os.Exit(1)
	}

	totalTasks, totalCost := 0, 0.0
	var wAuto, wPass, wMinutes float64
	for _, r := range ds.TaskTypes {
		totalTasks += r.Tasks
		totalCost += r.CostCNY * float64(r.Tasks)
		wAuto += r.AutomationRate * float64(r.Tasks)
		wPass += r.FirstPassRate * float64(r.Tasks)
		wMinutes += r.AvgMinutes * float64(r.Tasks)
	}

	sort.Slice(ds.TaskTypes, func(i, j int) bool {
		return ds.TaskTypes[i].AutomationRate < ds.TaskTypes[j].AutomationRate
	})
	fmt.Printf("%-16s%8s%10s%10s%10s%8s  %s\n", "任务类型", "任务数", "自动化率", "耗时(m)", "通过率", "成本", "分区")
	for _, r := range ds.TaskTypes {
		fmt.Printf("%-16s%8d%9.1f%%%10.1f%9.1f%%%8.1f  %s\n",
			r.TaskType, r.Tasks, r.AutomationRate, r.AvgMinutes, r.FirstPassRate, r.CostCNY,
			segment(r.AutomationRate))
	}
	t := float64(totalTasks)
	fmt.Printf("\n合计 %d 个任务 | 自动化率 %.1f%% | 通过率 %.1f%% | 耗时 %.1fm | 总成本 ¥%.2f\n",
		totalTasks, wAuto/t, wPass/t, wMinutes/t, totalCost)
}
