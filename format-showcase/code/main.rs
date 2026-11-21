// AI 研发效能汇总（Rust 版）
// 运行: rustc main.rs -O -o metrics && ./metrics
use std::fs;

#[derive(Debug, Clone)]
struct TaskRow {
    task_type: String,
    tasks: f64,
    automation_rate: f64,
    avg_minutes: f64,
    first_pass_rate: f64,
    cost_cny: f64,
}

fn segment(rate: f64) -> &'static str {
    if rate >= 80.0 {
        "高自动化区"
    } else if rate < 65.0 {
        "重点改进区"
    } else {
        "平稳区"
    }
}

/// 极简 JSON 数值提取，避免为示例引入外部依赖
fn parse_rows(json: &str) -> Vec<TaskRow> {
    let mut rows = Vec::new();
    for chunk in json.split("\"task_type\"").skip(1) {
        let take = |key: &str| -> Option<f64> {
            let rest = chunk.split(&format!("\"{}\"", key)).nth(1)?;
            let after = rest.split(':').nth(1)?;
            let token: String = after
                .chars()
                .skip_while(|c| c.is_whitespace())
                .take_while(|c| c.is_ascii_digit() || *c == '.' || *c == '-')
                .collect();
            token.parse().ok()
        };
        if let (Some(name), Some(tasks), Some(auto), Some(mins), Some(pass), Some(cost)) = (
            chunk.split('"').nth(1),
            take("tasks"),
            take("automation_rate"),
            take("avg_minutes"),
            take("first_pass_rate"),
            take("cost_cny"),
        ) {
            rows.push(TaskRow {
                task_type: name.to_string(),
                tasks,
                automation_rate: auto,
                avg_minutes: mins,
                first_pass_rate: pass,
                cost_cny: cost,
            });
        }
    }
    rows
}

fn main() {
    let path = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "../data/metrics.json".to_string());
    let json = fs::read_to_string(&path).expect("读取数据失败");
    let mut rows = parse_rows(&json);
    rows.sort_by(|a, b| a.automation_rate.partial_cmp(&b.automation_rate).unwrap());

    let total_tasks: f64 = rows.iter().map(|r| r.tasks).sum();
    let w = |f: fn(&TaskRow) -> f64| rows.iter().map(|r| f(r) * r.tasks).sum::<f64>() / total_tasks;
    let cost: f64 = rows.iter().map(|r| r.cost_cny * r.tasks).sum();

    println!("{:16}{:>8}{:>10}{:>10}{:>10}{:>8}  {}", "任务类型", "任务数", "自动化率", "耗时(m)", "通过率", "成本", "分区");
    for r in &rows {
        println!(
            "{:16}{:>8}{:>9.1}%{:>10.1}{:>9.1}%{:>8.1}  {}",
            r.task_type,
            r.tasks as i64,
            r.automation_rate,
            r.avg_minutes,
            r.first_pass_rate,
            r.cost_cny,
            segment(r.automation_rate)
        );
    }
    println!(
        "\n合计 {} 个任务 | 自动化率 {:.1}% | 通过率 {:.1}% | 耗时 {:.1}m | 总成本 ¥{:.2}",
        total_tasks as i64,
        w(|r| r.automation_rate),
        w(|r| r.first_pass_rate),
        w(|r| r.avg_minutes),
        cost
    );
}
