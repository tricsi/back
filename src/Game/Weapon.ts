import { Vec, Box } from "./Math";
import { GameObject, IMovable, GameEvent } from "./GameEngine";

export class Bullet extends GameObject implements IMovable {

    pos = new Vec();
    dir = new Vec();
    spd = 0.4;
    box = new Box(this.pos, 6);

    render(ctx: CanvasRenderingContext2D) {
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = "#0ff";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update(delta: number) {
        this.pos.add(this.dir.clone().scale(this.spd * delta));
    }
}

export class Grenade extends GameObject implements IMovable{

    pos = new Vec();
    dir = new Vec();
    aim = new Vec();
    spd = 0.2;
    box = new Box(this.pos, 10);
    rad = 48;

    render(ctx: CanvasRenderingContext2D) {
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = "#0f0";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update(delta: number) {
        const speed = this.spd * delta;
        if (this.box.center.sub(this.aim).length <= speed) {
            this.pos.set(this.aim);
            this.emit(new GameEvent("grenade", this));
            this.parent.removeChild(this);
        }
        this.pos.add(this.dir.clone().scale(speed));
    }
}
