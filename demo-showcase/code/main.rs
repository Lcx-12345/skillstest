// Rust 演示
fn main() {
    let tools = vec!["Write", "Read", "Edit", "Glob", "Grep"];
    println!("内置工具数量: {}", tools.len());
    for (i, t) in tools.iter().enumerate() {
        println!("  {}. {}", i + 1, t);
    }
}
