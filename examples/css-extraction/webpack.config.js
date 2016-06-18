var common = require('../webpack.config');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = Object.assign({}, common(__dirname), {
  module: {
    loaders: [
      {
        test: /\.react.css$/,
        loader: 'react-css-components',
        query: {
          loadCSS: ExtractTextPlugin.extract(
            'style-loader',
            'css-loader?modules'
          ).split('!')
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
  ]
});
