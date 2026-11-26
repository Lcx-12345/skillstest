def quick_sort(arr):
    # 当数组长度小于等于1时直接返回，无需排序
    if len(arr) <= 1:
        return arr
    
    # 选择中间元素作为基准值
    pivot = arr[len(arr) // 2]
    
    # 划分三个区域：小于基准、等于基准、大于基准
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    # 递归排序左右部分后合并结果
    return quick_sort(left) + middle + quick_sort(right)
def quick01(arr):
    if len(arr)<=1:
        return arr