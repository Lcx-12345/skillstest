#!/usr/bin/env python3
"""读取 metrics.json，输出 AI 研发效能汇总，并可导出 PNG 图表。

用法:
    python3 analyze.py [--data ../data/metrics.json] [--chart ../media/chart_avg_minutes.png]
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys

WARN_AUTOMATION = 65.0
GOOD_AUTOMATION = 80.0


def load(path: pathlib.Path) -> dict:
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def segment(rate: float) -> str:
    if rate >= GOOD_AUTOMATION:
        return "高自动化区"
    if rate < WARN_AUTOMATION:
        return "重点改进区"
    return "平稳区"


def summarize(data: dict) -> dict:
    rows = data["task_types"]
    total_tasks = sum(r["tasks"] for r in rows)
    weighted = {
        "automation_rate": sum(r["automation_rate"] * r["tasks"] for r in rows) / total_tasks,
        "first_pass_rate": sum(r["first_pass_rate"] * r["tasks"] for r in rows) / total_tasks,
        "avg_minutes": sum(r["avg_minutes"] * r["tasks"] for r in rows) / total_tasks,
    }
    total_cost = sum(r["cost_cny"] * r["tasks"] for r in rows)
    return {
        "total_tasks": total_tasks,
        "weighted": weighted,
        "total_cost": round(total_cost, 2),
        "avg_cost_per_task": round(total_cost / total_tasks, 4),
        "rows": rows,
    }


def print_table(summary: dict) -> None:
    print(f"{'任务类型':<16}{'任务数':>7}{'自动化率':>10}{'耗时(m)':>10}{'通过率':>10}{'成本':>8}  分区")
    print("-" * 78)
    for r in sorted(summary["rows"], key=lambda x: x["automation_rate"]):
        print(
            f"{r['task_type']:<16}{r['tasks']:>7}{r['automation_rate']:>9.1f}%"
            f"{r['avg_minutes']:>10.1f}{r['first_pass_rate']:>9.1f}%{r['cost_cny']:>8.1f}"
            f"  {segment(r['automation_rate'])}"
        )
    print("-" * 78)
    w = summary["weighted"]
    print(
        f"合计 {summary['total_tasks']} 个任务 | 加权自动化率 {w['automation_rate']:.1f}% | "
        f"加权通过率 {w['first_pass_rate']:.1f}% | 加权耗时 {w['avg_minutes']:.1f}m | "
        f"总成本 ¥{summary['total_cost']}"
    )


def save_chart(summary: dict, out: pathlib.Path) -> None:
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("未安装 matplotlib，跳过图表导出", file=sys.stderr)
        return

    rows = sorted(summary["rows"], key=lambda x: x["avg_minutes"], reverse=True)
    labels = [r["task_type"] for r in rows]
    values = [r["avg_minutes"] for r in rows]

    plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "DejaVu Sans"]
    plt.rcParams["axes.unicode_minus"] = False

    fig, ax = plt.subplots(figsize=(9, 5), dpi=150)
    bars = ax.bar(labels, values, color="#1C7293", edgecolor="#065A82", linewidth=0.8)
    ax.set_title("各任务类型平均耗时（分钟）", fontsize=14, fontweight="bold")
    ax.set_ylabel("平均耗时（分钟）")
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=30, ha="right", fontsize=9)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.bar_label(bars, fmt="%.1f", padding=2, fontsize=8)
    fig.tight_layout()
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    print(f"图表已写入: {out}")


def main() -> int:
    parser = argparse.ArgumentParser(description="AI 研发效能汇总分析")
    parser.add_argument("--data", type=pathlib.Path,
                        default=pathlib.Path(__file__).resolve().parent.parent / "data" / "metrics.json")
    parser.add_argument("--chart", type=pathlib.Path, default=None, help="可选：导出 PNG 图表路径")
    args = parser.parse_args()

    if not args.data.exists():
        print(f"找不到数据文件: {args.data}", file=sys.stderr)
        return 1

    summary = summarize(load(args.data))
    print_table(summary)
    if args.chart:
        save_chart(summary, args.chart)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
