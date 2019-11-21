const sequentially = (promises: Array<Promise<any>>) =>
  promises.reduce(
    (acc, cur: any) =>
      acc.then(results => {
        return cur.then((result: any) => Object.assign(results, result));
      }),
    Promise.resolve({}),
  );

export default sequentially;
