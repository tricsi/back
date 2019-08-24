import Hero from "./Hero";
import { GameObject, GameEvent } from "./GameEngine";
import { Input } from "../common";
import TileMap, { Tile } from "./TileMap";
import Enemy, { EnemySpawner } from "./Enemy";
import { Vec, Box } from "./Math";
import { Bullet } from "./Weapon";

export default class GameScene extends GameObject {

    hero = new Hero(new Box(new Vec(0, 100), 16, 24), 0.2, 100);
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
                new Box(pos, 16, 16),
                100, 20, 180, 320
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
        const map = this.map;
        const cam = this.cam;
        let speed = this.spd * delta;
        const bottom = map.height * map.size - cam.height;
        cam.pos.y += speed;
        if (cam.pos.y > bottom) {
            cam.pos.y = bottom;
            speed = 0;
        }
        this.updateHero(delta, speed);
        this.updateProjectile(delta);
        this.updateMap();
        this.updateSpawners(delta);
        super.update(delta);
    }

    updateHero(delta: number, speed: number) {
        const hero = this.hero;
        if (hero.dir.x) {
            hero.pos.x += hero.dir.x * hero.spd * delta;
            this.map.collideX(hero.box, true);
        }
        if (hero.dir.y) {
            hero.pos.y += hero.dir.y * hero.spd * delta;
        }
        hero.pos.y += speed;
        this.map.collideY(hero.box, true);

        const cam = this.cam;
        hero.aim.set(this.aim).add(-cam.pos.x, cam.pos.y);
        const bottom = cam.pos.y + cam.height - hero.pos.y - hero.box.height
        if (bottom < 0) {
            hero.pos.y += bottom;
        }
    }

    updateProjectile(delta: number) {
        this.hero.bullets.children.forEach((item: Bullet) => {
            const speed = item.spd * delta;
            item.pos.add(item.dir.x * speed, item.dir.y * speed);
            if (
                this.map.collideX(item.box) ||
                this.map.collideY(item.box)
            ) {
                item.parent.removeChild(item);
            }
        });
    }

    updateMap() {
        this.map.createNav(this.hero.box.center);
        for (const spawner of this.spawners) {
            for (const item of spawner.children) {
                this.map.lockNav(item.box.center);
            }
        }
    }

    updateSpawners(delta: number) {
        for (const spawner of this.spawners) {
            spawner.toggle(this.hero.pos);
            for (const item of spawner.children) {
                this.map.setDirection(item);
                const speed = item.spd * delta;
                item.pos.add(item.dir.x * speed, item.dir.y * speed);
            }
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
