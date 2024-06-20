function triggerValue() {
  // 51.3%的概率触发2852
  return Math.random() < 0.60 ? 2852 : 0;
}

function simulateTrigger(duration) {
  const interval = 1000; // 每秒触发一次
  const endTime = Date.now() + duration;

  const intervalId = setInterval(() => {
    const result = triggerValue();
    console.log(result);

    // 检查是否到达结束时间
    if (Date.now() >= endTime) {
      clearInterval(intervalId);
    }
  }, interval);
}

// 模拟10秒的触发过程
simulateTrigger(10000);
