'use strict';
const assert = require('assert');


function replace(expression, context) {
  const self = this;
  let out = '';
  self.matches.forEach(matched => {
    out = expression.replace(self.key, context[self.key]);
  });
  return out;
}

function traverse(expression, context) {
  let out = expression;
  Object.keys(context).forEach(key => {
    let matches = [...expression.matchAll(key)];
    out = replace.call({ matches: matches, key: key }, out, context);
  });
  return out;
}

const rTemplate = new RegExp('(\{\{.*?\}\})', 'ig');

function hasFragments(expression) {
  return [...expression.matchAll(rTemplate)].length > 0;
}

function render(expression, context) {
  let out = expression;
  let expressions = [...out.matchAll(rTemplate)];
  let c = 0;
  for (let i = 0; i < expressions.length; i += 1) {
    if (hasFragments(out) && traverse(out, context)) {
      out = traverse(out, context);
    }
    out = out.replace('{{', '');
    out = out.replace('}}', '');
  }
  return out;
}
assert.equal(render('{{message}}', { message: 'hello world' }), 'hello world');
assert.equal(render('{{message}} {{message}}', {
  message: 'hello world'
}), 'hello world hello world');
assert.equal(render('{{firstValue}} + {{secondValue}}', {
  firstValue: 2,
  secondValue: 3,
}), '2 + 3');
