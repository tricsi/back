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
        this.updateHero(delta);
    }

    updateHero(delta: number) {
        const hero = this.hero;
        if (hero.dir.x) {
            hero.pos.x += hero.dir.x * hero.spd * delta;
            this.map.collideX(hero.box, true);
        }
        if (hero.dir.y) {
            hero.pos.y += hero.dir.y * hero.spd * delta;
            this.map.collideY(hero.box, true);
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
