import { cloneDeep } from 'lodash';
import traverse, { traverseFactory } from './traverse';
const inputNested = {
  c: { b: { c: 'foo' } },
  b: [{ c: 'hu' }, { x: { a: [{ h: 'hey', o: 'ho' }] } }],
  a: undefined,
  x: { c: { c: 42, x: { c: { c: 'ö' } } } },
};

const input = {
  some: {
    words: [
      {
        bbox: [
          [36, 92],
          [96, 116],
        ],
        content: 'This',
        id: 'word_1_1',
        xWconf: 0,
      },
      {
        bbox: [
          [109, 92],
          [129, 116],
        ],
        content: 'is',
        id: 'word_1_2',
        xWconf: 5,
      },
      {
        bbox: [
          [141, 98],
          [156, 116],
        ],
        content: 'a',
        id: 'word_1_3',
        xWconf: 10,
      },
    ],
  },
};

describe('traverse*', () => {
  describe('traverse', () => {
    it('should manipulate an object on its leafs', async () => {
      const expectation = {
        b: [{ c: 'HU' }, { x: { a: [{ h: 'hey', o: 'HO' }] } }],
        c: { b: { c: 'FOO' } },
        a: undefined,
        x: { c: { c: 42, x: { c: { c: 'Ö' } } } },
      };
      expect(
        traverse(cloneDeep(inputNested), str => (typeof str === 'string' ? str.toUpperCase() : str), 'o', 'c'),
      ).toEqual(expectation);
    });

    it('Throws Error when cast matches `[*]`', async () => {
      expect(() => {
        traverse({ selector: [{ id: 'selector_1' }] }, obj => obj, 'selector[*]');
      }).toThrow('Cast not applicable to "traverse": selector[*]');
    });
  });

  describe('traverseFactory', () => {
    it('handles `selector[*]`', () => {
      expect(traverseFactory(cloneDeep(input), obj => obj.content, 'words[*]')).toEqual({
        some: { words: ['This', 'is', 'a'] },
      });
    });

    it('Throws with Uncastable `selector[*].foo`', () => {
      expect(() => traverseFactory({}, obj => obj.content, 'selector[*].foo')).toThrow('Uncastable: selector[*].foo');
    });

    it('can handle multiple <string>[*] accessors', () => {
      expect(
        traverseFactory(
          { ...cloneDeep(input), ...cloneDeep(inputNested), mop: [{ content: 'mop' }] },
          (obj, [key, val, context], ...cast) =>
            `${obj.content}; ${key}; ${JSON.stringify(val)}; ${context}; ${[...cast].join(',')}`,
          'words[*]',
          'x',
          'mop[*]',
        ),
      ).toEqual({
        ...input,
        ...inputNested,
        mop: ['mop; 0; {"content":"mop"}; mop; words[*],x,mop[*]'],
        some: {
          words: [
            'This; 0; {"bbox":[[36,92],[96,116]],"content":"This","id":"word_1_1","xWconf":0}; words; words[*],x,mop[*]',
            'is; 1; {"bbox":[[109,92],[129,116]],"content":"is","id":"word_1_2","xWconf":5}; words; words[*],x,mop[*]',
            'a; 2; {"bbox":[[141,98],[156,116]],"content":"a","id":"word_1_3","xWconf":10}; words; words[*],x,mop[*]',
          ],
        },
      });
      //
    });
  });
});
