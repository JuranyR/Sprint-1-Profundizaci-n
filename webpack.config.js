const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  mode: "none",
  entry: {
    login: ["@babel/polyfill", "./src/app/scripts/main.js"],
    signup: ["@babel/polyfill", "./src/app/scripts/signup.js"],
    chat: ["@babel/polyfill", "./src/app/scripts/chat.js"],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].bundle.js",
  },
  devServer: {
    port: 5050,
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        loader: "babel-loader",
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test:/\.html$/,
        use: [
          'html-loader'
        ]
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      hash: true,
      filename: 'index.html',
      template: "./src/index.html",
      chunks: ['login'],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
    new HTMLWebpackPlugin({
      hash: true,
      filename: 'chat.html',
      template: "./src/chat.html",
      chunks: ['chat'],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
    new HTMLWebpackPlugin({
      hash: true,
      filename: 'signup.html',
      template: "./src/signup.html",
      chunks: ['signup'],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "css/app.bundle.css",
    }),
  ],
};
