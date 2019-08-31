import { on } from "../common";
import { Box } from "./Math";

export default class Sprite {

    private static image: HTMLImageElement;
    private static config: {[name: string]: number[]};

    private constructor() {}

    static load(src: string, config: {[name:string]: number[]}): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve: (image: HTMLImageElement) => void) => {
            const image = new Image();
            on(image, "load", () => {
                Sprite.image = image;
                Sprite.config = config;
                resolve(image);
            });
            image.src = src;
        });
    }

    static draw(
        ctx: CanvasRenderingContext2D,
        name: string,
        { pos, width, height }: Box,
        frame: number = 0,
        hflip: boolean = false,
        vflip: boolean = false
    ) {
        if (!(name in Sprite.config)) {
            return;
        }
        const cfg = Sprite.config[name];
        ctx.save();
        ctx.translate(Math.round(pos.x), Math.round(pos.y));
        ctx.scale(hflip ? -1 : 1, vflip ? -1 : 1);
        ctx.drawImage(
            Sprite.image,
            cfg[0] + frame * width,
            cfg[1],
            width,
            height,
            hflip ? -width : 0,
            vflip ? -height : 0,
            width,
            height
        );
        ctx.restore();
    }

}
