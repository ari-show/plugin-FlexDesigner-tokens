const assert = require('node:assert/strict');
const test = require('node:test');

// Exercise the package entry point and the published UMD build.
for (const entry of ['deepmerge', 'deepmerge/dist/umd.js']) {
  test(`${entry} rejects prototype-poisoning keys while preserving normal merges`, () => {
    const merge = require(entry);
    const payload = () => JSON.parse('{"__proto__":{"admin":true},"safe":1}');
    const sourceResult = merge(Object.create(null), payload());
    const targetResult = merge(payload(), { added: true }, { clone: false });
    const nestedResult = merge({ session: null }, { session: payload() });
    const arrayResult = merge({}, { items: [payload()] });

    for (const result of [sourceResult, targetResult, nestedResult.session, arrayResult.items[0]]) {
      assert.equal(Object.getPrototypeOf(result), Object.prototype);
      assert.equal(result.admin, undefined);
      assert.equal(Object.hasOwn(result, '__proto__'), false);
      assert.equal(result.safe, 1);
    }
    assert.equal(targetResult.added, true);

    const symbol = Symbol('safe');
    const result = merge({ nested: { a: 1 } }, { nested: { b: 2 }, [symbol]: 3 });
    assert.deepEqual(result.nested, { a: 1, b: 2 });
    assert.equal(result[symbol], 3);
  });
}
