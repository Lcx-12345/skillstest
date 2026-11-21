// AI 研发效能汇总（C++17 版）
// 编译: g++ -std=c++17 -O2 -o metrics main.cpp && ./metrics
#include <algorithm>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

struct TaskRow {
    std::string task_type;
    int tasks{};
    double automation_rate{};
    double avg_minutes{};
    double first_pass_rate{};
    double cost_cny{};
};

namespace {
std::string_view segment(double rate) {
    if (rate >= 80.0) return "高自动化区";
    if (rate < 65.0) return "重点改进区";
    return "平稳区";
}

std::vector<TaskRow> load_csv(const std::string& path) {
    std::vector<TaskRow> rows;
    std::ifstream fp(path);
    std::string line;
    std::getline(fp, line);  // 跳过表头
    while (std::getline(fp, line)) {
        std::stringstream ss(line);
        std::string cell;
        TaskRow r;
        std::vector<std::string> cells;
        while (std::getline(ss, cell, ',')) cells.push_back(cell);
        if (cells.size() < 6) continue;
        r.task_type = cells[0];
        r.tasks = std::stoi(cells[1]);
        r.automation_rate = std::stod(cells[2]);
        r.avg_minutes = std::stod(cells[3]);
        r.first_pass_rate = std::stod(cells[4]);
        r.cost_cny = std::stod(cells[5]);
        rows.push_back(r);
    }
    return rows;
}
}  // namespace

int main(int argc, char** argv) {
    const std::string path = argc > 1 ? argv[1] : "../data/metrics.csv";
    auto rows = load_csv(path);
    if (rows.empty()) {
        std::cerr << "未读取到数据: " << path << '\n';
        return 1;
    }

    double total_tasks = 0, w_auto = 0, w_pass = 0, w_min = 0, cost = 0;
    for (const auto& r : rows) {
        total_tasks += r.tasks;
        w_auto += r.automation_rate * r.tasks;
        w_pass += r.first_pass_rate * r.tasks;
        w_min += r.avg_minutes * r.tasks;
        cost += r.cost_cny * r.tasks;
    }
    std::sort(rows.begin(), rows.end(),
              [](const TaskRow& a, const TaskRow& b) { return a.automation_rate < b.automation_rate; });

    std::cout << std::left << std::setw(18) << "任务类型" << std::right
              << std::setw(8) << "任务数" << std::setw(10) << "自动化率"
              << std::setw(10) << "耗时(m)" << std::setw(10) << "通过率"
              << std::setw(9) << "成本" << "  分区\n";
    for (const auto& r : rows) {
        std::cout << std::left << std::setw(18) << r.task_type << std::right
                  << std::setw(8) << r.tasks << std::setw(9) << std::fixed << std::setprecision(1)
                  << r.automation_rate << '%' << std::setw(10) << r.avg_minutes
                  << std::setw(9) << r.first_pass_rate << '%' << std::setw(9) << r.cost_cny
                  << "  " << segment(r.automation_rate) << '\n';
    }
    std::cout << std::fixed << std::setprecision(1)
              << "\n合计 " << static_cast<long long>(total_tasks) << " 个任务 | 自动化率 "
              << w_auto / total_tasks << "% | 通过率 " << w_pass / total_tasks
              << "% | 耗时 " << w_min / total_tasks << "m | 总成本 ¥" << std::setprecision(2)
              << cost << '\n';
    return 0;
}
