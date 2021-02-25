/*eslint-env node*/
/*eslint import/no-nodejs-modules:0 */
const baseConfig = require('../webpack.config');

const config = {
  ...baseConfig,

  target: 'node',
  entry: {
    chartRendererConfig: 'app/components/charts/backendStyles',
  },

  optimization: {},

  output: {
    ...baseConfig.output,
    libraryTarget: 'commonjs',
  },
};

module.exports = config;
