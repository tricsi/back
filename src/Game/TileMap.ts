import { IMovable, GameObject } from "./GameEngine";
import { Box, Vec } from "./Math";
import Sprite from "./Sprite";

export enum Tile {
    WALL = 0,
    GROUND = 1,
    HOLE = 2,
    CAMP = 3,
    SHOT = 4,
    WORM = 5,
    HEAL = 6,
    AMMO = 7,
    NUKE = 8,
    HERO = 9,
}

export class TileMap extends GameObject {

    static readonly MAX_NAV = 30;
    static readonly MAPS = [
        "0316061704152113031a021a011391160219021a021a021b021b021a03184104180517061903172111031a0116011a021a0219031904180617061705180321164111011w31021831031731051631061631061632051804180314011401160213211603190319031161170312021503120215021303140114031903190319021a011a411b011a02192102190418051705193102193102193101150114310114031331150313314114031331160114311b3113711702190318042117061606150311041402120418021a011z1e581z1802192103180418041804180331180331190231190131140319033117043117053116310431163104311731033118033118023119011n211p021203150213310214021331021402133102140715021331021402133102140211611131021402133102140212031z1q211z12311a3101311831033116310531143103",
        "0316054116310414911231031931011b311r3103142112310516310516310516310517310319331t011b02125612021a0119410119310218310371173103173104311631021201311502130131150112211101311a01311a01311a0231190331180331115611033118023119321v031705150532140432150319021a021f021a02190317043112083113073114371t211r021a02126117021541140319031a031a021q32143503133108130213021502112118021a031a031s411b411b411t31011931021831031731031831021601120315021202150318041804180518041805190319041903115711021a021a011335173517327132173517351t591r081402150114021361110114021501122111051201140512011402150114021141130114021501140215011z1e211z1d321a023118043117053115071403",
        "0316051804149114021a03180517061309130411011j211f01122118021a021a0314331303133313031333140217011b011a02211u021a03150114021403190311611421130114011a031903122117021h0219041903154114011x5712011a03180418041804190418051321140419041805170616061607350735073507350616031a0218711d211l011b01190319034118034115011203150212031403130213051202130513011306160716061121311405123214031333140113011133160219031a021b011d5911711o0117011303150212041402120414021304130214031302150114011t581m341731044115310541143106411331031831021931011t411z1132081232031732031732031732031261132132031732031732031732031732081j211t011404120213043112021204311302110431140631140714081305",
        "0319021921011b011591130219032118031a021a31011b31011a31021931031731041704311704311704311704311721023119011c211s0318051705170517051705170418031a0112211t581e311b321a371401391201213812013813413813413714410135150333150531150631146107140854081408140812211108140854081408140811211208140854081408122111081408140854081408140814073114310631153104311731023116711131023118310231183102311731031831021903411704411704411605170516061606211407150715071606160617051706164105411704180518041921031433120412351104123511041333120321180319021a021a0112581d41125811411z1202112112021402130314021203150614611105122111711205170616021203150213031402112112021h561301411903380536063606360537410438033a011c",
        "0316061606129113051741041721032118310241183103311631053114310714081408140814081408140814081407311421063115053116310321183102193102193101611a311434180418041804112113211204180441180413411404173104163204143404133307123307123302173215211g411a711z125a1p3418350215350215340315330411211333041532410415320614311305133115031331126118311b01311a0131192101311a021a011b01115911011b011a04180516410516021a02126117023118033216410333150433150433140532144105311506150715071341081309130913091309130913091408170531142112043217021171311a321921311m31125612321a3419351735183418341156113301183112021a04190313211503190418041341211361041903193313411n0131135611021a023118041731041121150516310516053116043116410418041333120517061603",
    ];

    width: number = 14;
    height: number = 1;
    size: number = 16;
    tiles: number[];
    nav: number[];
    frame: number[];

    get length(): number {
        return this.width * this.height;
    }

    get bottom(): number {
        return this.height * this.size;
    }

    constructor(public level: number) {
        super();
        const maps = TileMap.MAPS;
        const map = maps[level % maps.length];
        let length = 0;
        this.tiles = new Array(this.width + 1).fill(0);
        for (let i = 0; i < map.length; i += 2) {
            const tile = parseInt(map.charAt(i), 36);
            const count = parseInt(map.charAt(i + 1), 36);
            for (let j = 0; j < count; j++) {
                if (length && length % 12 === 0) {
                    this.tiles.push(0, 0);
                    this.height++;
                }
                this.tiles.push(tile);
                length++;
            }
        }
        this.tiles.push(0);
        this.loadFrames();
    }

    loadFrames() {
        this.frame = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let frame = 0;
                if (this.getTile(x, y) === Tile.WALL) {
                    frame += 1;
                    if (this.getTile(x, y - 1) === Tile.WALL) {
                        frame += 1;
                    }
                    if (this.getTile(x - 1, y) === Tile.WALL) {
                        frame += 2;
                    }
                    if (this.getTile(x + 1, y) === Tile.WALL) {
                        frame += 4;
                    }
                    if (this.getTile(x, y + 1) === Tile.WALL) {
                        frame += 8;
                    }
                }
                this.frame.push(frame);
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        const pos = new Vec();
        const box = new Box(pos, this.size, this.size * 1.5);
        let i = 0;
        for (let y = 0; y < this.height; y++) {
            const last = y === this.height - 1;
            for (let x = 0; x < this.width; x++) {
                const frame = this.frame[i++];
                if (!frame && !last) {
                    continue;
                }
                pos.set(x, y).scale(this.size);
                Sprite.draw(ctx, "cave1", box, frame);
            }
            pos.x += this.size;
        }
        super.render(ctx);
    }

