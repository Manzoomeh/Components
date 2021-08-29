import Grid from "./Grid";

// fetch("./grid.config.json").then(async (r) => {
//   let options = null;
//   try {
//     options = await r.json();
//   } catch {}
//   const dataResponse = await fetch("./data.json");
//   let data = null;
//   try {
//     data = await dataResponse.json();
//   } catch {}

//   const element = document.getElementById("tbl") as HTMLTableElement;
//   const grid = new Grid(element, options, data);
// });

//var dataList = require("../wwwroot/data.json");

const MIN_ID = 1000;
const MAX_ID = 1200;
const MIN_AGE = 10;

const dataList = [];
for (let index = MIN_ID; index < MAX_ID; index++) {
  const data = {
    id: index,
    age: Math.floor(Math.random() * 80) + MIN_AGE,
    name: Math.random().toString(36).substring(7),
  };
  dataList.push(data);
}

const options = require("../wwwroot/grid.config.json");
const element = document.getElementById("tbl") as HTMLTableElement;
const grid = new Grid(element, options);
document
  .getElementById("data-btn")
  .addEventListener("click", (_) => grid.setSource(dataList));
grid.setSource(dataList);
