/* eslint-disable @typescript-eslint/no-var-requires */
const { join, parse } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BannerPlugin } = require('webpack');
const { main, name, version, author, homepage } = require('./package.json');

const rootPath = process.cwd();
const context = join(rootPath, 'src');
const outputPath = join(rootPath, 'build');
const filename = parse(main).base;

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const date = ('0' + today.getDate()).slice(-2);
  return `${year}-${month}-${date}`;
};

const getBanner = () => {
  return (
    `/*! ${name} - ${version} - ` +
    `${getCurrentDate()} ` +
    `| (c) 2021-2022 ${author} | ${homepage} */`
  );
};

module.exports = {
  mode: 'production',
  context,
  entry: {
    dcmjsDimse: './index.ts',
  },
  target: 'node',
  output: {
    filename,
    library: name,
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true,
        terserOptions: {
          sourceMap: true,
        },
      }),
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: getBanner(),
      entryOnly: true,
      raw: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        enforce: "pre",
        loader: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
