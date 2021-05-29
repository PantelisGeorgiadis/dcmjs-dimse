const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { BannerPlugin } = require('webpack');
const pkg = require('./package.json');

const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const outputPath = path.join(rootPath, 'build');
const filename = path.parse(pkg.main).base;

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const date = ('0' + today.getDate()).slice(-2);
  return `${year}-${month}-${date}`;
};

const getBanner = () => {
  return (
    `/*! ${pkg.name} - ${pkg.version} - ` +
    `${getCurrentDate()} ` +
    `| (c) 2021 ${pkg.author} | ${pkg.homepage} */`
  );
};

module.exports = {
  mode: 'production',
  context,
  entry: {
    dcmjsDimse: './index.js'
  },
  target: 'node',
  output: {
    filename,
    library: pkg.name,
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: false,
          mangle: false,
          toplevel: false,
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  },
  plugins: [
    new BannerPlugin({
      banner: getBanner(),
      entryOnly: true,
      raw: true
    })
  ]
};
