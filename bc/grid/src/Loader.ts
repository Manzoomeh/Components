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

var data = require("../wwwroot/data.json");
const options = require("../wwwroot/grid.config.json");
const element = document.getElementById("tbl") as HTMLTableElement;
const grid = new Grid(element, options, data);
