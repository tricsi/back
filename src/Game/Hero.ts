import { Box, Vec } from "./Math";
import { Bullet, Grenade } from "./Weapon";
import { ObjectPool, IMovable, GameEvent, GameObject } from "./GameEngine";

export default class Hero extends GameObject implements IMovable {

    pos = this.box.pos;
    dir = new Vec();
    aim = new Vec();
    fire = false;
    fireTime = 0;
    bullets = new ObjectPool(() => new Bullet());
    grenades= new ObjectPool(() => new Grenade());

    constructor(
        public box: Box,
        public spd: number,
        public fireSpeed: number
    ) {
        super();
        this.addChild(this.bullets);
    }

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
            this.fireTime = this.fireSpeed;
            this.bullets.create((bullet: Bullet) => {
                const box = bullet.box;
                const center = this.box.center;
                bullet.pos.set(center.x - box.width / 2, center.y - box.height / 2);
                bullet.dir = this.aim.clone().sub(center).normalize();
                this.emit(new GameEvent("fire", this, bullet));
            });
        }
    }

}
