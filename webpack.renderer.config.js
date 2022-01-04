const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  devtool: "nosources-source-map",
  resolve: {
    extensions: [".jsx", ".js", ".json", ".wasm"],
  }
 
};
