/*
 * @Author: 毛毛
 * @Date: 2022-04-15 20:43:57
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 21:57:13
 * 合并对象的方法
 */
import { strategy } from "./strategy";
/**
 * 合并选项
 * @param  {...any} options 
 * @returns 
 */
export function mergeOptions(...options) {
  const opts = {};
  const [source1, source2] = options;
  for (const key in source1) {
    mergeField(key);
  }
  for (const key in source2) {
    if (!source1.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    // 策略模式 减少 if / else
    if (strategy[key]) {
      opts[key] = strategy[key](source1[key], source2[key]);
    }
    // 优先采用用户的选项 再采用全局已存在的
    else opts[key] = source2[key] === void 0 ? source1[key] : source2[key];
  }
  if (options.length > 2) {
    options.splice(0, 2)
    return mergeOptions(opts, ...options);
  }
  return opts;
}
