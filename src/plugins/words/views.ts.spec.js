import { flatten } from 'lodash';
import views from './views';
import { traverseFactory } from '../../util';

const stubOpts = {
  view: {
    lines: [
      { words: [{ i: '0_0' }, { i: '0_1' }] },
      { words: [{ i: '1_0' }] },
      { words: [{ i: '2_0' }, { i: '2_1' }] },
    ],
  },
  fn: {
    traverseFactory,
    setState: jest.fn(),
  },
};

describe('views', () => {
  afterEach(() => {
    stubOpts.fn.setState.mockClear();
  });

  describe('meta', () => {
    it('has Property "name"', () => {
      expect(views.name).toEqual('words');
    });
    it('has Property "context"', () => {
      expect(views.context).toEqual('canvas');
    });
  });

  describe('fn', () => {
    it('assigns state according to word views found in view', done => {
      const promise = views.fn(stubOpts);
      promise.then(function() {
        expect(flatten(stubOpts.fn.setState.mock.calls)).toEqual([
          { views: [{ i: '0_0' }, { i: '0_1' }, { i: '1_0' }, { i: '2_0' }, { i: '2_1' }] },
        ]);
        done();
      });
    });
  });
});
