/**
 * @description 防抖函数
 * @param{T} func 函数
 * @param{number} delay 延迟
 *  */
export default function debounce(func, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
