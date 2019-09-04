export interface IConfig {
    x?: number,
    y?: number,
    hp?: number,
    spd?: number,
    frq?: number,
    amm?: number,
    mag?: number,
    dmg?: number,
    score?: number,
    size?: number,
    color?: string,
    radius?: number,
    limit?: number,
    near?: number,
    far?: number,
    cave?: number[],
    sgmt?: number[][][],
    map?: IConfig,
    gun?: IConfig,
    gnd?: IConfig,
    bul?: IConfig
}

let config = require("./config.json");
export default config;
