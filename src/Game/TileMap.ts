import GameObject from "./GameObject";
import { Box } from "./Math";

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

}
