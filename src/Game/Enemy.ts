import GameObject from "./GameObject";
import { Vec, Box } from "./Math";
import Hero from "./Hero";
import Bullet from "./Bullet";
import ObjectSpawner from "./ObjectSpawner";

export default class Enemy extends GameObject
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
        ctx.save();
        ctx.fillStyle = "red";
        ctx.fillRect(Math.round(box.x), Math.round(box.y), box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        for (const bullet of this.hero.bullets.children) {
            if (this.box.collide((<Bullet>bullet).box)) {
                this.parent.removeChild(this);
                this.hero.bullets.removeChild(bullet);
                return;
            }
        }
        this.dir = this.hero.pos.clone().sub(this.pos).normalize();
        const speed = this.spd * delta;
        this.pos.add(this.dir.x * speed, this.dir.y * speed);
    }
}
