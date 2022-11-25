/**
 * 真题描述：给定一个非空字符串 s，最多删除一个字符。判断是否能成为回文字符串。
 * 示例 1: 输入: "aba"
 * 输出: True
 * 示例 2:
 * 输入: "abca"
 * 输出: True
 * 解释: 你可以删除c字符。
 * 注意: 字符串只包含从 a-z 的小写字母。字符串的最大长度是50000。
 * 思路分析: 
 * 利用回文特性（头尾一一对称），判断删除后是否满足回文字符串
 */

function checkPalindrome(str: string) {
  let i = 0;
  let j = str.length - 1;
  while(i <= j) {
    if (str[i] !== str[j]) {
      return false;
    }
    i++;
    j--;
  }
  return true;
}

function isPalindromeAfterDelete(str: string) {
  let deleteChar = '';
  let i = 0;
  let j = str.length - 1;
  while(i <= j) {
    if (str[i] === str[j]) {
      i++;
      j--;
    }
    const isPalindromeAfterDeleteLeft = checkPalindrome(str.slice(i + 1, j + 1));
    const isPalindromeAfterDeleteRight = checkPalindrome(str.slice(i, j));
    if (isPalindromeAfterDeleteRight) {
      deleteChar = str[j];
    }
    if (isPalindromeAfterDeleteLeft) {
      deleteChar = str[i];
    }
    console.log(deleteChar);
    return isPalindromeAfterDeleteLeft || isPalindromeAfterDeleteRight;
  }
  console.log(deleteChar);
  return true;
}

console.log(isPalindromeAfterDelete('abca'))