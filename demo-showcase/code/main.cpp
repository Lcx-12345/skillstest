#include <iostream>
#include <string>
#include <vector>

// C++ 演示
int main() {
    std::vector<std::string> tools{"RunCommand", "WebSearch", "GenerateImage"};
    for (const auto& t : tools) {
        std::cout << "- " << t << std::endl;
    }
    return 0;
}
