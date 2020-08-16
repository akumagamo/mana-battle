import {CellNumber, MapState} from "../API/Map/Model";

const tiles:CellNumber[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
  [3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [3, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 2, 1, 1, 0, 0],
  [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
  [3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 2, 0, 0, 0, 0, 0, 2],
  [3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0],
  [3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 1, 2, 0, 0, 1, 2, 0, 0],
];
const map:MapState = {
  id: 'greenHarbor',
  name: "Green Harbor",
  author: "Leonardo Farroco",
  description: "The first map",
  cells: tiles,
  units: [],
  forces: [],
  cities: [
    {
      id: 'castle1',
      name: 'Izabel',
      x: 3,
      y: 5,
      force: null,
      type: 'castle',
    },
    {
      id: 'castle2',
      name: 'Madamaxe',
      x: 10,
      y: 4,
      force: null,
      type: 'castle',
    },
    {id: 'c1', name: 'Arabella', x: 2, y: 6, force: null, type: 'town'},
    {id: 'c2', name: 'Marqueze', x: 10, y: 1, force: null, type: 'town'},
    {id: 'c3', name: 'Bauhaus', x: 9, y: 5, force: null, type: 'town'},
    {id: 'c4', name: 'Vila Rica', x: 6, y: 4, force: null, type: 'town'},
  ],
};

export default map
