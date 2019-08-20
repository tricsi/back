import Hero from "./Hero";
import GameObject from "./GameObject";
import { Input, Rand } from "../common";
import TileMap, { Tile } from "./TileMap";

export default class GameScene extends GameObject{

    hero = new Hero();
    map = new TileMap(12, 16, 16);

    constructor() {
        super();
        this.addChild(this.map);
        this.addChild(this.hero);
        this.hero.pos.set(96, 192);
        this.map.set(3, 3, Tile.WALL);
    }

    update(delta: number) {
        super.update(delta);
        const move = this.hero.move(delta);
        if (move.x) {
            this.hero.pos.x += move.x;
            this.map.collideX(this.hero.box);
        }
        if (move.y) {
            this.hero.pos.y += move.y;
            this.map.collideY(this.hero.box);
        }
    }

    pointer(x: number, y: number) {
        this.hero.aim.set(x, y);
    }

    input(keys: boolean[], down: boolean) {
        let x = 0;
        let y = 0;
        if (keys[Input.LEFT]) {
            x -= 1;
        }
        if (keys[Input.RIGHT]) {
            x += 1;
        }
        if (keys[Input.UP]) {
            y -= 1;
        }
        if (keys[Input.DOWN]) {
            y += 1;
        }
        this.hero.dir.set(x, y);
        this.hero.fire = keys[Input.FIRE] === true;
    }
}
