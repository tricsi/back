import { Vec, Box } from "./Math";
import Hero from "./Hero";
import { Bullet, Weapon } from "./Weapon";
import { IMovable, GameObject, ObjectSpawner, GameEvent, IKillable, IKiller } from "./GameEngine";
import { IConfig } from "../config";
import Sprite from "./Sprite";

export class Enemy extends GameObject implements IKillable, IKiller {

    hp: number;
    max: number;
    dmg: number;
    score: number;
    pos = new Vec();
    box = new Box(this.pos, 16);

    constructor(public hero: Hero, {hp, dmg, score}: IConfig = {}) {
        super();
        this.hp = hp;
        this.max = hp;
        this.dmg = dmg;
        this.score = score
    }

    update(delta: number) {
        super.update(delta);
        if (this.box.collide(this.hero.box)) {
            this.emit(new GameEvent("hit", this.hero, this.dmg));
            this.emit(new GameEvent("kill", this));
            this.parent.removeChild(this);
            return;
        }
        for (const bullet of this.hero.gun.children) {
            if (this.box.collide(bullet.box)) {
                this.emit(new GameEvent("hit", this, bullet.dmg));
                bullet.parent.removeChild(bullet);
                return;
            }
        }
    }

}

export class EnemyCamper extends Enemy {

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "camp2", this.box);
    }

}

export class EnemyShooter extends Enemy {

    far: number;
    gun: Weapon;

    constructor(public hero: Hero, {hp, dmg, score, far, gun}: IConfig = {}) {
        super(hero, {hp, dmg, score});
        this.far = far;
        this.gun = new Weapon(() => new Bullet(gun.bul), gun);
        this.addChild(this.gun);
    }

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "shot1", this.box);
        super.render(ctx);
    }

    update(delta: number) {
        super.update(delta);
        const hero = this.hero;
        if (!hero.alive) {
            return;
        }
        this.gun.each((bullet: Bullet) => {
            if (bullet.box.collide(hero.box)) {
                this.emit(new GameEvent("hit", hero, bullet.dmg));
                bullet.parent.removeChild(bullet);
            }
        });
        const center = this.box.center;
        const diff = hero.box.center.sub(center);
        if (diff.length > this.far) {
            return;
        }
        this.gun.create((bullet: Bullet) => {
            const box = bullet.box;
            bullet.dir.set(diff.normalize());
            bullet.pos.set(center.sub(box.width / 2, box.height / 2));
            this.emit(new GameEvent("fire", bullet));
        });
    }

}

export class EnemyRunner extends Enemy implements IMovable
{

    dir = new Vec();
    spd: number;
    time = 0;
    parent: ObjectSpawner;

    constructor(public hero: Hero, {hp, dmg, score, far, gun, spd}: IConfig = {}) {
        super(hero, {hp, dmg, score, far, gun});
        this.spd = spd;
    }

    render(ctx: CanvasRenderingContext2D) {
        let frame = Math.floor(this.time % 400 / 100);
        Sprite.draw(ctx, "runner5", this.box, frame > 1 ? 3 - frame : frame, frame > 1);
    }

    update(delta: number) {
        super.update(delta);
        this.time += delta;
    }
}

export class EnemySpawner extends ObjectSpawner {

    children: EnemyRunner[];
    active = false;
    near: number;
    far: number;

    constructor(
        protected factory: () => GameObject,
        protected init: (item: GameObject) => void,
        public box: Box,
        {frq, limit, near, far}: IConfig
    ) {
        super(factory, init, box, frq, limit);
        this.near = near;
        this.far = far;
    }

    create(init: (item: EnemyRunner) => void = null): EnemyRunner {
        return this.active
            ? super.create(init) as EnemyRunner
            : null;
    }

    toggle(pos: Vec) {
        const distance = this.box.center.sub(pos).length;
        if (distance > this.far) {
            this.active = false;
        } else if (
            !this.active &&
            pos.y > this.box.center.y &&
            distance < this.near
        ) {
            this.active = true;
            this.emit(new GameEvent("spawn", this));
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        Sprite.draw(ctx, "hole1", this.box);
        super.render(ctx);
    }

}
