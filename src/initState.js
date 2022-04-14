import { isFunction } from "./utils";
import { observe } from "./observe";
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    enumerable: true,
    get() {
      return vm[target][key];
    },
    set(newVal) {
      vm[target][key] = newVal;
    },
  });
}
/**
 * 初始化实例
 * @param {*} vm vue实例
 */
function initState(vm) {
  const opts = vm.$options; // 获取所有选项
  if (opts.data) {
    // data 初始化
    initData(vm);
  }
}
/**
 * 初始化 data
 * @param {*} vm 实例
 */
function initData(vm) {
  // data可能是函数 也可能是对象
  let data = vm.$options.data;
  // data是函数 执行一下
  if (isFunction(data)) data = data.call(vm);
  Object.defineProperty(vm, "_data", {
    configurable: true,
    // enumerable: false,
    writable: true,
    value: data,
  });
  console.log("initData------------>", data);
  // 数据劫持
  observe(data);
  // 把 vm._data 用vm来代理 访问 vm.name -> vm._data.name
  for (const key in data) {
    proxy(vm, "_data", key);
  }
}

export { initState };
