class MaxHeap {
  heapArr: number[] = [];
  
  /**
   * 向下对比和交换，对应堆顶删除之后的操作
   * @param {number} low 下界
   * @param {number} high 上界
   */
  downHeap(low: number, high: number) {
    let i = low;
    let j = i * 2 + 1;
    while(j <= high) {
      // 如果右孩子比左孩子大，右孩子进行比较
      if (j + 1 <= high && this.heapArr[j+1] > this.heapArr[j]) {
        j++;
      }
      // 如果j上的元素比i上的元素大，则向下替换
      if (this.heapArr[j] > this.heapArr[i]) {
        let temp = this.heapArr[i];
        this.heapArr[i] = this.heapArr[j];
        this.heapArr[j] = temp;
        i = j;
        j = i * 2 + 1;
      } else {
        // 跳出循环
        break;
      }
    }
  }

  // 向上对比和交换，对应堆新增元素之后的操作
  upHead(low: number, high: number) {
    let i = high;
    let j = Math.floor((i - 1) / 2);
    while (j >= low) {
      // 如果i上的元素比j删的元素大，则向上替换
      if (this.heapArr[i] > this.heapArr[j]) {
        let temp = this.heapArr[i];
        this.heapArr[i] = this.heapArr[j];
        this.heapArr[j] = temp;
        i = j;
        j = Math.floor((i - 1) / 2);
      } else {
        break;
      }
    }
  }
}