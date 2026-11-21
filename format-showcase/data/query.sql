-- AI 研发效能：按任务类型汇总与改进区筛选
-- 数据来源：data/metrics.json（示例数据集）

WITH task_metrics AS (
    SELECT
        task_type            AS task_type,
        tasks                AS tasks,
        automation_rate      AS automation_rate,
        avg_minutes          AS avg_minutes,
        first_pass_rate      AS first_pass_rate,
        cost_cny             AS cost_cny
    FROM task_types
)
SELECT
    task_type,
    tasks,
    automation_rate,
    avg_minutes,
    first_pass_rate,
    cost_cny,
    CASE
        WHEN automation_rate >= 85 THEN '高自动化区'
        WHEN automation_rate <  65 THEN '重点改进区'
        ELSE '平稳区'
    END                            AS segment,
    ROUND(cost_cny * tasks, 2)      AS total_cost_cny,
    ROUND(tasks * avg_minutes / 60, 2) AS total_hours
FROM task_metrics
ORDER BY automation_rate ASC;

-- 整体加权指标
SELECT
    SUM(tasks)                                             AS total_tasks,
    ROUND(SUM(cost_cny * tasks) / SUM(tasks), 2)            AS weighted_cost_cny,
    ROUND(SUM(automation_rate * tasks) / SUM(tasks), 2)     AS weighted_automation_rate,
    ROUND(SUM(first_pass_rate * tasks) / SUM(tasks), 2)     AS weighted_first_pass_rate,
    ROUND(SUM(avg_minutes * tasks) / SUM(tasks), 2)         AS weighted_avg_minutes
FROM task_types;
