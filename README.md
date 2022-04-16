# vue-study

## vue2的常见源码实现

### rollup环境搭建

#### 安装rollup及其插件

```shell
npm i rollup rollup-plugin-babel @babel/core @babel/preset-env rollup-plugin-node-resolve -D
```

#### 编写配置文件 rollup.config.js

这个可以直接使用es module

```js
// rollup默认可以导出一个对象 作为打包的配置文件
import babel from "rollup-plugin-babel";
import resolve from 'rollup-plugin-node-resolve'
export default {
  // 入口
  input: "./src/index.js",
  // 出口
  output: {
    // 生成的文件
    file: "./dist/vue.js",
    // 全局对象 Vue 在global(浏览器端就是window)上挂载一个属性 Vue
    name: "Vue",
    // 打包方式 esm commonjs模块 iife自执行函数 umd 统一模块规范 -> 兼容cmd和amd
    format: "umd",
    // 打包后和源代码做关联
    sourcemap: true,
  },
  plugins: [
    babel({
      // 排除第三方模块
      exclude: "node_modules/**",
    }),
    // 自动找文件夹下的index文件
    resolve()
  ],
};


```

##### babel.config.js

```js
// babel config
module.exports =  {
  // 预设
  presets: ["@babel/preset-env"],
};

```

#### 编写脚本

```json
"scripts": {
    "dev": "rollup -cw"
  }
```

-c表示使用配置文件，-w表示监控文件变化。

#### element.outerHTML

`outerHTML`属性获取描述元素（包括其后代）的序列化HTML片段。它也可以设置为用从给定字符串解析的节点替换元素。

```html
  <div id="app">
    <h2>{{name}}</h2>
    <span>{{age}}</span>
  </div>
  <script>
    console.log(document.querySelector("#app").outerHTML)
    /*
    <div id="app">
      <h2>{{name}}</h2>
      <span>{{age}}</span>
    </div>
  */
  </script>
```

## 核心流程

  **vue的核心流程：**

  1. 创造响应式数据
  2. 模板编译 生成 ast
  3. ast 转为render函数 后续每次数据更新 只执行render函数(不需要再次进行ast的转换)
  4. render函数执行 生成 vNode节点（会使用到响应式数据）
  5. 根据vNode 生成 真实dom 渲染页面
  6. 数据更新 重新执行render

## 数据劫持

**Vue2中使用的是Object.definedProperty**，**Vue3中直接使用Proxy了**

## 模板编译为ast

vue2中使用的是正则表达式进行匹配，然后转换为ast树。

模板引擎 性能差 需要正则匹配 替换 vue1.0 没有引入虚拟dom的改变，vue2 采用虚拟dom 数据变化后比较虚拟dom的差异 最后更新需要更新的地方， 核心就是我们需要将模板变成我们的js语法 通过js语法生成虚拟dom，语法之间的转换 需要先变成抽象语法树AST 再组装为新的语法，这里就是把template语法转为render函数。

### ast转render

把生成的ast语法树，通过字符串拼接等方式转为render函数。
render函数内部主要用到：

1. _c函数：创建元素虚拟dom节点
2. _v函数：创建文本虚拟dom节点
3. _s函数：将函数内的变量字符串化

### render函数生成真实dom

调用render函数，会生成虚拟dom，然后把虚拟dom转为真实DOM，挂载到页面即可。

## 回忆流程

**核心流程：**

1. 数据处理成响应式，在 initState中处理的（针对对象来说主要是definedProperty，数组则是重写七个方法）
2. 模板编译：先把模板转成ast语法树，再把语法树生成**render函数**
3. 调用render函数，可能会进行变量的取值操作(_s函数内有变量)，产生对应的虚拟dom
4. 虚拟dom渲染为真实dom，挂载到页面即可

**完成了，虚拟和真实dom的渲染，也完成了响应式数据的处理，接下来需要进行视图和响应式数据的关联，在渲染页面的时候，收集依赖数据。**

1. 使用观察者模式实现依赖收集
2. 异步更新策略
3. mixin的实现原理

