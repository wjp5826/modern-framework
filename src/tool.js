/**
 * 获取值的类型
 * @param val
 * @returns {*}
 */
export function getType(val) {
  if (val === null) return 'null';
  if (typeof val !== 'object') {
    return typeof val;
  } else {
    return Object.prototype.toString.call(val).split(' ')[1].split(']')[0].toLowerCase();
  }
}

/**
 * 应用类名
 * @param classList
 * @param list
 * @returns {Array}
 */
export function applyClassName(classList, list = []) {
  if (getType(classList) === 'string') {
    list.push(classList);
    return list;
  } else if (getType(classList) === 'array') {
    classList.forEach(ele => {
      applyClassName(ele, list);
    });
    return list;
  } else if (getType(classList) === 'object') {
    for (let className in classList) {
      if (classList[className]) {
        list.push(className);
      }
    }
    return list;
  }
}