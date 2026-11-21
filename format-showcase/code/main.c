/* AI 研发效能汇总（C 版）
 * 编译: gcc -std=c11 -o metrics main.c && ./metrics
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_ROWS 32

typedef struct {
    char task_type[32];
    int tasks;
    double automation_rate;
    double avg_minutes;
    double first_pass_rate;
    double cost_cny;
} TaskRow;

static const char *segment(double rate) {
    if (rate >= 80.0) return "高自动化区";
    if (rate < 65.0) return "重点改进区";
    return "平稳区";
}

/* 极简解析：读取固定顺序的 CSV 列 */
static int load_csv(const char *path, TaskRow *rows) {
    FILE *fp = fopen(path, "r");
    if (!fp) { perror(path); return -1; }
    char line[256];
    int count = 0;
    if (!fgets(line, sizeof line, fp)) { fclose(fp); return 0; } /* 跳过表头 */
    while (count < MAX_ROWS && fgets(line, sizeof line, fp)) {
        TaskRow r;
        char type[32];
        if (sscanf(line, "%31[^,],%d,%lf,%lf,%lf,%lf",
                   type, &r.tasks, &r.automation_rate, &r.avg_minutes,
                   &r.first_pass_rate, &r.cost_cny) == 6) {
            strncpy(r.task_type, type, sizeof r.task_type - 1);
            r.task_type[sizeof r.task_type - 1] = '\0';
            rows[count++] = r;
        }
    }
    fclose(fp);
    return count;
}

int main(int argc, char **argv) {
    const char *path = argc > 1 ? argv[1] : "../data/metrics.csv";
    TaskRow rows[MAX_ROWS];
    int n = load_csv(path, rows);
    if (n <= 0) return 1;

    double total_tasks = 0, w_auto = 0, w_pass = 0, w_min = 0, cost = 0;
    for (int i = 0; i < n; i++) {
        total_tasks += rows[i].tasks;
        w_auto += rows[i].automation_rate * rows[i].tasks;
        w_pass += rows[i].first_pass_rate * rows[i].tasks;
        w_min += rows[i].avg_minutes * rows[i].tasks;
        cost += rows[i].cost_cny * rows[i].tasks;
    }

    for (int i = 0; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            if (rows[j].automation_rate < rows[i].automation_rate) {
                TaskRow t = rows[i]; rows[i] = rows[j]; rows[j] = t;
            }
        }
    }

    printf("%-16s%8s%10s%10s%10s%8s  %s\n", "任务类型", "任务数", "自动化率", "耗时(m)", "通过率", "成本", "分区");
    for (int i = 0; i < n; i++) {
        printf("%-16s%8d%9.1f%%%10.1f%9.1f%%%8.1f  %s\n",
               rows[i].task_type, rows[i].tasks, rows[i].automation_rate,
               rows[i].avg_minutes, rows[i].first_pass_rate, rows[i].cost_cny,
               segment(rows[i].automation_rate));
    }
    printf("\n合计 %.0f 个任务 | 自动化率 %.1f%% | 通过率 %.1f%% | 耗时 %.1fm | 总成本 ¥%.2f\n",
           total_tasks, w_auto / total_tasks, w_pass / total_tasks,
           w_min / total_tasks, cost);
    return 0;
}
