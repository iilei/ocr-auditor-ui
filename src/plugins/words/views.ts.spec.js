import views from './views';

const stubOpts = {
  view: {
    lines: [
      { words: [{ i: '0_0' }, { i: '0_1' }] },
      { words: [{ i: '1_0' }] },
      { words: [{ i: '2_0' }, { i: '2_1' }] },
    ],
  },
  fn: {
    setState: jest.fn(),
    eachDeep: require('../../util/eachDeep').default,
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
      const promise = views.fn(stubOpts)();
      promise.then(result => {
        expect(result).toEqual({ views: [{ i: '0_0' }, { i: '0_1' }, { i: '1_0' }, { i: '2_0' }, { i: '2_1' }] });
        done();
      });
    });
  });
});
