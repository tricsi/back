import { GameObject } from "./GameEngine"
import Txt from "./Txt"
import { Vec } from "./Math"

export default class IntroScene extends GameObject {

    title = new Txt(new Vec(32, 24), "F a l l  B a c k  H e r o");
    story = new Txt(new Vec(6, 56),
        "In 2091 a meteor landed on earth,\n" +
        "and an alien lifeform appeared with\n" +
        "it. Not so far away from the meteor,\n" +
        "the alien lifeform has been settled\n" +
        "in a cave.\n\n" +
        "An elite squad of 3 men have been\n" +
        "sent to the cave to secure the area\n" +
        "for further research.\n\n" +
        "But then suddenly..."

    );
    help = new Txt(new Vec(8, 172),
        " Move        Fire         Bomb\n\n" +
        "W A S D   Left Click   Right Click"
    );
    hint = new Txt(new Vec(72, 220), "Click to start");

    constructor() {
        super();
        this.addChild(this.title)
            .addChild(this.story)
            .addChild(this.help)
            .addChild(this.hint);
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        super.render(ctx);
        ctx.restore();
    }

    pointer(x: number, y: number) {}

    input(keys: boolean[], down: boolean) {}
}
