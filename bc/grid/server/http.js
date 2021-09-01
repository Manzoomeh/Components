var express = require("express");
var router = express.Router();

router.post("/dbsource", function (req, res) {
  const MIN_ID = 1;
  const dataList = [];
  dataList.push(["id", "count", "data"]);
  for (let index = MIN_ID; index < 300; index++) {
    dataList.push([
      index,
      Math.floor(Math.random() * 80),
      Math.random().toString(36).substring(7),
    ]);
  }
  res.json({
    "book.list": dataList,
  });
});

router.get("/api", function (req, res) {
  const MIN_ID = 1;
  const dataList = [];
  for (let index = MIN_ID; index < 300; index++) {
    const data = {
      id: index,
      count: Math.floor(Math.random() * 80),
      data: Math.random().toString(36).substring(7),
    };
    dataList.push(data);
  }
  res.send({
    sources: {
      "api.demo": {
        options: null,
        data: dataList,
      },
    },
  });
});

module.exports = router;
