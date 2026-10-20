# 人员信息示例
# 以字典结构保存，便于后续扩展更多字段（如邮箱、地址等）

person = {
    "name": "lcx",              # 姓名
    "phone": "13800138000",      # 电话
    "id_card": "44030519900101001X",  # 身份证号码
}

if __name__ == "__main__":
    print(f"姓名: {person['name']}")
    print(f"电话: {person['phone']}")
    print(f"身份证号码: {person['id_card']}")


def test_person():
    assert person["name"] == "lcx"
    assert person["phone"] == "13800138000"
    assert person["id_card"] == "44030419900101001X"
