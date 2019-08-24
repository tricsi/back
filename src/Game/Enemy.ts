import { Vec, Box } from "./Math";
import Hero from "./Hero";
import Bullet from "./Bullet";
import { IMovable, GameObject, ObjectSpawner } from "./GameEngine";

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
            this.parent.removeChild(this);
            return;
        }
        for (const bullet of this.hero.children) {
            if (this.box.collide((<Bullet>bullet).box)) {
                this.parent.removeChild(this);
                this.hero.removeChild(bullet);
                return;
            }
        }
    }
}
