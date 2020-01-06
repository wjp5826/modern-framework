
export const VNodeFlags = {
  // html 标签
  ELEMENT_HTML: 1,
  // SVG
  ELEMENT_SVG: 1 << 1, 

  // 普通有状态组件
  COMPONENT_STATEFUL_NORMAL: 1 << 2,
  // 需要被 keepAlive 的有状态组件
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
  // 已经被 keep alive 的有状态组件
  COMPONENT_STATEFUL_KEEP_ALICE: 1 << 4,
  // 函数式组件
  COMPONENT_FUNCTIONAL: 1 << 5,

  // 纯文本
  TEXT: 1 << 6,
  // fragment
  FRAGMENT: 1 << 7,
  // portal
  PORTAL: 1 << 8,
};

export const ChildrenFlages = {
  // 未知的 children
  UNKNOW_CHILDREN: 0,
  // 没有children
  NO_CHILDREN: 1,
  // children 是单个 VNode
  SINGLE_VNODE: 1 << 1,
  // children 是拥有多个key的 VNode
  KEYED_VNODES: 1 << 2,
  // children 是多个没有 key 的 vnode
  NO_KEYED_VNODES: 1 << 3,
};
ChildrenFlages.MULTIPLE_VNODES = ChildrenFlages.KEYED_VNODES | ChildrenFlages.NO_KEYED_VNODES;
/**
 * 如果 children 没有 key，就添加key
 * @param {*} children 
 */
function normalizeVnodes(children) {
  const newChildren = [];
  for (let i = 0;i < children.length;i++) {
    if (children[i].key == null) {
      children[i].key = `-${i}`;
    }
    newChildren.push(children[i]);
  }
  return newChildren;
}
/**
 * 创建文本节点
 * @param {*} text 
 */
export function createTextNode(text) {
  return {
    _isVNode: true,
    flags: VNodeFlags.TEXT,
    tag: null,
    data: null,
    children: text,
    childrenFlag: ChildrenFlages.NO_CHILDREN,
    el: null
  }
}


export const Fragment = Symbol();
export const Portal = Symbol();
/**
 * 创建vnode
 * @param {} tag 标签类型
 * @param {*} data 标签属性
 * @param {*} children 标签子元素
 */
export function h(tag, data = null, children = null) {
  let flags = null;
  if (typeof tag === 'string') { // svg and html
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
  } else if (tag === Fragment) { // fragment
    flags = VNodeFlags.FRAGMENT;
  } else if (tag === Portal) { // portal
    flags = VNodeFlags.PORTAL;
    tag = data && data.target;
  } else {
    // 兼容 vue2 的对象式组件
    if (tag !== null && typeof tag === 'object') {
      flags === tag.functional
        ? VNodeFlags.COMPONENT_FUNCTIONAL
        : VNodeFlags.COMPONENT_STATEFUL_NORMAL;
    } else if (typeof tag === 'function') { // class 组件
      flags = tag.prototype && tag.prototype.render
       ? VNodeFlags.COMPONENT_STATEFUL_NORMAL
       : VNodeFlags.COMPONENT_FUNCTIONAL;
    }
  }
  // 确定 children 的类型
  let childrenFlag = null;
  if (Array.isArray(children)) {
    const { length } = children;
    if (length === 0) { // 没有 children
      childrenFlag = ChildrenFlages.NO_CHILDREN;
    } else if (length === 1) { // 单个 children
      childrenFlag = ChildrenFlages.SINGLE_VNODE;
      children = children[0];
    } else { // 多个 子节点，且子节点使用 key
      childrenFlag = ChildrenFlages.KEYED_VNODES;
      children = normalizeVnodes(children);
    }
  } else if (children == null) { // 没有子节点
    childrenFlag = ChildrenFlages.NO_CHILDREN;
  } else if (children._isVNode) { // 单个子节点
    childrenFlag = ChildrenFlages.SINGLE_VNODE;
  } else { // 文本节点
    childrenFlag = ChildrenFlages.SINGLE_VNODE;
    children = createTextNode(children + '');
  }
  return {
    el: null,
    _isVNode: true,
    flags,
    tag,
    data,
    childrenFlag,
    children,
  }
}