import superagent from 'superagent';

const MATCH_NON_NUMBER = /\D/;

const equivToInt = (str: string): boolean => !MATCH_NON_NUMBER.test(str);

class DocLoader {
  _doc: string;
  _document: Record<string, any> & { pages: Array<Record<string, any>> };
  _page: string;
  _ready: boolean;
  _view: Record<string, any>;

  constructor(doc: string, page: string) {
    this._doc = doc;
    this._document = { pages: [] };
    this._page = page;
    this._ready = false;
    this._view = {};

    return this;
  }

  get = (doc = this._doc, page = this._page): Promise<any> => {
    this._ready = false;
    return superagent
      .get(doc)
      .then(res => {
        if (!res.body || !res.body.pages) {
          return Error('Unexpected Schema');
        }
        const pageAccessor = equivToInt(page) ? 'ppageno' : 'id';
        const pageIdentifier = equivToInt(page) ? parseInt(page, 10) - 1 : page;

        this._view = res.body.pages.find((page: Record<string, any>) => page[pageAccessor] === pageIdentifier);

        this._ready = true;

        return this._view;
      })
      .catch(err => {
        throw Error(err);
      });
  };

  get doc() {
    return this._doc;
  }

  set doc(doc: string) {
    this._doc = doc;
  }

  get page() {
    return this._page;
  }

  set page(page: string) {
    this._page = page;
  }

  get view() {
    return this._view;
  }
}

export default DocLoader;
