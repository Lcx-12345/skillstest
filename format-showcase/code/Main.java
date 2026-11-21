import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

/** AI 研发效能汇总（Java 版） */
public class Main {

    record TaskRow(String taskType, int tasks, double automationRate,
                   double avgMinutes, double firstPassRate, double costCny) {}

    public static void main(String[] args) throws Exception {
        Path path = Paths.get(args.length > 0 ? args[0] : "../data/metrics.json");
        String json = Files.readString(path);

        List<TaskRow> rows = new ArrayList<>();
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(
                "\\{[^}]*\"task_type\"\\s*:\\s*\"([^\"]+)\"[^}]*\"tasks\"\\s*:\\s*(\\d+)[^}]*"
              + "\"automation_rate\"\\s*:\\s*([\\d.]+)[^}]*\"avg_minutes\"\\s*:\\s*([\\d.]+)[^}]*"
              + "\"first_pass_rate\"\\s*:\\s*([\\d.]+)[^}]*\"cost_cny\"\\s*:\\s*([\\d.]+)[^}]*}")
                .matcher(json);
        while (m.find()) {
            rows.add(new TaskRow(m.group(1), Integer.parseInt(m.group(2)),
                    Double.parseDouble(m.group(3)), Double.parseDouble(m.group(4)),
                    Double.parseDouble(m.group(5)), Double.parseDouble(m.group(6))));
        }

        int totalTasks = rows.stream().mapToInt(TaskRow::tasks).sum();
        double wAuto = rows.stream().mapToDouble(r -> r.automationRate() * r.tasks()).sum() / totalTasks;
        double wPass = rows.stream().mapToDouble(r -> r.firstPassRate() * r.tasks()).sum() / totalTasks;
        double wMin  = rows.stream().mapToDouble(r -> r.avgMinutes() * r.tasks()).sum() / totalTasks;
        double cost  = rows.stream().mapToDouble(r -> r.costCny() * r.tasks()).sum();

        System.out.printf("%-16s%8s%10s%10s%10s%8s  %s%n", "任务类型", "任务数", "自动化率", "耗时(m)", "通过率", "成本", "分区");
        rows.stream()
            .sorted(Comparator.comparingDouble(TaskRow::automationRate))
            .forEach(r -> System.out.printf("%-16s%8d%9.1f%%%10.1f%9.1f%%%8.1f  %s%n",
                    r.taskType(), r.tasks(), r.automationRate(), r.avgMinutes(),
                    r.firstPassRate(), r.costCny(), segment(r.automationRate())));
        System.out.printf("%n合计 %d 个任务 | 自动化率 %.1f%% | 通过率 %.1f%% | 耗时 %.1fm | 总成本 ¥%.2f%n",
                totalTasks, wAuto, wPass, wMin, cost);
    }

    private static String segment(double rate) {
        if (rate >= 80) return "高自动化区";
        if (rate < 65) return "重点改进区";
        return "平稳区";
    }
}
