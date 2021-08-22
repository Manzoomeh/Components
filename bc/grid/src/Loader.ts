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
  { id: 1, name: "Data1" },
  { id: 2, name: "Data2" },
  { id: 3, name: "Data3" },
  { id: 4, name: "Data4" },
  { id: 5, name: "Data5" },
];

const options = {
  columns: {
    id: {
      title: "شناسه",
    },
    name: "name-1",
  },
};
const element = document.getElementById("tbl") as HTMLTableElement;
const grid = new Grid(element, options, data);