### 模板的依赖收集

要完成依赖的收集，很明显的就是，我们要如何得知，此模板在此次渲染的时候，用到了那些响应式数据。

我们可以给模板中的属性，增加一个**收集器（dep）**。这个收集器，是给每个属性单独增加的。页面渲染的时候，我们把渲染逻辑封装到watcher中。（其实就是手动更新视图的那两个方法app._update(app._render())）。让dep记住这个watcher即可，在属性变化了以后，可以找到对应的dep中存放的watcher，然后执行重新渲染页面。

这里面我们用到的方式其实就是**观察者模式**。

```js
/**
 * watcher 进行实际的视图渲染
 * 每个组件都有自己的watcher，可以减少每次更新页面的部分
 * 给每个属性都增加一个dep，目的就是收集watcher
 * 一个视图（组件）可能有很多属性，多个属性对应一个视图 n个dep对应1个watcher
 * 一个属性也可能对应多个视图（组件）
 * 所以 dep 和 watcher 是多对多关系
 * 
 * 每个属性都有自己的dep，属性就是被观察者
 * watcher就是观察者（属性变化了会通知观察者进行视图更新）-> 观察者模式
 */
class Watcher{}
```

先让watcher收集dep，如果dep已经收集过，则不会再次收集。当dep被收集的时候，我们也会让dep反向收集当前的watcher。实现二者的双向收集。

然后在响应式数据发送改变的时候，通知dep的观察者（watcher）进行视图更新。

![image-20220415105750259](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415105750259.png)

#### 视图同步渲染

此时，已经完成了响应式数据和视图的绑定，在数据发生改变的情况下，视图会同步更新。也就是说，我们更新了两次响应式数据，也会更新两次视图。

![image-20220415110028536](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415110028536.png)

正常情况下，更新两次视图是没有问题的，但是此时两次数据的更新发生在一次同步代码中，我们应该让视图的更新是异步的，这样在一次操作更新多个数据的情况下，也只会渲染一次视图，提高渲染速率。

**那么我们的想法就是合并更新，在所有的更新数据做完以后，在刷新页面。也就是批处理，事件环。**

#### 事件环

我们的期望就是，同步代码执行完毕之后，在执行视图的渲染（作为异步任务）。把更新操作延迟。

方法就是使用一个队列维护需要更新的watcher，第一次更新属性值的时候，就开启一个定时器，清空所有的watcher。后续的数据改变的操作，都不会再次开启定时器，只是会把需要更新的watcher再次入队列。（当然watcher我们会先去重）。

但是这个清空操作是在同步代码执行完毕后才会执行的。

```js
// watcher queue 本次需要更新的视图队列
let queue = [];
// watcher 去重  {0:true,1:true}
let has = {};
// 批处理 也可以说是防抖
let pending = false;
/**
 * 不管执行多少次update操作，但是我们最终只执行一轮刷新操作
 * @param {*} watcher
 */
function queueWatcher(watcher) {
  const id = watcher.id;
  // 去重
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    console.log(queue);
    if (!pending) {
      // 刷新队列 多个属性刷新 其实执行的只是第一次 合并刷新了
      setTimeout(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}
/**
 * 刷新调度队列 且清理当前的标识 has pending 等都重置
 * 先执行第一批的watcher，如果刷新过程中有新的watcher产生，再次加入队列即可
 */
function flushSchedulerQueue() {
  const flushQueue = [...queue];
  queue = [];
  has = {};
  pending = false;
  // 刷新视图 如果在刷新过程中 还有新的watcher 会重新放到queueWatcher中
  flushQueue.forEach((watcher) => watcher.run()); // run 就是执行render
}
```

#### nextTick

**原理：**

因为我们数据的更新和视图的更新不再是同步，导致我们在同步获取视图最新的dom元素时，可能出现获取的元素和视图实际显示的元素不一致的情况。于是出现了 **nextTick方法**

