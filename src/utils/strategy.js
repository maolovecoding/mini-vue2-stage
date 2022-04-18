/*
 * @Author: 毛毛
 * @Date: 2022-04-15 20:52:34
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-18 00:50:40
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

// 组件的合并策略
strategy.components = function (parentVal, childVal) {
  // TODO 这里这种做法不一定很好 该条件是不是应该有还应该考究 有了该条件 全局的组件定义的位置不同 可能最后的结果不同
  // 已经和全局组件对象创建关系了，则不需要再次建立关系 直接返回
  // if (Object.getPrototypeOf(parentVal) === Vue.options.components)
  //   return parentVal;
  // 通过父亲 创建一个对象 原型上有父亲的所有属性和方法
  const res = Object.create(parentVal); // {}.__proto__ = parentVal
  if (childVal) {
    for (const key in childVal) {
      // 拿到所有的孩子的属性和方法
      res[key] = childVal[key];
    }
  }
  console.log(res);
  return res;
};
