import GameObject from "./GameObject";
import { Box, Vec } from "./Math";
import ObjectPool from "./ObjectPool";
import Bullet from "./Bullet";

export default class Hero extends GameObject {

    pos = new Vec(0, 100);
    dir = new Vec();
    aim = new Vec();
    spd = 0.2;
    box = new Box(this.pos, 16, 24);
    fire: boolean = false;
    fireTime: number = 0;
    fireSpeed:number = 100;
    bullets: ObjectPool = new ObjectPool(() => new Bullet());

    constructor() {
        super();
        this.addChild(this.bullets);
    }

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        const box = this.box;
        ctx.save();
        ctx.fillStyle = "blue";
        ctx.fillRect(Math.round(box.x), Math.round(box.y), box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        super.update(delta);
        const speed = this.spd * delta;
        this.pos.add(this.dir.x * speed, this.dir.y * speed);

        this.fireTime -= delta;
        if (this.fire && this.fireTime <= 0) {
            this.bullets.create((bullet: Bullet) => {
                bullet.pos.set(this.pos);
                bullet.dir = this.aim.clone().sub(this.pos).normalize();
            });
            this.fireTime = this.fireSpeed;
        }
    }

}
