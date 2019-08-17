import GameObject from "./GameObject";
import { Vec, Box } from "./Math";

export default class Bullet extends GameObject {

    pos = new Vec();
    dir = new Vec();
    spd = 0.4;
    box = new Box(this.pos, 6);

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(Math.round(this.pos.x), Math.round(this.pos.y), this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update(delta: number) {
        const pos = this.pos;
        const speed = this.spd * delta;
        pos.add(this.dir.x * speed, this.dir.y * speed);
        if (this.parent && (Math.abs(pos.x) > 500 || Math.abs(pos.y) > 500)) {
            this.parent.removeChild(this);
        }
    }
}
