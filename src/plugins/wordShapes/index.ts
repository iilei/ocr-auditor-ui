import { Plugin, PluginPromiseFactory, Options, Dimensions } from '../../modules/types/docView';

const wordShapes: Plugin = {
  context: 'canvas',
  fn: <PluginPromiseFactory> (opts) => new Promise((resolve, reject) => {
    console.log(opts)
    resolve()
  })
}


export default wordShapes
