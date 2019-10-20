import superagent from 'superagent';

const docLoader = async (doc: string) => {
  try {
    const res = await superagent.get(doc);
    return res.body;
  } catch (err) {
    console.error(err);
    debugger;
  }
};

export default docLoader;
