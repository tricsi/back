import GameObject from "./GameObject";
import { Box, Vec } from "./Math";

export default class Hero extends GameObject {

    pos: Vec = new Vec();
    aim: Vec = new Vec();
    move: Vec = new Vec();
    speed: number = 0.2;
    box: Box = new Box(this.pos, 16, 24);

    render(ctx: CanvasRenderingContext2D) {
        const box = this.box;
        ctx.save();
        ctx.fillStyle = "blue";
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        let speed = this.speed * delta;
        let x = this.move.x * speed;
        let y = this.move.y * speed;
        this.box.pos.add(x, y);
    }

}
