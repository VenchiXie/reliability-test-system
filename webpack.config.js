const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development", // 开发环境
  entry: "/src/index.js", // 文件入口
  // 生成位置
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    // asset/resource 模块以 [hash][ext][query] 文件名发送到输出目录
    assetModuleFilename: "images/[hash][ext][query]",
  },
  module: {
    rules: [
      // 解析.js | .jsx 文件
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      // 加载样式文件
      {
        test: /\.(css|less)$/,
        use: ["style-loader", "css-loader"],
      },
      // 加载图像
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html", // 指定HTML模板文件路径
    }),
    // 用于在每个模块中自动加载模块
    new webpack.ProvidePlugin({
      React: "react",
    }),
  ],

  // resolve 是用于配置模块解析方式的选项。通过 resolve 配置，你可以告诉Webpack如何去寻找模块所对应的文件。
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },

  devServer: {
    static: path.join(__dirname, "dist"),
    // 使用HTML5历史API时，可能必须提供index. html页面来代替任何404响应。通过将其设置为true来启用devServer.历史ApiFallback
    // 例如：react-router-dom->createBrowserRouter([])
    historyApiFallback: true,
    port: 3000,
    hot: true, // 自动热更新
  },
};
