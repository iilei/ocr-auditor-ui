module.exports = [
  {
    jest: config => {
      config.setupFiles = ['jest-canvas-mock'];
      return config;
    },
  },
];
