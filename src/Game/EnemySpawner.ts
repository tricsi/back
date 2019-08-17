import ObjectSpawner from "./ObjectSpawner";

export default class EnemySpawner extends ObjectSpawner
{

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);
        if (!this.period) {
            return;
        }
        ctx.save();
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.arc(Math.round(this.pos.x), Math.round(this.pos.y), this.box.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

}
