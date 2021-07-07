const path = require("path");
module.exports = {
  entry: {
    watermark: "./src/loader.ts",
    watermarkComponent: "./src/basiscore-usercomponent-loader.ts",
    wmDemoData: "./src/DemoData.ts",
  },
  output: {
    filename: "basiscore.[name].js",
    library: "[name]",
  },
  devServer: {
    static: path.resolve(__dirname, "wwwroot"),
    open: true,
    port: 3001,
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       app: {
  //         test: /[\\/]app[\\/]/,
  //         name: "basiscore.watermark",
  //         chunks: "all",
  //       },
  //       boot: {
  //         test: /[\\/]src[\\/]loader.ts$/,
  //         name: "basiscore.watermark.loader",
  //         chunks: "all",
  //       },
  //     },
  //   },
  // },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"], // there's a dot missing
  },
};
