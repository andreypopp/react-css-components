var path = require('path');

module.exports = function(directory) {
  return {
    entry: './index.js',
    output: {
      path: 'bundle',
      filename: 'bundle.js',
    },
    devtool: 'cheap-eval-source-map',
    resolve: {
      fallback: path.join(directory, 'node_modules'),
    },
    resolveLoader: {
      fallback: path.join(directory, 'node_modules'),
    },
  };
};
