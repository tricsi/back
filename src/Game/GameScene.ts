import Hero from "./Hero";
import GameObject from "./GameObject";
import { Input, Rand } from "../common";
import TileMap, { Tile } from "./TileMap";
import IMovable from "./IMovable";
import EnemySpawner from "./EnemySpawner";
import Enemy from "./Enemy";
import { Vec } from "./Math";
import Bullet from "./Bullet";
import ObjectSpawner from "./ObjectSpawner";

export default class GameScene extends GameObject{

    hero = new Hero(() => new Bullet());
    map = new TileMap(12, 16, 16);
    spawners = [
        new EnemySpawner(
            () => new Enemy(this.hero),
            (item: Enemy) => item.pos.set(item.parent.pos),
            new Vec(64, 16),
            500
        ),
        new EnemySpawner(
            () => new Enemy(this.hero),
            (item: Enemy) => item.pos.set(item.parent.pos),
            new Vec(128, 32),
            500
        ),
    ];

    constructor() {
        super();
        this.addChild(this.map);
        this.addChild(this.hero);
        this.spawners.forEach(spawner => this.addChild(spawner));
        this.map.set(3, 4, Tile.WALL);
        this.map.set(4, 4, Tile.WALL);
        this.map.set(5, 4, Tile.WALL);
        this.map.set(6, 5, Tile.WALL);
        this.map.set(7, 6, Tile.WALL);
        this.map.set(8, 6, Tile.WALL);
        this.map.set(9, 5, Tile.WALL);
        this.hero.pos.set(96, 192);
    }

    update(delta: number) {
        super.update(delta);
        this.updateMovable(this.hero, delta);
        this.map.createNav(this.hero.box.center);
        this.spawners.forEach(spawner => {
            spawner.children.forEach((item: Enemy) => {
                this.map.setDirection(item);
                this.updateMovable(item, delta)
            });
        });
        this.hero.children.forEach((item: Bullet) => this.updateProjectile(item, delta));
    }

    updateMovable(item: IMovable, delta: number) {
        if (item.dir.x) {
            item.pos.x += item.dir.x * item.spd * delta;
            this.map.collideX(item.box, true);
        }
        if (item.dir.y) {
            item.pos.y += item.dir.y * item.spd * delta;
            this.map.collideY(item.box, true);
        }
    }

    updateProjectile(item: Bullet, delta: number) {
        const speed = item.spd * delta;
        item.pos.add(item.dir.x * speed, item.dir.y * speed);
        if (
            this.map.collideX(item.box) ||
            this.map.collideY(item.box)
        ) {
            item.parent.removeChild(item);
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