    setTile(x: number, y: number, tile: number) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this.tiles[y * this.width + x] = tile;
        }
    }

    getTile(x: number, y: number): number {
        return y >= 0 && y < this.height && x >= 0 && x < this.width
            ? this.tiles[y * this.width + x]
            : Tile.WALL;
    }

    getPosByTile(tile: number, row: number = -1): Vec[] {
        const start = row > 0 ? row : 0;
        const end = row >= 0 ? row + 1 : this.height;
        const result: Vec[] = [];
        let i = start * this.width;
        for (let y = start; y < end; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[i++] === tile) {
                    result.push(new Vec(x * this.size, y * this.size));
                }
            }
        }
        return result;
    }

    collideX({ pos, width, height }: Box, correct: boolean = false): boolean {
        let size = this.size,
            top = Math.floor(pos.y / size),
            left = Math.floor(pos.x / size),
            right = Math.floor((pos.x + width) / size);
        for (let i = top * size; i < pos.y + height; i += size) {
            let y = Math.floor(i / size);
            if (!this.getTile(left, y)) {
                if (correct) {
                    pos.x += (left + 1) * size - pos.x;
                }
                return true;
            }
            if (!this.getTile(right, y)) {
                if (correct) {
                    pos.x -= pos.x + width - right * size;
                }
                return true;
            }
        }
        return false;
    }

    collideY({ pos, width, height }: Box, correct: boolean = false): boolean {
        let size = this.size,
            top = Math.floor(pos.y / size),
            left = Math.floor(pos.x / size),
            bottom = Math.floor((pos.y + height) / size);
        for (let i = left * size; i < pos.x + width; i += size) {
            let x = Math.floor(i / size);
            if (!this.getTile(x, top)) {
                if (correct) {
                    pos.y += (top + 1) * size - pos.y;
                }
                return true;
            }
            if (!this.getTile(x, bottom)) {
                if (correct) {
                    pos.y -= pos.y + height - bottom * size;
                }
                return true;
            }
        }
        return false;
    }

    createNav(pos: Vec) {
        const target = pos.tile(this.size);
        this.nav = new Array(this.tiles.length).fill(TileMap.MAX_NAV);
        this.setNav(target.x, target.y);
    }

    lockNav(pos: Vec) {
        const tile = pos.tile(this.size);
        this.nav[tile.y * this.width + tile.x] = TileMap.MAX_NAV;
    }

    setDirection(item: IMovable) {
        const size = this.size;
        const center = item.box.center;
        const pos = center.tile(size);
        item.dir.set(0, 0);
        let weight = TileMap.MAX_NAV;
        weight = this.setDir(item, pos, new Vec(1, 0), weight);
        weight = this.setDir(item, pos, new Vec(-1, 0), weight);
        weight = this.setDir(item, pos, new Vec(0, 1), weight);
        weight = this.setDir(item, pos, new Vec(0, -1), weight);
        if (item.dir.x) {
            if (this.getTile(pos.x, pos.y + 1)) {
                weight = this.setDir(item, pos, new Vec(item.dir.x, 1), weight);
            }
            if (this.getTile(pos.x, pos.y - 1)) {
                weight = this.setDir(item, pos, new Vec(item.dir.x, -1), weight);
            }
        } else if (item.dir.y) {
            if (this.getTile(pos.x + 1, pos.y)) {
                weight = this.setDir(item, pos, new Vec(1, item.dir.y), weight);
            }
            if (this.getTile(pos.x - 1, pos.y)) {
                weight = this.setDir(item, pos, new Vec(-1, item.dir.y), weight);
            }
        }
        item.dir.add(pos).scale(size).add(size / 2).sub(center).normalize();
    }

    private setDir(item: IMovable, pos: Vec, dir: Vec, weight: number) {
        const nav = this.getNav(pos.x + dir.x, pos.y + dir.y);
        if (weight > nav) {
            item.dir = dir;
            weight = nav;
        }
        return weight;
    }

    private getNav(x: number, y: number): number {
        return y >= 0 && y < this.height && x >= 0 && x < this.width
            ? this.nav[y * this.width + x]
            : TileMap.MAX_NAV;
    }

    private setNav(x: number, y: number, weight: number = 0) {
        if (
            weight >= TileMap.MAX_NAV ||
            !this.getTile(x, y) ||
            weight >= this.getNav(x, y)
        ) {
            return;
        }
        this.nav[y * this.width + x] = weight++;
        this.setNav(x + 1, y, weight);
        this.setNav(x, y + 1, weight);
        this.setNav(x - 1, y, weight);
        this.setNav(x, y - 1, weight);
    }

}
