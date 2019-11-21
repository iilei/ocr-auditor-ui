import traverse from './traverse';

describe('traverse', () => {
  it('should manipulate an   on its leafs', async () => {
    const input = {
      c: { b: { c: 'foo' } },
      b: [{ c: 'hu' }, { x: { a: [{ h: 'hey', o: 'ho' }] } }],
      a: undefined,
      x: { c: { c: 42, x: { c: { c: 'ö' } } } },
    };
    const expectation = {
      b: [{ c: 'HU' }, { x: { a: [{ h: 'hey', o: 'HO' }] } }],
      c: { b: { c: 'FOO' } },
      a: undefined,
      x: { c: { c: 42, x: { c: { c: 'Ö' } } } },
    };
    expect(traverse(input, str => (typeof str === 'string' ? str.toUpperCase() : str), 'o', 'c')).toEqual(expectation);
  });
});
