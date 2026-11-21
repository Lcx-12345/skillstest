/**
 * AI 研发效能汇总（TypeScript 版）
 * 运行: npx tsx analyze.ts
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface TaskRow {
  task_type: string;
  tasks: number;
  automation_rate: number;
  avg_minutes: number;
  first_pass_rate: number;
  cost_cny: number;
}

interface Dataset {
  task_types: TaskRow[];
  monthly_trend: { month: string; tasks: number; avg_minutes: number; automation_rate: number }[];
}

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(resolve(here, "..", "data", "metrics.json"), "utf-8"),
) as Dataset;

const totalTasks = data.task_types.reduce((s, r) => s + r.tasks, 0);
const weighted = (key: keyof Omit<TaskRow, "task_type">) =>
  data.task_types.reduce((s, r) => s + r[key] * r.tasks, 0) / totalTasks;

const segment = (rate: number) =>
  rate >= 80 ? "高自动化区" : rate < 65 ? "重点改进区" : "平稳区";

console.log("任务类型\t任务数\t自动化率\t耗时(m)\t通过率\t成本\t分区");
for (const r of [...data.task_types].sort((a, b) => a.automation_rate - b.automation_rate)) {
  console.log(
    [
      r.task_type,
      r.tasks,
      `${r.automation_rate}%`,
      r.avg_minutes,
      `${r.first_pass_rate}%`,
      `¥${r.cost_cny}`,
      segment(r.automation_rate),
    ].join("\t"),
  );
}
console.log(
  `\n合计 ${totalTasks} 个任务 | 自动化率 ${weighted("automation_rate").toFixed(1)}% | ` +
    `通过率 ${weighted("first_pass_rate").toFixed(1)}% | 耗时 ${weighted("avg_minutes").toFixed(1)}m`,
);
