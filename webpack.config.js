const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const pkg = require('./package.json');

const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const outputPath = path.join(rootPath, 'build');

module.exports = {
  mode: 'production',
  context,
  entry: {
    dcmjsDimse: './index.js'
  },
  target: 'node',
  output: {
    filename: pkg.main,
    library: pkg.name,
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true
  },
  optimization: {
    minimizer: [ new UglifyJSPlugin() ]
  },
};
