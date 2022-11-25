// 判断一个字符串是否为回文字符串
// 例如 'yessey'

function isPalindrome(str: string) {
  
  return str === str.split('').reverse().join('');
}

function isPalindrome2(str: string) {
  const length = str.length;
  let i = 0;
  let j = length -1;
  while(i <= j) {
    if (str[i] !== str[j]) {
      return false;
    }
    i++;
    j--;
  }
  return true;
}

console.log(console.time('first'));
console.log(isPalindrome('yessey'));
console.log(isPalindrome('yesey'));
console.log(isPalindrome('yestey'));
console.log(console.timeEnd('first'));
console.log(console.time('second'));
console.log(isPalindrome2('yessey'));
console.log(isPalindrome('yesey'));
console.log(isPalindrome('yestey'));
console.log(console.timeEnd('second'));
