import superagent from 'superagent';

const DIGITS_ONLY = /^\d+$/;

const isStrictlyInt = (str: string): boolean => DIGITS_ONLY.test(str);

class DocLoader {
  _document: Record<string, any> & { pages: Array<Record<string, any>> };
  _ready: boolean;

  constructor(doc: string, page: string) {
    this._doc = doc;
    this._document = { pages: [] };
    this._page = page;
    this._ready = false;
    this._record = {};
    this._view = {};

    return this;
  }

  _doc: string;

  get doc() {
    return this._doc;
  }

  set doc(doc: string) {
    this._doc = doc;
  }

  _page: string;

  get page() {
    return this._page;
  }

  set page(page: string) {
    this._page = page;
  }

  _record: Record<string, any>;

  get record() {
    return this._record;
  }

  _view: Record<string, any>;

  get view() {
    return this._view;
  }

  get = (doc = this._doc, page = this._page): Promise<any> => {
    this._ready = false;
    return superagent
      .get(doc)
      .then(res => {
        if (!res.body || !res.body.pages) {
          return Error('Unexpected Schema');
        }
        this._record = res.body;
        const pageAccessor = isStrictlyInt(page) ? 'ppageno' : 'id';
        const pageIdentifier = isStrictlyInt(page) ? parseInt(page, 10) - 1 : page;
        const { contentType, ocrCapabilities, ocrSystem } = res.body;

        const pageDoc = res.body.pages.find((page: Record<string, any>) => page[pageAccessor] === pageIdentifier);
        const view = {
          contentType,
          ocrCapabilities,
          ocrSystem,
          id: pageDoc.id,
          ...pageDoc,
        };
        this._view = view;
        this._ready = true;

        return this._view;
      })
      .catch(err => {
        throw Error(err);
      });
  };
}

export default DocLoader;
