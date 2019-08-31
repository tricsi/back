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
    ITEM = 6,
}

export class TileMap extends GameObject {

    static readonly MAX_NAV = 30;

    height: number = 0;
    tiles: number[][] = [];
    nav: number[][] = [];
    frame: number[][] = [];

    constructor(
        public width: number,
        public size: number,
        cave: number[],
        segments: number[][][][]
    ) {
        super();
        for (const i of cave) {
            const top = this.height;
            const segment = segments[i];
            this.loadMap(segment[0]);
            if (segment.length > 1) {
                this.loadPoi(segment[1], top);
            }
            this.loadFrames();
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
                this.setTile(line[j], line[j + 1] + top, line[0]);
            }
        }
    }

    loadFrames() {
        for (let y = 0; y < this.height; y++) {
            this.frame[y] = [];
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
                this.frame[y][x] = frame;
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        const pos = new Vec();
        const box = new Box(pos, this.size, this.size * 2);
        for (let y = -1; y < this.height; y++) {
            pos.set(-1, y).scale(this.size);
            Sprite.draw(ctx, "cave", box, 15);
            for (let x = 0; x < this.width; x++) {
                pos.x += this.size;
                if (y < 0) {
                    Sprite.draw(ctx, "cave", box, 7);
                } else if (this.frame[y][x]) {
                    Sprite.draw(ctx, "cave", box, this.frame[y][x] - 1);
                }
            }
            pos.x += this.size;
            Sprite.draw(ctx, "cave", box, 15);
        }
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
