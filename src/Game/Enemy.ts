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

    hit(hp: number) {
        this.hp -= hp;
        if (this.hp > 0) {
            return;
        }
        this.emit(new GameEvent("kill", this));
        this.parent.removeChild(this);
        this.hp = this.max;
    }

}

export class EnemyCamper extends Enemy {

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "camp6", this.box);
    }

    update(delta: number) {
        super.update(delta);
        for (const bullet of this.hero.gun.children) {
            if (this.box.collide(bullet.box)) {
                this.emit(new GameEvent("hit", this, bullet.dmg));
                bullet.parent.removeChild(bullet);
                return;
            }
        }
        if (this.box.collide(this.hero.box)) {
            this.emit(new GameEvent("hit", this.hero, this.dmg));
            this.emit(new GameEvent("kill", this));
            this.parent.removeChild(this);
            return;
        }
    }

}

export class EnemyWorm extends Enemy {

    spd: number;
    frq: number;
    time = 0;
    frame = 0;
    hitFrame = 0;
    active = true;

    constructor(public hero: Hero, {hp, dmg, score, spd, frq}: IConfig = {}) {
        super(hero, {hp, dmg, score});
        this.spd = spd;
        this.frq = frq;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.active) {
            const frame = Math.abs(this.frame % 5 - 2);
            Sprite.draw(ctx, "worm1", this.box, frame);
        }
    }

    update(delta: number) {
        super.update(delta);
        this.time += delta;
        this.frame = Math.floor(this.time % this.frq / this.spd);
        this.active = this.frame < 5;
        if (!this.active || this.frame === this.hitFrame) {
            return;
        }
        if (this.box.collide(this.hero.box)) {
            this.hitFrame = this.frame;
            this.emit(new GameEvent("hit", this.hero, this.dmg));
            return;
        }
    }

}

export class EnemyShooter extends EnemyCamper {

    active = false;
    near: number;
    far: number;
    gun: Weapon;

    constructor(public hero: Hero, {hp, dmg, score, near, far, gun}: IConfig = {}) {
        super(hero, {hp, dmg, score});
        this.near = near;
        this.far = far;
        this.gun = new Weapon(() => new Bullet(gun.bul), gun);
        this.addChild(this.gun);
    }

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "shot1", this.box);
        this.gun.render(ctx);
    }

    update(delta: number) {
        super.update(delta);
        const hero = this.hero;
        this.gun.each((bullet: Bullet) => {
            if (bullet.box.collide(hero.box)) {
                this.emit(new GameEvent("hit", hero, bullet.dmg));
                bullet.parent.removeChild(bullet);
            }
        });
        const center = this.box.center;
        const diff = hero.box.center.sub(center);
        const distance = diff.length;
        this.active = (this.active && distance < this.far) || (
            !this.active && distance < this.near &&
            hero.box.bottom > this.pos.y
        );
        if (!this.active) {
            return;
        }
        this.gun.create((bullet: Bullet) => {
            const box = bullet.box;
            bullet.dir.set(diff.normalize());
            bullet.pos.set(center.sub(box.width / 2, box.height / 2));
            this.emit(new GameEvent("eject", bullet));
        });
    }

}

export class EnemyRunner extends EnemyCamper implements IMovable
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
