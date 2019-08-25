import { Vec, Box } from "./Math";
import Hero from "./Hero";
import { Bullet, Weapon } from "./Weapon";
import { IMovable, GameObject, ObjectSpawner, GameEvent, IKillable, IKiller } from "./GameEngine";

export class Enemy extends GameObject implements IKillable, IKiller {

    hp = this.maxHp;
    pos = new Vec();
    box = new Box(this.pos, 16);

    constructor(
        public hero: Hero,
        public maxHp: number,
        public dmg: number,
        public score: number
    ) {
        super();
    }

    update(delta: number) {
        super.update(delta);
        if (this.box.collide(this.hero.box)) {
            this.emit(new GameEvent("hit", this.hero, this.dmg));
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
        const box = this.box;
        const pos = box.center;
        ctx.save();
        ctx.fillStyle = "#0c0";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

}

export class EnemyShooter extends Enemy {

    gun = new Weapon(() => new Bullet(0.1, 10, 6, "#fff"), 500, 9999);

    constructor(
        public hero: Hero,
        public maxHp: number,
        public dmg: number,
        public score: number,
        public far: number
    ) {
        super(hero, maxHp, dmg, score);
        this.addChild(this.gun);
    }

    render(ctx: CanvasRenderingContext2D) {
        const box = this.box;
        const pos = box.center;
        ctx.save();
        ctx.fillStyle = "#c0c";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        super.render(ctx);
    }

    update(delta: number) {
        super.update(delta);
        this.gun.each((bullet: Bullet) => {
            if (bullet.box.collide(this.hero.box)) {
                this.emit(new GameEvent("hit", this.hero, bullet.dmg));
                bullet.parent.removeChild(bullet);
            }
        });
        const center = this.box.center;
        const diff = this.hero.box.center.sub(center);
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
    spd = 0.1;
    parent: ObjectSpawner;

    render(ctx: CanvasRenderingContext2D) {
        const box = this.box;
        const pos = this.pos;
        ctx.save();
        ctx.fillStyle = "#c00";
        ctx.fillRect(pos.x, pos.y, box.width, box.height);
        ctx.restore();
    }
}

export class EnemySpawner extends ObjectSpawner {

    children: EnemyRunner[];
    active = false;

    constructor(
        protected factory: () => GameObject,
        protected init: (item: GameObject) => void,
        public box: Box,
        public period: number = 0,
        public limit: number = 0,
        public near: number = 0,
        public far: number = 0
    ) {
        super(factory, init, box, period, limit);
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
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(Math.round(pos.x), Math.round(pos.y), this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        super.render(ctx);
    }

}
