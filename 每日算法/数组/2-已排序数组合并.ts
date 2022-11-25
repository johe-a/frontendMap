/**
 * 已排序数组合并:
 * 1. [1,2,3]
 * 2. [0,4,5]
 * 目标数组： [0,1,2,3,4,5]
 */
const a = [3,11,13];
const b = [0,4,5,12,14];

/**
 * 合并两个已排序的数组
 * @param {number[]} arrOne 
 * @param {number[]} arrTwo 
 */
function combineTwoSortedArray(arrOne: number[], arrTwo: number[]): number[] {
  /**
   * keyPoint:
   * 双指针，分别处于两个数组的起始点
   * 通过双指针的比较来移动指针，直到其中一个指针移动到数组末尾
   */
  let pointOne = 0;
  let pointTwo = 0;
  const targetArr: number[] = [];
  if (arrOne.length === 0) {
    return arrTwo;
  }
  if (arrTwo.length === 0) {
    return arrOne;
  }
  while(pointOne < arrOne.length && pointTwo < arrTwo.length) {
    const curNumberOne = arrOne[pointOne];
    const curNumberTwo = arrTwo[pointTwo];
    if (curNumberOne <= curNumberTwo) {
      targetArr.push(curNumberOne);
      pointOne++;
    } else {
      targetArr.push(curNumberTwo);
      pointTwo++;
    }
  }
  if (pointOne < arrOne.length) {
    targetArr.push(...arrOne.slice(pointOne, arrOne.length));
  }
  if (pointTwo < arrTwo.length) {
    targetArr.push(...arrTwo.slice(pointTwo, arrTwo.length));
  }
  return targetArr;
}

console.log(combineTwoSortedArray(a, b));


/**
 * 合并两个有序数组
 * 使用双指针，对双指针当前所处位置的数字进行比较，谁较小就插入新数组内部，并且指针向后移动一步，直到某一指针到达数组尾部，将另一数组的后续成员插入
 * @param arr 
 * @param arr2 
 */
function combineTwoSortArray(arr: number[], arr2: number[]) {
  let i = 0;
  let j = 0;
  const result: number[] = [];
  while(i < arr.length && j < arr2.length) {
    const curArrNumber = arr[i];
    const curArr2Number = arr2[j];
    if (curArrNumber < curArr2Number) {
      result.push(curArrNumber);
      i++;
    } else {
      result.push(curArr2Number);
      j++;
    }
  }
  if (i === arr.length) {
    result.push(...arr2.slice(j));
  } else {
    result.push(...arr.slice(i));
  }
  return result;
}

console.log(combineTwoSortArray(a, b));