for i in range(len(arr)):
    if arr[i] < pivot:
        left.append(arr[i])
    elif arr[i] == pivot:
        middle.append(arr[i])
    else:
        right.append(arr[i])
