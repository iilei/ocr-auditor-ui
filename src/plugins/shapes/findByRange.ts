export type RangeCollection = Array<Record<'range', [number, number]>>;

const findByRange = (collection: RangeCollection, val: number) =>
  collection.find(c => {
    const [gte, lte] = c.range;
    return val >= gte && val <= lte;
  });

export default findByRange;
