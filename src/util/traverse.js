import { cloneDeep } from 'lodash';

const HAS_BRACKET_STAR = /\[\*\]/;
const UNCASTABLE_REGEXP = /\[\*\].+$/;
const hasBracketStar = token => HAS_BRACKET_STAR.test(token);
const isUncastable = token => UNCASTABLE_REGEXP.test(token);

const traverseFactory = (obj, operation, ...cast) => {
  const result = cloneDeep(obj);
  if (cast.find(isUncastable)) {
    throw new Error(`Uncastable: ${cast.filter(isUncastable).join(', ')}`);
  }

  const traverseFunc = _obj => {
    Object.entries(_obj).forEach(([key, val]) => {
      if (cast.includes(`${key}[*]`) && Array.isArray(val)) {
        _obj[key] = val.map((__obj, __index) => {
          return operation(__obj, [__index, __obj, key], ...cast);
        });
      } else if (typeof val === 'object') {
        traverseFunc(val);
      } else if (cast.includes(key)) {
        operation(_obj, [key, val], ...cast);
      }
    });
  };
  traverseFunc(result);

  return result;
};

export { traverseFactory };

const traverse = (obj, lambda, ...cast) => {
  if (cast.find(hasBracketStar)) {
    throw new Error(
      `Cast not applicable to "traverse": ${cast
        .filter(hasBracketStar)
        .join(', ')} -- did you mean to use try using "traverseFactory" instead?`,
    );
  }
  const operation = (_obj, [_key, _val]) => Object.assign(_obj, { [_key]: lambda(_val) });

  return traverseFactory(obj, operation, ...cast);
};

export default traverse;
