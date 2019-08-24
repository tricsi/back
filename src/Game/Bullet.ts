import { Vec, Box } from "./Math";
import { GameObject } from "./GameEngine";

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
        ctx.arc(pos.x, pos.y, this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

}
