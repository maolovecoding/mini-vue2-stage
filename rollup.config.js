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
