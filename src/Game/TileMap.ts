import GameObject from "./GameObject";
import { Box, Vec } from "./Math";

export enum Tile {
    WALL = 0,
    GROUND = 1,
    HOLE = 2,
}

export default class TileMap extends GameObject {

    tiles: number[][] = [];

    constructor(
        public width: number,
        public height: number,
        public size: number
    ) {
        super();
        for (let i = 0; i < height; i++) {
            const row: number[] = [];
            row.length = width;
            row.fill(Tile.GROUND);
            this.tiles[i] = row;
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        const size = this.size;
        ctx.save();
        ctx.fillStyle = "#ccc";
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === Tile.GROUND) {
                    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
                }
            }
        }
        ctx.restore();
    }

    set(x: number, y: number, tile: number) {
        if (y >= 0 && y < this.tiles.length && x >= 0 && this.tiles[y].length > x) {
            this.tiles[y][x] = tile;
        }
    }

    get(x: number, y: number): number {
        return y >= 0 && y < this.tiles.length && x >= 0 && this.tiles[y].length > x
            ? this.tiles[y][x]
            : Tile.WALL;
    }

    collideY(box: Box) {
        let pos = box.pos,
            size = this.size,
            x = Math.floor(pos.x / size),
            y = Math.floor(pos.y / size),
            w = Math.ceil(box.width / 16),
            h = Math.ceil(box.height / 16);
        for (let i = 0; i <= w; i++) {
            if (
                this.get(x + i, y) !== Tile.GROUND &&
                pos.y < (y + 1) * size
            ) {
                pos.y += (y + 1) * size - pos.y;
            }
            if (
                this.get(x + i, y + h) !== Tile.GROUND &&
                pos.y + box.height > (y + h) * size
            ) {
                pos.y += (y + h) * size - (pos.y + box.height);
            }
        }
    }

    collideX(box: Box) {
        let pos = box.pos,
            size = this.size,
            x = Math.floor(pos.x / size),
            y = Math.floor(pos.y / size),
            w = Math.ceil(box.width / 16),
            h = Math.ceil(box.height / 16);
        for (let i = 0; i <= h; i++) {
            if (
                this.get(x, y + i) !== Tile.GROUND &&
                pos.x < (x + 1) * size
            ) {
                pos.x += (x + 1) * size - pos.x;
            }
            if (
                this.get(x + w, y + i) !== Tile.GROUND &&
                pos.x + box.width > (x + w) * size
            ) {
                pos.x += (x + w) * size - (pos.x + box.width);
            }
        }
    }
}
