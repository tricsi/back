import Hero from "./Hero";
import { GameObject, GameEvent, ObjectPool } from "./GameEngine";
import { Input, Rand } from "../common";
import { TileMap, Tile } from "./TileMap";
import { EnemyRunner, EnemySpawner, EnemyCamper, EnemyShooter, Enemy } from "./Enemy";
import { Vec, Box } from "./Math";
import { Bullet, Grenade } from "./Weapon";
import Hud, { GameStatus } from "./Hud";
import { Medkit, Item, AmmoBox, GrenadeBox } from "./Item";
import config from "../config";
import Explosion from "./Explosion";
import Camera from "./Camera";
import sfx from "../sfx";

export default class GameScene extends GameObject {

    hero = new Hero(config.hero);
    map = new TileMap("map");
    cam = new Camera(this.hero, config.cam, this.map.bottom);
    hud = new Hud(this.hero, this.cam);
    aim = new Vec();
    holes: EnemySpawner[] = [];
    camps: ObjectPool = new ObjectPool(() => new EnemyCamper(this.hero, config.camp));
    shots: ObjectPool = new ObjectPool(() => new EnemyShooter(this.hero, config.shot));
    explos: ObjectPool = new ObjectPool(() => new Explosion());

    constructor() {
        super();
        this.hero.pos.set(96, 112);
        this.map.createNav(this.hero.box.center);
        this.addChild(this.cam)
            .addChild(this.map);
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
        this.addChild(this.camps)
            .addChild(this.shots)
            .addChild(this.hero)
            .addChild(this.explos);
        this.bind();
    }

    bind() {
        this.on("all", (event: GameEvent) => sfx.play(event.type));
        this.on("hit", this.onHit);
        this.on("kill", this.onKill);
        this.on("death", this.onDeath);
        this.on("explode", this.onExplode);
        this.on("lose", (event: GameEvent) => {
            this.hud.satus = GameStatus.lose;
        });
        this.on("win", (event: GameEvent) => {
            this.hud.satus = GameStatus.win;
        });
    }

    onHit = (event: GameEvent) => {
        const target = event.target;
        if (target instanceof Enemy) {
            target.hit(event.payload);
        }
        if (target instanceof Hero) {
            target.hit(event.payload);
        }
    }

    onKill = (event: GameEvent) => {
        const target = event.target as Enemy;
        this.hero.score += target.score;
        this.createExplo(target.pos);
    }

    onDeath = (event: GameEvent) => {
        const hero = event.target as Hero;
        const pos = hero.pos.clone();
        this.createExplo(pos);
        this.createExplo(pos.add(0, 8));
        this.revive(hero);
    }

    revive(hero: Hero) {
        const map = this.map;
        let row = Math.floor(this.cam.box.bottom / map.size);
        if (row > map.height) {
            row = map.height - 1;
        }
        const pos = map.getPosByTile(Tile.GROUND, row);
        const i = pos.length > 1 ? Rand.get(pos.length - 1) : 0;
        hero.hp = hero.max;
        hero.pos.set(pos[i]);
    }

    onExplode = (event: GameEvent) => {
        const grenade = event.target as Grenade;
        this.camps.each((enemy: EnemyCamper) => this.explode(grenade, enemy));
        this.shots.each((enemy: EnemyShooter) => this.explode(grenade, enemy));
        for (const spawner of this.holes) {
            spawner.each((enemy: EnemyRunner) => this.explode(grenade, enemy));
        }
    }

    explode(grenade: Grenade, item: Enemy) {
        const center = grenade.box.center;
        const dist = item.box.center.sub(center).length;
        if (grenade.radius >= dist) {
            this.emit(new GameEvent("hit", item, grenade.dmg));
        }
    }

    createExplo(pos: Vec) {
        this.explos.create((item: Explosion) => {
            item.pos.set(pos);
            item.time = 0;
            item.flip = Math.random() < 0.5;
            item.frame = 0;
        });
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(0, -Math.round(this.cam.pos.y));
        super.render(ctx);
        ctx.restore();
        this.hud.render(ctx);
    }

    update(delta: number) {
        this.hud.update(delta);
        if (this.hud.satus !== GameStatus.run) {
            return;
        }
        super.update(delta);
        this.updateProjectile(delta);
        this.updateHero(delta);
        this.updateMap();
        this.updateSpawners(delta);
    }

    updateHero(delta: number) {
        const hero = this.hero;
        const map = this.map;
        const cam = this.cam;
        const bottom = cam.box.bottom - hero.box.bottom;
        if (hero.dir.x) {
            hero.pos.x += hero.dir.x * hero.spd * delta;
            map.collideX(hero.box, true);
        }
        if (hero.dir.y && (hero.dir.y < 0 || bottom > 0)) {
            hero.pos.y += hero.dir.y * hero.spd * delta;
            map.collideY(hero.box, true);
        }
        if (hero.box.bottom >= map.bottom) {
            hero.emit(new GameEvent("win", hero));
        }
        hero.aim.set(this.aim).add(-cam.pos.x, cam.pos.y);
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
