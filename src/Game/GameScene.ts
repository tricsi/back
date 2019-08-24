import Hero from "./Hero";
import GameObject from "./GameObject";
import { Input } from "../common";
import TileMap, { Tile } from "./TileMap";
import EnemySpawner from "./EnemySpawner";
import Enemy from "./Enemy";
import { Vec, Box } from "./Math";
import Bullet from "./Bullet";

export default class GameScene extends GameObject{

    hero = new Hero(() => new Bullet());
    map = new TileMap(12, 16, [1, 2, 3, 4, 0]);
    cam = new Box(new Vec(0, -64), 192, 256);
    spd = 0.02;
    aim = new Vec();
    spawners: EnemySpawner[] = [];

    constructor() {
        super();
        this.hero.pos.set(96, 128);
        this.map.createNav(this.hero.box.center);
        this.addChild(this.map);
        this.addChild(this.hero);
        this.map.getPosByTile(Tile.HOLE).forEach(pos => {
            const spawner = new EnemySpawner(
                () => new Enemy(this.hero),
                (item: Enemy) => item.pos.set(pos),
                pos,
                100,
                20
            );
            this.spawners.push(spawner);
            this.addChild (spawner);
        });
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.cam.pos.x, -this.cam.pos.y);
        super.render(ctx);
        ctx.restore();
    }

    update(delta: number) {
        this.cam.pos.y += this.spd * delta;
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

    updateHero(hero: Hero, delta: number) {
        const map = this.map;
        const speed = this.spd * delta;
        if (hero.dir.x) {
            hero.pos.x += hero.dir.x * hero.spd * delta;
            map.collideX(hero.box, true);
        }
        if (hero.dir.y) {
            hero.pos.y += hero.dir.y * hero.spd * delta;
        }
        hero.pos.y += speed;
        hero.aim.set(this.aim).add(-this.cam.pos.x, this.cam.pos.y);
        map.collideY(hero.box, true);
        const bottom = this.cam.pos.y + this.cam.height - hero.pos.y - hero.box.height
        if (bottom < 0) {
            hero.pos.y += bottom;
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
        this.aim.set(x, y);
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
