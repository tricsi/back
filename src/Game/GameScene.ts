import Hero from "./Hero";
import GameObject from "./GameObject";
import { Input } from "../common";
import TileMap, { Tile } from "./TileMap";
import EnemySpawner from "./EnemySpawner";
import Enemy from "./Enemy";
import { Vec } from "./Math";
import Bullet from "./Bullet";

export default class GameScene extends GameObject{

    hero = new Hero(() => new Bullet());
    map = new TileMap(12, 16, 16);
    spawners = [
        new EnemySpawner(
            () => new Enemy(this.hero),
            (item: Enemy) => item.pos.set(item.parent.pos),
            new Vec(64, 16),
            100,
            20
        ),
        new EnemySpawner(
            () => new Enemy(this.hero),
            (item: Enemy) => item.pos.set(item.parent.pos),
            new Vec(128, 32),
            100,
            20
        ),
    ];

    constructor() {
        super();
        this.map.set(3, 4, Tile.WALL);
        this.map.set(4, 4, Tile.WALL);
        this.map.set(5, 4, Tile.WALL);
        this.map.set(7, 6, Tile.WALL);
        this.map.set(8, 6, Tile.WALL);
        this.map.set(9, 5, Tile.WALL);
        this.hero.pos.set(96, 192);
        this.addChild(this.map);
        this.addChild(this.hero);
        this.spawners.forEach(spawner => this.addChild(spawner));
    }

    update(delta: number) {
        super.update(delta);
        this.updateHero(this.hero, delta);
        this.hero.children.forEach((item: Bullet) => this.updateProjectile(item, delta));
        this.map.createNav(this.hero.box.center);
        this.spawners.forEach(spawner => {
            spawner.children.forEach((item: Enemy) => this.map.lockNav(item.box.center));
        });
        this.spawners.forEach(spawner => {
            spawner.children.forEach((item: Enemy) => this.updateEnemy(item, delta));
        });
    }

    updateHero(item: Hero, delta: number) {
        if (item.dir.x) {
            item.pos.x += item.dir.x * item.spd * delta;
            this.map.collideX(item.box, true);
        }
        if (item.dir.y) {
            item.pos.y += item.dir.y * item.spd * delta;
            this.map.collideY(item.box, true);
        }
    }

    updateEnemy(item: Enemy, delta: number) {
        this.map.setDirection(item);
        const speed = item.spd * delta;
        item.pos.add(item.dir.x * speed, item.dir.y * speed);
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
        this.hero.dir.set(x, y).normalize();
        this.hero.fire = keys[Input.FIRE] === true;
    }
}
