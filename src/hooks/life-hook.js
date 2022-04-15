/*
 * @Author: 毛毛
 * @Date: 2022-04-15 21:16:58
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 21:20:16
 * 执行生命周期的hook
 */

export function callHook(vm, hook) {
  const handles = vm.$options[hook];
  // 生命周期的钩子的this 都是当前实例
  handles?.forEach((handle) => handle.call(vm));
}