实际上：nextTick方法内部也是维护了一个异步回调队列，开启一个定时器，每次调用该方法传入回调，都是把回调函数放入队列，并不是每次调用nextTick方法都开启一个定时器（比较销毁性能）。再放入第一个回调函数的时候，开启定时器，后续的回调函数只放入队列而不会再次开启定时器了，。所以nextTick不是创建了异步任务，而是将这个任务维护到了队列而已。

**nextTick方法是同步还是异步？**

把任务（回调）放到队列是同步，实际执行任务是异步。

```js
// 任务队列
let callbacks = [];
// 是否等待任务刷新
let waiting = false;
/**
 * 刷新异步回调函数队列
 */
function flushCallbacks() {
  const cbs = [...callbacks];
  callbacks = [];
  waiting = false;
  cbs.forEach((cb) => cb());
}
/**
 * 异步批处理
 * 是先执行内部的回调 还是用户的？ 用个队列 排序
 * @param {Function} cb 回调函数
 */
export function nextTick(cb) {
  // 使用队列维护nextTick中的callback方法
  callbacks.push(cb);
  if (!waiting) {
    setTimeout(flushCallbacks, 0); // 刷新
    waiting = true;
  }
}
```

#### vue的nextTick

实际上，vue的nextTick方法，内部并没有直接使用原生的某一个异步api（比如promise，setTimeout等）。而是采用优雅降级的方法。

1. 内部先采用的是promise（ie不兼容）。
2. 有一个和Promise等价的 [MutationObserve](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)。也是异步微任务。（此API是H5的，只能在浏览器中使用）
3. 考虑ie浏览器专享的 setImmediate API。性能比settimeout好一些
4. 最后直接上setTimeout

**采用优雅降级的目的，**还是为了用户可以尽快看见页面的渲染。

```js
/**
 * 优雅降级  Promise -> MutationObserve -> setImmediate -> setTimeout(需要开线程 开销最大)
 */
let timerFunc = null;
if (Promise) {
  timerFunc = () => Promise.resolve().then(flushCallbacks);
} else if (MutationObserver) {
  // 创建并返回一个新的 MutationObserver 它会在指定的DOM发生变化时被调用（异步执行callback）。
  const observer = new MutationObserver(flushCallbacks);
  // TODO 创建文本节点的API 应该封装 为了方便跨平台
  const textNode = document.createTextNode(1);
  console.log("observer-----------------")
  // 监控文本值的变化
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => (textNode.textContent = 2);
} else if (setImmediate) {
  // IE平台
  timerFunc = () => setImmediate(flushCallbacks);
} else {
  timerFunc = () => setTimeout(flushCallbacks, 0);
}
```

对于vue3，肯定就不需要这种方式了，在不兼容ie的情况下，可以直接使用promise了。

![image-20220415150046818](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415150046818.png)

经过一次次处理，现在是可以在视图更新以后再去拿最新的dom了。

当然：对于更改值放在取值的下面，那么获取到的肯定还是旧的dom值。vue也是如此的。

![image-20220415150347883](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415150347883.png)

### mixin的实现

Vue的mixin，可以实现全局混入和局部混入。

全局混入对所有组件实例都生效。

**暂时我实现了生命周期的混入，对于data等其他特殊选项的合并还未处理。**

对于混入的生命周期，无论是一个还是多个相同的生命周期，最终我们都转为使用数组包裹，每个数组元素都是混入进来的生命周期。在创建组件实例的时候，把传入的选项和全局的Vue.options选项进行合并到实例上，实现混入效果。

![image-20220415220542253](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415220542253.png)

### computed

**计算属性：**

计算属性：依赖的值发生改变 才会重新执行用户的方法 计算属性需要维护一个dirty属性。而且在默认情况下，计算属性不会立刻执行，而是在用户取值的时候才会执行。

计算属性使用的两种方式：

```js
computed: {
    /**
      * 计算属性：依赖的值发生改变 才会重新执行用户的方法 计算属性需要维护一个dirty属性
      */
    // 只有get的计算属性
    fullName1() {
        return this.firstName + " " + this.lastName
    },
        // getter and setter
        fullName2: {
            get() {
                return this.firstName + " " + this.lastName
            },
                set(newVal) {
                    [this.firstName, this.lastName] = newVal.split(" ")
                }
        }
}
```

