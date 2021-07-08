const path = require("path");
module.exports = {
  entry: {
    watermark: {
      import: "./src/loader.ts",
      filename: "basiscore.watermark.js",
      library: {
        name: "[name]",
        type: "assign",
      },
    },
    watermarkComponent: {
      import: "./src/BcComponentLoader.ts",
      filename: "basiscore.watermark.component.js",
      library: {
        name: "bc",
        type: "assign",
      },
    },
    wmDemoData: {
      import: "./src/DemoData.ts",
      filename: "basiscore.watermark.demo-data.js",
      library: {
        name: "[name]",
        type: "assign",
      },
    },
  },
  output: {
    filename: "basiscore.[name].js",
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
