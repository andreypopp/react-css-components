var common = require('../webpack.config');

var autoprefixer = require('autoprefixer');

module.exports = Object.assign({}, common(__dirname), {
  module: {
    loaders: [
      {
        test: /\.react.css$/,
        loader: 'react-css-components',
        query: {
          loadCSS: [
            'style-loader',
            'css-loader?modules',
            'postcss-loader'
          ]
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
  postcss: function () {
    return [autoprefixer];
  }
});