**特点：**

1. 计算属性本身就是一个defineProperty，响应式数据
2. 计算属性也是一个Watcher，默认渲染会创造一个渲染watcher
3. 如果watcher中有lazy属性，表明这是一个计算属性watcher
4. 计算属性维护了一个dirty，当我们直接修改计算属性的值，或者修改了计算属性依赖的值，那么计算属性自己的值并不会直接发生改变，而是使dirty的值发生改变。
5. 当dirty为false的时候，表示依赖的值没有发生改变，不需要再次计算，直接使用上次缓存的值即可。
6. 计算属性自身不会收集依赖，而是让计算属性依赖的属性去收集依赖（watcher）

```js
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
```

![image-20220416140102371](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416140102371.png)

![image-20220416140057050](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416140057050.png)

### watch的实现

watch选项是一个对象，每个watch的属性作为键，

1. 如果watch的属性直接是一个函数，那么会在属性值发生改变后，给该函数传入两个参数，新值和旧值。

   ```js
   // 就是一个观察者
   firstName(newVal, oldVal) {
       console.log(newVal, oldVal)
   }
   ```

2. watch的属性是一个数组，数组元素可以是直接定义的函数，也可以是methods中的字符串函数名

   ```js
   // 就是一个观察者
   firstName:[
       function (newVal, oldVal) {
       console.log(newVal, oldVal)
   },
       function (newVal, oldVal) {
       console.log(newVal, oldVal)
   }
             ]
   ```

3. watch也可以是一个methods中的字符串函数名

4. vm.$watch，上面三种的定义方式，最终都是转为vm.$watch的形式

   ```js
   const unwatch  = vm.$watch(()=>vm.firstName, (newVal)=>{},options)// 额外选项options
   // 取消watch
   unwatch()
   
   vm.$watch(() => vm.firstName + vm.lastName, (newVal) => {
         console.log("类似侦听未定义的计算属性了",newVal)
       })
       // 是字符串 则不需要再属性前加vm
       vm.$watch("firstName", (newVal) => {
         console.log(newVal)
       })
   ```

   ![image-20220416160038397](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416160038397.png)

![image-20220416160128191](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416160128191.png)

### 数组和对象元素更新实现原理

在vue中，我们知道数组有七个变异方法（会修改数组自身元素的方法），vue对这七个方法实现了重写，不然正常情况下我们使用这七个方法是没有办法实现响应式更新视图的。

而且对于一个对象，如果我们修改的是对象已经在data中定义好的对象的属性，当然是可以进行响应式更新的，但是，如果我们新增一个属性，视图是没有办法实现响应式更新的。

正常情况下，只有我们让数组属性的值变为一个新数组，或者对象属性变为一个新对象，这样才能让对于没有劫持的数组元素或者对象属性给劫持下来。

![image-20220416172738629](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416172738629.png)

```js
// 数组数据响应式更新原理
const vm = new Vue({
    data: {
        arr: ["海贼王", "火影忍者", "名侦探柯南"],
        obj: { name: "张三" }
    },
    el: "#app",
    // 模板编译为虚拟dom的时候，从arr对象取值了 _v(_s(变量)) JSON.stringify() 
    // 所以对象会收集依赖
    template: `
<div id="app">
<ul>
<li>{{arr[0]}}</li>
<li>{{arr[1]}}</li>
<li>{{arr[2]}}</li>
<li>{{obj}}</li>
</ul>
</div>
`
})
setTimeout(() => {
    // 这种修改方式无法监控
    vm.arr[1] += 1
    // 也不会刷新视图
    vm.arr.length = 10;
    // 7个数组的变异方法可以监控到 因为我们重写了
    // 这里并没有改变 arr属性 只是改变了arr这个数组对象
    // arr数组对象自身并没有改变（没有变成新数组，地址没改变）
    vm.arr.push("12")
    vm.obj.age = 22
    console.log("1秒后更新。。。",vm.arr,vm.obj)
}, 1000)
```

