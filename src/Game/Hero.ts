import GameObject from "./GameObject";
import { Box, Vec } from "./Math";
import ObjectPool from "./ObjectPool";
import Bullet from "./Bullet";
import IMovable from "./IMovable";

export default class Hero extends ObjectPool implements IMovable {

    pos = new Vec(0, 100);
    dir = new Vec();
    aim = new Vec();
    spd = 0.2;
    box = new Box(this.pos, 16, 24);
    fire: boolean = false;
    fireTime: number = 0;
    fireSpeed:number = 100;

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        const box = this.box;
        const pos = this.pos;
        ctx.save();
        ctx.fillStyle = "blue";
        ctx.fillRect(Math.round(pos.x), Math.round(pos.y), box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        super.update(delta);

        this.fireTime -= delta;
        if (this.fire && this.fireTime <= 0) {
            this.create((bullet: Bullet) => {
                bullet.pos.set(this.pos.x + this.box.width / 2, this.pos.y + this.box.height / 2);
                bullet.dir = this.aim.clone().sub(this.pos).normalize();
            });
            this.fireTime = this.fireSpeed;
        }
    }

}
