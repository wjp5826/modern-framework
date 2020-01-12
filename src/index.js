import render from './render';
import { h, Fragment, Portal } from './h';

function handler(params) {
  alert('hello')  
}

// const node = h('div', {
//   style: {
//     height: '90px',
//     width: '100%',
//     background: '#e2e2e2'
//   },
//   onclick: handler
// }, [
//   h('div', { class: { 'b': false, 'c': true } }, 'first'),
//   h(Fragment, null, [
//     h('span', null, 'nihao'),
//     h('div', null, 'wobuhao'),
//     h(Portal, { target: '#app' }, h('span', null, "hqll"))
//   ])
// ]);

class child1 {
  render() {
    return h('div', null, 'hello')
  }
}

class child2 {
  render() {
    return h('span', null, 'world')
  }
}

// statefulComponent
class my {
  
  state = true;
  
  // mounted() {
  //   setTimeout(() => {
  //     this.state = false;
  //     this.update();
  //   }, 2000)
  // }
  
  // render() {
  //   return this.state ? h(child1) : h(child2);
  // }
  render() {
    return h('div', null, 'hello');
  }
}

class my2 {

  state = 'world';

  mounted() {
    // setTimeout(() => {
    //   this.state = 'world';
    //   this.update();
    // }, 2000)
  }

  render() {
    return h('div', null, 'world')
  }
}

const nextNode = h(Portal, { target: '#test' }, []);

const node = h(Portal, { target: '#app' }, [
  h('div', null, 'world')
]);

// const next = h('span', null, '123');

// const nextNode = h('span', null, '456');

// 函数式组件

function functionCom ({ text }) {
  return h('span', null, text);
}


render(h(functionCom, { text: 'hello' }), document.getElementById('app'));

setTimeout(() => {
  render(h(functionCom, { text: 'world' }), document.getElementById('app'));
}, 2000);