const sequentially = (promises: Array<Promise<any>>) =>
  promises.reduce(
    (acc, cur: any) =>
      acc.then(results => {
        return cur.then((result: any) => results.concat(result));
      }),
    Promise.resolve([]),
  );

export default sequentially;
