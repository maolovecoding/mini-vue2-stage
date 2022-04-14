/**
 * 是否是函数
 * @param {*} source 对象
 * @returns
 */
export function isFunction(source) {
  return typeof source === "function";
}

export const isObject = (source) => {
  return source != null && typeof source === "object";
};
