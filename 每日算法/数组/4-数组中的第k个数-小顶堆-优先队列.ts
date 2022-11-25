/**
 * 题目描述：在未排序的数组中找到第 k 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。
 * 示例 1:
 * 输入: [3,2,1,5,6,4] 和 k = 2
 * 输出: 5
 */

/**
 * 思路：构建小顶堆
 * 先用前k个元素构建小顶堆，则堆顶是前k个元素最小的，而我们要求出的是[0, n-1]之间的第k个最大元素。
 * 既然已经求出[0, k-1]中最小的元素，我们只要遵循如下操作就能求出第k个最大元素，使用[k, n-1]的元素来更新小顶堆
 * 1. 当元素大于小顶堆堆顶，则插入
 * 2. 当元素小于小顶堆堆顶，则忽略
 * 因为[k, n-1]更新堆的过程中，只允许比堆顶大的元素进入，那么在最后，这个规模为k的小顶堆，堆顶元素比其余k-1个元素都小，所以它是第k大的元素
 */
function findKthLargest(arr: number[], k: number) {
  // 维护一个k大小的小顶堆
  const heap: number[] = [];

  function upHeap(low: number, high: number) {
    let i = high;
    let j = Math.floor((i - 1) / 2);
    while (j >= low) {
      if (heap[i] < heap[j]) {
        let temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
        i = j;
        j = Math.floor((i - 1) / 2);
      } else {
        break;
      }
    }
  }

  function downHeap(low: number, high: number) {
    let i = low;
    let j = i * 2 + 1;
    while(j <= high) {
      if (j + 1 <= high && heap[j+1] < heap[j]) {
        j = j + 1;
      }
      if (heap[i] > heap[j]) {
        let temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
        i = j;
        j = i * 2 + 1;
      } else {
        break;
      }
    }
  } 

  function insert(num: number) {
    heap.push(num);
    upHeap(0, heap.length - 1);
  }

  // 创建一个k大小的小顶堆
  function initMinHeap() {
    for(let i = 0; i < k; i ++) {
      insert(arr[i]);
    }
  }

  function adjustHeap() {
    for(let i = k; i < arr.length; i ++) {
      // 当前元素大于小顶堆，说明小顶堆不再是第k大元素，需要移除，新插入元素放在堆顶之后进行调整
      if (arr[i] > heap[0]) {
        heap[0] = arr[i];
        downHeap(0, k);
      }
    }
  }

  initMinHeap();
  adjustHeap();
  return heap[0];
}