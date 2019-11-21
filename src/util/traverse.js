const traverseFactory = (obj, operation, ...cast) => {
  const result = { ...obj };

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
  const operation = (_obj, [_key, _val]) => Object.assign(_obj, { [_key]: lambda(_val) });

  return traverseFactory(obj, operation, ...cast);
};

export default traverse;
