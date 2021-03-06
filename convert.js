const map = require("./src/map.js");
const data = map.layers[0].data;

let tile = 0;
let count = 0;
let out = "";
for (let i = 0; i < data.length; i++) {
    if (data[i] !== tile || count === 35) {
        if (count) {
            tile = tile > 1 ? tile : 1 - tile;
            out = out + tile.toString(36) + count.toString(36);
        }
        tile = data[i];
        count = 1;
        continue;
    }
    count++;
}
tile = tile > 1 ? tile : 1 - tile;
out = out + tile.toString(36) + count.toString(36);
console.log(out);
