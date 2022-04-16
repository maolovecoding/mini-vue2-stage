import { isFunction } from "./utils";
import { observe } from "./observe";
import Watcher from "./observe/watcher";
import Dep from "./observe/dep";
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
  // computed
  if (opts.computed) {
    initComputed(vm);
  }
  // watch
  if (opts.watch) {
    initWatch(vm);
  }
}
/**
 * 初始化watch
 * @param {Vue} vm
 */
function initWatch(vm) {
  const watch = vm.$options.watch;
  for (const key in watch) {
    // 字符串 数组 函数
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatch(vm, key, handler[i]);
      }
    } else {
      createWatch(vm, key, handler);
    }
  }
}
/**
 *
 * @param {*} vm
 * @param {string|Function} exprOrFn 侦听的值
 * @param {string|Function|object} handler 对象的情况没有考虑
 */
// TODO handler 还可以考虑对象的情况 name:{ handler(){} ...}
function createWatch(vm, exprOrFn, handler) {
  if (typeof handler === "string") {
    // name: "handler" -> methods["handler"]
    handler = vm[handler];
  }
  return vm.$watch(exprOrFn, handler);
}

/**
 * 初始化 data
 * @param {Vue} vm 实例
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
/**
 * 初始化 computed
 * @param {Vue} vm 实例
 */
function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {});
  for (const key in computed) {
    const userDef = computed[key];
    // function -> get
    // object -> {get(){}, set(newVal){}}
    let setter;
    const getter = isFunction(userDef)
      ? userDef
      : ((setter = userDef.set), getter);
    // 监控计算属性中 get的变化
    // 每次data的属性发生改变 重新执行的就是这个get
    // 传入额外的配置项 标明当前的函数 不需要立刻执行 只有在使用到计算属性了 才计算值
    // 把属性和watcher对应起来
    watchers[key] = new Watcher(vm, getter, { lazy: true });
    // 劫持每一个计算属性
    defineComputed(vm, key, setter);
  }
}
/**
 * 定义计算属性
 * @param {*} target
 * @param {*} key
 * @param {*} setter
 */
function defineComputed(target, key, setter) {
  Object.defineProperty(target, key, {
    // vm.key -> vm.get key this -> vm
    get: createComputedGetter(key),
    set: setter,
  });
}
/**
 * vue2.x 的计算属性 不会收集依赖，只是让计算属性依赖的属性去收集依赖
 * 创建一个懒执行（有缓存的）计算属性 判断值是否发生改变
 * 检查是否需要执行这个getter
 * @param {string} key
 */
function createComputedGetter(key) {
  // this -> vm 因为返回值给了计算属性的 get 我们是从 vm上取计算属性的
  return function lazyGetter() {
    // 对应属性的watcher
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      // 如果是脏的 就去执行用户传入的getter函数 watcher.get()
      // 但是为了可以拿到get的执行结果 我们调用 evaluate函数
      watcher.evaluate(); // dirty = false
    }
    // 计算属性watcher出栈后 还有渲染watcher（在视图中使用了计算属性）
    // 或者说是在其他的watcher中使用了计算属性
    if (Dep.target) {
      // 让计算属性的watcher依赖的变量也去收集上层的watcher
      watcher.depend();
    }
    return watcher.value;
  };
}
export { initState };
