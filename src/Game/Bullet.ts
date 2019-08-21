import GameObject from "./GameObject";
import { Vec, Box } from "./Math";

export default class Bullet extends GameObject {

    pos = new Vec();
    dir = new Vec();
    spd = 0.4;
    box = new Box(this.pos, 6);

    render(ctx: CanvasRenderingContext2D): void {
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(Math.round(pos.x), Math.round(pos.y), this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

}
