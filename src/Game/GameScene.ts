import Hero from "./Hero";
import { GameObject, GameEvent, ObjectPool } from "./GameEngine";
import { Input } from "../common";
import { TileMap, Tile } from "./TileMap";
import { EnemyRunner, EnemySpawner, EnemyCamper, EnemyShooter, Enemy } from "./Enemy";
import { Vec, Box } from "./Math";
import { Bullet, Grenade } from "./Weapon";
import Hud from "./Hud";
import { Medkit, Item, AmmoBox, GrenadeBox } from "./Item";
import config from "../config";
import Explosion from "./Explosion";
import Camera from "./Camera";

export default class GameScene extends GameObject {

    hero = new Hero(config.hero);
    map = new TileMap("map");
    cam = new Camera(config.cam, this.map.bottom);
    aim = new Vec();
    camps: ObjectPool = new ObjectPool(() => new EnemyCamper(this.hero, config.camp));
    shots: ObjectPool = new ObjectPool(() => new EnemyShooter(this.hero, config.shot));
    holes: EnemySpawner[] = [];
    explos: ObjectPool = new ObjectPool(() => new Explosion());

    constructor() {
        super();
        this.hero.pos.set(96, 128);
        this.map.createNav(this.hero.box.center);
        this.addChild(this.cam)
            .addChild(this.map)
            .addChild(this.camps)
            .addChild(this.shots)
            .addChild(this.hero)
            .addChild(this.explos)
            .addChild(new Hud(this.hero));
        for (const pos of this.map.getPosByTile(Tile.CAMP)) {
            this.camps.create((item: EnemyCamper) => item.pos.set(pos));
        }
        for (const pos of this.map.getPosByTile(Tile.SHOT)) {
            this.shots.create((item: EnemyShooter) => item.pos.set(pos));
        }
        for (const pos of this.map.getPosByTile(Tile.ITEM)) {
            let item: Item;
            switch (Math.floor(Math.random() * 2.999)) {
                case 0: item = new Medkit(this.hero, 100, "#fff"); break;
                case 1: item = new AmmoBox(this.hero, 200, "#0ff"); break;
                case 2: item = new GrenadeBox(this.hero, 5, "#0c0"); break;
            }
            item.pos.set(pos);
            this.addChild(item);
        }
        for (const pos of this.map.getPosByTile(Tile.HOLE)) {
            const hole = new EnemySpawner(
                () => new EnemyRunner(this.hero, config.runr),
                (item: EnemyRunner) => item.pos.set(pos),
                new Box(pos, 16, 16),
                config.hole
            );
            this.holes.push(hole);
            this.addChild(hole);
        }
        this.bind();
    }

    bind() {
        this.on("hit", (event: GameEvent) => {
            const target = event.target;
            if (target instanceof Enemy) {
                target.hp -= event.payload;
                if (target.hp <= 0) {
                    this.emit(new GameEvent("kill", target));
                    this.hero.score += target.score;
                    target.parent.removeChild(target);
                    target.hp = target.max;
                }
            }
            if (target instanceof Hero) {
                target.hp -= event.payload;
                if (target.hp < 0) {
                    target.hp = 0;
                }
            }
        });

        this.on("kill", (event: GameEvent) => {
            this.explos.create((item: Explosion) => {
                if (event.target instanceof Enemy) {
                    item.pos.set(event.target.pos);
                    item.time = 0;
                    item.frame = 0;
                }
            });
        });

        this.on("explode", (event: GameEvent) => {
            const grenade = event.target as Grenade;
            this.camps.each((enemy: EnemyCamper) => this.explode(grenade, enemy));
            this.shots.each((enemy: EnemyShooter) => this.explode(grenade, enemy));
            for (const spawner of this.holes) {
                spawner.each((enemy: EnemyRunner) => this.explode(grenade, enemy));
            }
        });
    }

    explode(grenade: Grenade, item: Enemy) {
        const center = grenade.box.center;
        const dist = item.box.center.sub(center).length;
        if (grenade.radius >= dist) {
            this.emit(new GameEvent("hit", item, grenade.dmg));
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(Math.round(this.cam.pos.x), -Math.round(this.cam.pos.y));
        super.render(ctx);
        ctx.restore();
    }

    update(delta: number) {
        super.update(delta);
        this.updateHero(delta);
        this.updateProjectile(delta);
        this.updateMap();
        this.updateSpawners(delta);
    }

    updateHero(delta: number) {
        const hero = this.hero;
        if (hero.dir.x) {
            hero.pos.x += hero.dir.x * hero.spd * delta;
            this.map.collideX(hero.box, true);
        }
        if (hero.dir.y) {
            hero.pos.y += hero.dir.y * hero.spd * delta;
        }
        this.map.collideY(hero.box, true);

        const cam = this.cam;
        hero.aim.set(this.aim).add(-cam.pos.x, cam.pos.y);
        const bottom = cam.pos.y + cam.box.height - hero.pos.y - hero.box.height
        if (bottom < 0) {
            hero.pos.y += bottom;
        }
    }

    updateProjectile(delta: number) {
        this.hero.gun.each((item: Bullet) => {
            if (this.map.collideX(item.box) || this.map.collideY(item.box)) {
                item.parent.removeChild(item);
            }
        });
        this.hero.grenades.each((item: Grenade) => {
            if (this.map.collideX(item.box) || this.map.collideY(item.box)) {
                item.emit(new GameEvent("explode", item));
                item.parent.removeChild(item);
            }
        });
        this.shots.each((enemy: EnemyShooter) => {
            enemy.gun.each((item: Bullet) => {
                if (this.map.collideX(item.box) || this.map.collideY(item.box)) {
                    item.parent.removeChild(item);
                }
            });
        });
    }

    updateMap() {
        this.map.createNav(this.hero.box.center);
        for (const spawner of this.holes) {
            for (const item of spawner.children) {
                this.map.lockNav(item.box.center);
            }
        }
    }

    updateSpawners(delta: number) {
        for (const spawner of this.holes) {
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
            this.hero.launch();
        }
    }
}
