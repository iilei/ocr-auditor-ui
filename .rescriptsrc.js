const { appendWebpackPlugin } = require('@rescripts/utilities');
const { DefinePlugin } = require('webpack');
require('dotenv').config();

const { GOOGLE_API_KEY, FONT_FAMILIES, FONT_CATEGORIES } = process.env;

module.exports = [
  {
    jest: config => {
      config.setupFiles = ['jest-canvas-mock'];
      return config;
    },
  },
  config =>
    appendWebpackPlugin(
      new DefinePlugin({
        'process.env.GOOGLE_API_KEY': JSON.stringify(GOOGLE_API_KEY),
        'process.env.FONT_FAMILIES': JSON.stringify(FONT_FAMILIES),
        'process.env.FONT_CATEGORIES': JSON.stringify(FONT_CATEGORIES),
      }),
      config,
    ),
];
