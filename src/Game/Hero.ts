import { Box, Vec } from "./Math";
import Bullet from "./Bullet";
import { ObjectPool, IMovable } from "./GameEngine";

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
        ctx.fillRect(pos.x, pos.y, box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        super.update(delta);

        this.fireTime -= delta;
        if (this.fire && this.fireTime <= 0) {
            this.create((bullet: Bullet) => {
                const box = bullet.box;
                const center = this.box.center;
                bullet.pos.set(center.x - box.width / 2, center.y - box.height / 2);
                bullet.dir = this.aim.clone().sub(center).normalize();
            });
            this.fireTime = this.fireSpeed;
        }
    }

}
