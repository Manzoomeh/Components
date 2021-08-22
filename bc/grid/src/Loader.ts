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

const data = [
  { id: 1, name: "Amir", age: 12 },
  { id: 2, name: "javad", age: 30 },
  { id: 3, name: "hasan", age: 55 },
  { id: 4, name: "Jamshid", age: 10 },
  { id: 5, name: "akbar", age: 80 },
];

const options = {
  columns: {
    id: {
      title: "شناسه",
    },
    name: "name-1",
    age: "سن",
  },
};
const element = document.getElementById("tbl") as HTMLTableElement;
const grid = new Grid(element, options, data);
