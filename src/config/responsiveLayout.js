import debounce from "./debounce";

/**
 * @description 用于响应式设计的字体大小调整脚本，主要用于根据设备屏幕宽度动态调整页面根元素的字体大小，以实现页面在不同设备上的适配。
 *  */
export default function responsiveLayout() {
  const doc = document;
  const win = window;
  const docEl = doc.documentElement;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const dpr = isIOS ? Math.min(win.devicePixelRatio, 3) : 1;
  const scale = 1 / dpr;

  // 设置viewport meta标签
  let metaEl = doc.querySelector('meta[name="viewport"]');
  if (!metaEl) {
    metaEl = doc.createElement("meta");
    metaEl.name = "viewport";
    doc.head.appendChild(metaEl);
  }
  metaEl.content = `initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}`;

  // 设置根元素字体大小
  function setRemUnit() {
    const width = docEl.clientWidth;
    const rem = 100 * (width / 750); // 设计稿宽度为750px，根元素字体大小基准为100px
    docEl.style.fontSize = rem + "px";
  }

  // 初始化
  setRemUnit();

  // 监听窗口变化，重新计算根元素字体大小
  win.addEventListener("resize", debounce(setRemUnit, 200));
  win.addEventListener("orientationchange", debounce(setRemUnit, 200));
}
