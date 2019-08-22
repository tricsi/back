import GameObject from "./GameObject";
import { Box, Vec } from "./Math";
import IMovable from "./IMovable";

export enum Tile {
    WALL = 0,
    GROUND = 1,
    HOLE = 2,
}

export default class TileMap extends GameObject {

    static readonly MAX_NAV = 30;

    tiles: number[][] = [];
    nav: number[][] = [];

    constructor(
        public width: number,
        public height: number,
        public size: number
    ) {
        super();
        for (let i = 0; i < height; i++) {
            let row: number[] = [];
            row.length = width;
            row.fill(Tile.GROUND);
            this.tiles[i] = row;
            row = [];
            row.length = width;
            row.fill(TileMap.MAX_NAV);
            this.nav[i] = row;
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        const size = this.size;
        ctx.save();
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === Tile.GROUND) {
                    ctx.fillStyle = "#ccc";
                    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
                    // ctx.fillStyle = "#ddd";
                    // ctx.fillText(this.nav[y][x].toString(), x * size + 2, y * size + 10)
                }
            }
        }
        ctx.restore();
        super.render(ctx);
    }

    set(x: number, y: number, tile: number) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this.tiles[y][x] = tile;
        }
    }

    get(x: number, y: number): number {
        return y >= 0 && y < this.height && x >= 0 && x < this.width
            ? this.tiles[y][x]
            : Tile.WALL;
    }

    collideX(box: Box, correct: boolean = false): boolean {
        let pos = box.pos,
            size = this.size,
            top = Math.floor(pos.y / size),
            left = Math.floor(pos.x / size),
            right = Math.floor((pos.x + box.width) / size);
        for (let i = top * size; i < pos.y + box.height; i += size) {
            let y = Math.floor(i / size);
            if (this.get(left, y) !== Tile.GROUND) {
                if (correct) {
                    pos.x += (left + 1) * size - pos.x;
                }
                return true;
            }
            if (this.get(right, y) != Tile.GROUND) {
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
            if (this.get(x, top) !== Tile.GROUND) {
                if (correct) {
                    pos.y += (top + 1) * size - pos.y;
                }
                return true;
            }
            if (this.get(x, bottom) != Tile.GROUND) {
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
            if (this.get(pos.x, pos.y + 1) !== Tile.WALL) {
                weight = this.setDir(item, pos, new Vec(item.dir.x, 1), weight);
            }
            if (this.get(pos.x, pos.y - 1) !== Tile.WALL) {
                weight = this.setDir(item, pos, new Vec(item.dir.x, -1), weight);
            }
        } else if (item.dir.y) {
            if (this.get(pos.x + 1, pos.y) !== Tile.WALL) {
                weight = this.setDir(item, pos, new Vec(1, item.dir.y), weight);
            }
            if (this.get(pos.x - 1, pos.y) !== Tile.WALL) {
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
            this.get(x, y) === Tile.WALL ||
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
