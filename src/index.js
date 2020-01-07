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

const nextNode = h(Portal, { target: '#test' }, []);

const node = h(Portal, { target: '#app' }, [
  h('div', null, 'world')
]);

const next = h('span', null, '123');

// const nextNode = h('span', null, '456');

render(node, document.getElementById('app'));

setTimeout(() => {
  render(nextNode, document.getElementById('app'));
}, 2000);