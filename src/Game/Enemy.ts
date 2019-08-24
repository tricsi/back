import { Vec, Box } from "./Math";
import Hero from "./Hero";
import { Bullet } from "./Weapon";
import { IMovable, GameObject, ObjectSpawner, GameEvent } from "./GameEngine";

export default class Enemy extends GameObject implements IMovable
{

    pos = new Vec();
    dir = new Vec();
    spd = 0.1;
    box = new Box(this.pos, 16, 16);
    parent: ObjectSpawner;

    constructor(public hero: Hero) {
        super();
    }

    render(ctx: CanvasRenderingContext2D) {
        const box = this.box;
        const pos = this.pos;
        ctx.save();
        ctx.fillStyle = "red";
        ctx.fillRect(Math.round(pos.x), Math.round(pos.y), box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        if (this.box.collide(this.hero.box)) {
            this.emit(new GameEvent("hit", this));
            this.parent.removeChild(this);
            return;
        }
        for (const bullet of this.hero.bullets.children) {
            if (this.box.collide((<Bullet>bullet).box)) {
                this.emit(new GameEvent("kill", this, bullet));
                this.parent.removeChild(this);
                this.hero.removeChild(bullet);
                return;
            }
        }
    }
}

export class EnemySpawner extends ObjectSpawner {

    children: Enemy[];
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

    create(init: (item: Enemy) => void = null): Enemy {
        return this.active
            ? super.create(init) as Enemy
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
        super.render(ctx);
        if (!this.active) {
            return;
        }
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.arc(Math.round(pos.x), Math.round(pos.y), this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

}
