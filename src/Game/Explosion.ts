import { GameObject } from "./GameEngine";
import Sprite from "./Sprite";
import { Vec, Box } from "./Math";

export default class Explosion extends GameObject {

    pos: Vec = new Vec();
    box: Box = new Box(this.pos, 16);
    time: number = 0;
    flip: boolean = false;
    frame: number = 0;

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "splash3", this.box, this.frame, this.flip);
    }

    update(delta: number) {
        super.update(delta);
        this.time += delta;
        this.frame = Math.floor(this.time / 100);
        if (this.frame > 2) {
            this.parent.removeChild(this);
        }
    }
}
