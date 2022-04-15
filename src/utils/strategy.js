/*
 * @Author: 毛毛 
 * @Date: 2022-04-15 20:52:34 
 * @Last Modified by:   毛毛 
 * @Last Modified time: 2022-04-15 20:52:34 
 * 导出mixin时用到的一些策略模式
 */
// 策略模式
export const strategy = {};
// 生命周期
const LIFE_CYCLE = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "update",
];
LIFE_CYCLE.forEach((hook) => {
  strategy[hook] = function (s1, s2) {
    if (s2) {
      if (s1) {
        // 合并选项
        // return s1.concat(s2);
        return [...s1, s2];
      } else {
        // 全局options没有 用户传递的有 变成数组
        return [s2];
      }
    } else {
      return s1;
    }
  };
});
