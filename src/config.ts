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
    width?: number,
    height?: number,
    radius?: number,
    limit?: number,
    lives?: number,
    near?: number,
    far?: number,
    cave?: number[],
    sgmt?: number[][][],
    map?: IConfig,
    gun?: IConfig,
    gnd?: IConfig,
    bul?: IConfig
}

export default {
    cam: {
        x: 0,
        y: 0,
        width: 224,
        height: 256,
        spd: 0.02
    },
    hero: {
        x: 96,
        y: 128,
        hp: 100,
        spd: 0.07,
        score: 0,
        lives: 3,
        gun: {
            frq: 80,
            amm: 9999,
            mag: 0,
            bul: {
                spd: 0.4,
                dmg: 25,
                size: 6
            }
        },
        gnd: {
            frq: 500,
            amm: 5,
            mag: 10,
            bul: {
                spd: 0.2,
                dmg: 50,
                size: 10,
                radius: 48
            }
        }
    },
    camp: {
        hp: 20,
        dmg: 5,
        score: 10
    },
    shot: {
        hp: 50,
        dmg: 0,
        score: 50,
        far: 200,
        gun: {
            frq: 800,
            amm: 9999,
            mag: 0,
            bul: {
                spd: 0.1,
                dmg: 10,
                size: 6
            }
        }
    },
    hole: {
        frq: 300,
        limit: 20,
        near: 180,
        far: 320
    },
    runr: {
        hp: 10,
        dmg: 10,
        spd: 0.07,
        score: 25
    }
};
