var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: __dirname + '/app/index.js',
  output: { path: __dirname, filename: '/build/bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
};