**所以我们为了能劫持修改数组自身和给对象新增属性等，也可以被Vue劫持，我们需要在数组，对象等引用类型的属性上，也让其自身具有dep，不仅仅是对象的属性，数组的元素等需要被劫持，数组，对象等自身也需要被劫持。**

也就是说：不管这个属性是原始类型，还是引用类型，都让其对应一个dep，用来收集依赖。

```js
class Observe {
  constructor(data) {
    // 让引用数据自身也实现依赖收集 这个dep是放在 data.__ob__ = this 上的
    // 也就是说 data.__ob__.dep 并不是 data.dep 所以不会发生重复
    this.dep = new Dep();
    // 记录this 也是一个标识 如果对象上有了该属性 标识已经被观测
    Object.defineProperty(data, "__ob__", {
      value: this, // observe的实例
    });
    // 如果劫持的数据是数组
    if (Array.isArray(data)) {
      // 重写数组上的7个方法 这7个变异方法是可以修改数组本身的
      Object.setPrototypeOf(data, arrayProto);
      // 对于数组元素是 引用类型的，需要深度观测的
      this.observeArray(data);
    } else {
      // Object.defineProperty 只能劫持已经存在的属性（vue提供单独的api $set $delete 为了增加新的响应式属性）
      this.walk(data);
    }
  }
  /**
   * 循环对象 对属性依次劫持 重新‘定义’属性
   * @param {*} data
   */
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  /**
   * 劫持数组元素 是普通原始值不会劫持
   * @param {Array} data
   */
  observeArray(data) {
    data.forEach((item) => observe(item));
  }
}
```

![image-20220416175015018](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416175015018.png)

![image-20220416175053115](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416175053115.png)

可以看见，修改数组自身的元素，视图也能正常更新。

**但是要注意，直接使用arr[index]的方式修改元素，和新增对象还不存在的元素，目前还不能进行视图更新。**

![image-20220416175343403](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416175343403.png)

也就是说目前只是修改数组自身的7个变异方法，可以劫持到，并且实现视图更新。对于使用下标修改元素和修改数组的长度等，是不能劫持到的。

**对于新增属性，需要使用vm.$set()方法新增才能实现劫持。**

通过上面的操作，给每个对象的观察者observe都挂上了一个dep，用来收集每个对象自身的依赖。

当我们给对象新增属性的时候，可以observe通知dep更新视图。

```js
setTimeout(() => {
    vm.obj.age = 22
    vm.obj.__ob__.dep.notify()//$set原理
    console.log("1秒后更新。。。",vm.arr,vm.obj)
    }, 1000)
```

**$set本质上就是这种原理实现的。**

#### 深度数据劫持

对于数组元素还是数组的这种情况，需要二次侦听。

![image-20220416202926167](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416202926167.png)

```js
function dependArray(arr) {
  // console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    // console.log(cur, cur.__ob__);
    // 数组元素可能不是数组了
    if (Array.isArray(cur)) {
      // 收集依赖
      cur.__ob__.dep.depend();
      dependArray(cur);
    }
  }
}
```

把数组元素循环，对于元素还是数组的情况，让该数组自身也收集依赖。

**数据劫持总结：**

1. 默认vue在初始化的时候 会对对象每一个属性都进行劫持，增加dep属性， 当取值的时候会做依赖收集

2. 默认还会对属性值是（对象和数组的本身进行增加dep属性） 进行依赖收集

3. 如果是属性变化 触发属性对应的dep去更新

4. 如果是数组更新，触发数组的本身的dep 进行更新

5. 如果取值的时候是数组还要让数组中的对象类型也进行依赖收集 （递归依赖收集）

6. 如果数组里面放对象，默认对象里的属性是会进行依赖收集的，因为在取值时 会进行JSON.stringify操作

![image-20220416203346466](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220416203346466.png)
