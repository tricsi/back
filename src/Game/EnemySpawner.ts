import { ObjectSpawner } from "./GameEngine";

export default class EnemySpawner extends ObjectSpawner {

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);
        if (!this.period) {
            return;
        }
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.arc(Math.round(pos.x), Math.round(pos.y), this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

}
