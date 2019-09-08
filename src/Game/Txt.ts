import { GameObject } from "./GameEngine";
import { Vec, Box } from "./Math";
import Sprite from "./Sprite";

export default class Txt extends GameObject {

    box: Box;

    set text(value: string) {
        this._text = value;
        this.box.width = value.length * this.width;
    }

    constructor(
        public pos: Vec,
        protected _text: string = "",
        public width: number = 6,
        public height: number = 8
    ) {
        super();
        this.box = new Box(pos, this._text.length * width, height);
    }

    render(ctx: CanvasRenderingContext2D) {
        const box = new Box(this.pos.clone(), this.width, this.height);
        for (let i = 0; i < this._text.length; i++) {
            let char = this._text.charCodeAt(i);
            if (char >= 48 && char <= 57) {
                char -= 48;
            } else if (char >= 97 && char <= 122) {
                char -= 87;
            } else if (char >= 65 && char <= 90) {
                char -= 55;
            } else {
                box.pos.x += this.width;
                continue;
            }
            Sprite.draw(ctx, "font", box, char)
            box.pos.x += this.width;
        }
    }

}
