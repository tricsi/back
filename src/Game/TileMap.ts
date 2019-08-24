import { IMovable, GameObject } from "./GameEngine";
import { Box, Vec } from "./Math";

export enum Tile {
    WALL = 0,
    GROUND = 1,
    HOLE = 2,
}

class TileSegment {

    constructor(
        public map: number[][],
        public poi: number[][] = []
    ) {
    }

}

export default class TileMap extends GameObject {

    static readonly MAX_NAV = 30;

    segments: TileSegment[] = [
        new TileSegment([[12]]), // 0 = end
        new TileSegment([[12]], [[2,3,3,10,5]]), // 1 = start
        new TileSegment([[4,3,12],[6,3,9],[4,0,9]]), // 2 = corridor
        new TileSegment([[6],[4,0,4,8,12]]), // 3 = block
        new TileSegment([[6],[3,0,2,4,8,10,12]]), // 4 = blocks
    ];
    height: number = 0;
    tiles: number[][] = [];
    nav: number[][] = [];

    constructor(
        public width: number,
        public size: number,
        cave: number[]
    ) {
        super();
        for (const i of cave) {
            const top = this.height;
            const segment = this.segments[i];
            this.loadMap(segment.map);
            this.loadPoi(segment.poi, top);
        }
    }

    loadMap(data: number[][]) {
        for (const line of data) {
            for (let i = 0; i < line[0]; i++) {
                const row = new Array(this.width);
                if (line.length === 1) {
                    row.fill(Tile.GROUND);
                } else {
                    row.fill(Tile.WALL);
                    for (let j = 1; j < line.length; j += 2) {
                        row.fill(Tile.GROUND, line[j], line[j + 1]);
                    }
                }
                this.tiles[this.height] = row;
                this.nav[this.height++] = new Array(this.width).fill(TileMap.MAX_NAV);
            }
        }
    }

    loadPoi(data: number[][], top: number) {
        for (const line of data) {
            for (let j = 1; j < line.length; j += 2) {
                this.setTile(line[j], line[j + 1], line[0]);
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        const size = this.size;
        ctx.save();
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] !== Tile.WALL) {
                    ctx.fillStyle = "#ccc";
                    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
                    // ctx.fillStyle = "#eee";
                    // ctx.fillText(this.nav[y][x].toString(), x * size + 2, y * size + 10)
                }
            }
        }
        ctx.restore();
        super.render(ctx);
    }

    setTile(x: number, y: number, tile: number) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this.tiles[y][x] = tile;
        }
    }

    getTile(x: number, y: number): number {
        return y >= 0 && y < this.height && x >= 0 && x < this.width
            ? this.tiles[y][x]
            : Tile.WALL;
    }

    getPosByTile(tile: number): Vec[] {
        const result: Vec[] = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.height; x++) {
                if (this.tiles[y][x] === tile) {
                    result.push(new Vec(x * this.size, y * this.size));
                }
            }
        }
        return result;
    }

    collideX(box: Box, correct: boolean = false): boolean {
        let pos = box.pos,
            size = this.size,
            top = Math.floor(pos.y / size),
            left = Math.floor(pos.x / size),
            right = Math.floor((pos.x + box.width) / size);
        for (let i = top * size; i < pos.y + box.height; i += size) {
            let y = Math.floor(i / size);
            if (!this.getTile(left, y)) {
                if (correct) {
                    pos.x += (left + 1) * size - pos.x;
                }
                return true;
            }
            if (!this.getTile(right, y)) {
                if (correct) {
                    pos.x -= pos.x + box.width - right * size;
                }
                return true;
            }
        }
        return false;
    }

    collideY(box: Box, correct: boolean = false): boolean {
        let pos = box.pos,
            size = this.size,
            top = Math.floor(pos.y / size),
            left = Math.floor(pos.x / size),
            bottom = Math.floor((pos.y + box.height) / size);
        for (let i = left * size; i < pos.x + box.width; i += size) {
            let x = Math.floor(i / size);
            if (!this.getTile(x, top)) {
                if (correct) {
                    pos.y += (top + 1) * size - pos.y;
                }
                return true;
            }
            if (!this.getTile(x, bottom)) {
                if (correct) {
                    pos.y -= pos.y + box.height - bottom * size;
                }
                return true;
            }
        }
        return false;
    }

    createNav(pos: Vec) {
        const target = pos.tile(this.size);
        this.nav.forEach(row => row.fill(TileMap.MAX_NAV));
        this.setNav(target.x, target.y);
    }

    lockNav(pos: Vec) {
        const tile = pos.tile(this.size);
        this.nav[tile.y][tile.x] = TileMap.MAX_NAV;
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
            ? this.nav[y][x]
            : TileMap.MAX_NAV;
    }

    private setNav(x: number, y: number, weight: number = 0) {
        if (
            weight >= TileMap.MAX_NAV ||
            !this.getTile(x, y) ||
            weight >= this.nav[y][x]
        ) {
            return;
        }
        this.nav[y][x] = weight++;
        this.setNav(x + 1, y, weight);
        this.setNav(x, y + 1, weight);
        this.setNav(x - 1, y, weight);
        this.setNav(x, y - 1, weight);
    }

}
