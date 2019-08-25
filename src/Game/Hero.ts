import { Box, Vec } from "./Math";
import { Bullet, Grenade, Weapon } from "./Weapon";
import { IMovable, GameEvent, GameObject } from "./GameEngine";

export default class Hero extends GameObject implements IMovable {

    pos = this.box.pos;
    dir = new Vec();
    aim = new Vec();
    fire = false;
    gun = new Weapon(() => new Bullet(0.4, 6, "#0ff"), 100, 9999);
    grenades = new Weapon(() => new Grenade(0.2, 10, 48), 0, 5, 10);

    constructor(
        public box: Box,
        public spd: number
    ) {
        super();
        this.addChild(this.grenades);
        this.addChild(this.gun);
    }

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        const box = this.box;
        const pos = this.pos;
        ctx.save();
        ctx.fillStyle = "#00c";
        ctx.fillRect(pos.x, pos.y, box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        super.update(delta);
        if (this.fire) {
            this.gun.create((bullet: Bullet) => {
                const box = bullet.box;
                const center = this.box.center;
                bullet.dir.set(this.aim.clone().sub(center).normalize());
                bullet.pos.set(center.sub(box.width / 2, box.height / 2));
                this.emit(new GameEvent("fire", this, bullet));
            });
        }
    }

    grenade() {
        this.grenades.create((item: Grenade) => {
            const box = item.box;
            const center = this.box.center;
            item.dir.set(this.aim.clone().sub(center).normalize());
            item.pos.set(center.sub(box.width / 2, box.height / 2));
            item.aim.set(this.aim);
        });
    }

}
