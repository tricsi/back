import GameObject from "./GameObject";
import { Sphere, Vec } from "./Math";

export default class Bullet extends GameObject {

    pos: Vec = new Vec();
    move: Vec = new Vec();
    speed: number = 0.4;
    sphere: Sphere = new Sphere(this.pos, 4);

    render(ctx: CanvasRenderingContext2D): void {
        const sphere = this.sphere;
        const pos = sphere.pos;
        ctx.save();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, sphere.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update(delta: number) {
        const speed = this.speed * delta;
        const pos = this.pos;
        const x = this.move.x * speed;
        const y = this.move.y * speed;
        pos.add(x, y);
        if (this.parent && (Math.abs(pos.x) > 500 || Math.abs(pos.y) > 500)) {
            this.parent.removeChild(this);
        }
    }
}
