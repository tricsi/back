import Hero from "./Hero";
import { GameObject, GameEvent } from "./GameEngine";
import { Input } from "../common";
import TileMap, { Tile } from "./TileMap";
import Enemy, { EnemySpawner } from "./Enemy";
import { Vec, Box } from "./Math";
import { Bullet, Grenade } from "./Weapon";

export default class GameScene extends GameObject {

    hero = new Hero(new Box(new Vec(0, 100), 16, 24), 0.2, 100);
    map = new TileMap(12, 16, [1, 2, 3, 4, 0]);
    cam = new Box(new Vec(0, -64), 192, 256);
    spd = 0.02;
    aim = new Vec();
    spawners: EnemySpawner[] = this.map.getPosByTile(Tile.HOLE).map(pos => {
        const spawner = new EnemySpawner(
            () => new Enemy(this.hero),
            (item: Enemy) => item.pos.set(pos),
            new Box(pos, 16, 16),
            100, 20, 180, 320
        );
        return spawner;
    });

    constructor() {
        super();
        this.hero.pos.set(96, 128);
        this.map.createNav(this.hero.box.center);
        this.addChild(this.map);
        for (const spawner of this.spawners) {
            this.addChild(spawner);
        }
        this.addChild(this.hero);
        this.bind();
    }

    bind() {
        this.on("grenade", (event: GameEvent) => {
            const grenade = event.target as Grenade;
            const center = grenade.box.center;
            for (const spawner of this.spawners) {
                spawner.each((enemy: Enemy) => {
                    const dist = enemy.box.center.sub(center).length;
                    if (grenade.rad >= dist) {
                        this.emit(new GameEvent("kill", enemy, grenade));
                        enemy.parent.removeChild(enemy);
                    }
                });
            }
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
        super.update(delta);
        this.updateHero(delta, speed);
        this.updateProjectile(delta);
        this.updateMap();
        this.updateSpawners(delta);
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
        this.hero.bullets.each((item: Bullet) => {
            if (this.map.collideX(item.box) || this.map.collideY(item.box)) {
                item.parent.removeChild(item);
            }
        });
        this.hero.grenades.each((item: Grenade) => {
            if (this.map.collideX(item.box) || this.map.collideY(item.box)) {
                item.emit(new GameEvent("grenade", item));
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
        if (keys[Input.ALT] && down) {
            this.hero.grenade();
        }
    }
}
