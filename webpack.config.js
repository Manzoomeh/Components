const path = require("path");
module.exports = {
  mode: "development",
  entry: {
    main: "./src/loader.ts",
  },
  devServer: {
    contentBase: "./wwwroot",
    publicPath: "/dist",
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
        use: ["ts-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader","css-loader"]
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx",".css"], // there's a dot missing
  },
};
