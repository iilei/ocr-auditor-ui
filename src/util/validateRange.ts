const validateRange = (getWords: () => Array<Record<string, any>>) => (words: Array<string>) => {
  const wordGetter = getWords();
  const wordsIDs = wordGetter.map(w => w.id);
  // @ts-ignore
  return !words.reduce((acc, cur) => [...acc, !wordsIDs.includes(cur)], []).find(Boolean);
};

export default validateRange;
