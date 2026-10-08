"""Python 演示文件 - 由 Write 工具生成"""


def fibonacci(n: int) -> list[int]:
    """计算斐波那契数列的前 n 项"""
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]


def greet(name: str) -> str:
    """返回问候语（此函数由 Edit 工具追加）"""
    return f"你好，{name}！"


if __name__ == "__main__":
    print(greet("Trae"))
    print("斐波那契数列前 10 项:", fibonacci(10))
