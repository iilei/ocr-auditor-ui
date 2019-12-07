module.exports = ({ config }) => {
  // Extend it as you need.
  // For example, add typescript loader:
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  });
  config.resolve.extensions.push('.ts', '.tsx');
  Object.assign(config, {devtool: 'inline-source-map'})
  return config;
};
