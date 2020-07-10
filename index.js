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
  let out = '';
  Object.keys(context).forEach(key => {
    let matches = [...expression.matchAll(key)];
    out = replace.call({ matches: matches, key: key }, expression, context);
  });
  return out;
}

function render(expression, context) {
  let out = expression;
  let rTemplate = new RegExp('(\{\{.*?\}\})', 'ig');
  let expressions = [...expression.matchAll(rTemplate)];
  expressions.forEach(v => {
    out = traverse(out, context);
    out = out.replace('{{', '');
    out = out.replace('}}', '');
  });
  return out;
}
assert.equal(render('{{message}}', { message: 'hello world' }), 'hello world');
assert.equal(render('{{message}} {{message}}', {
  message: 'hello world'
}), 'hello world hello world');
