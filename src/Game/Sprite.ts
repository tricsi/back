import { on } from "../common";
import { Box } from "./Math";

export default class Sprite {

    private static image: HTMLImageElement[] = [];
    private static config: {[name: string]: number[]};

    private constructor() {}

    static load(
        src: string,
        config: {[name:string]: number[]}
    ): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve: (image: HTMLImageElement) => void) => {
            const image = new Image();
            on(image, "load", () => {
                Sprite.image.push(image);
                Sprite.config = config;
                resolve(image);
            });
            image.src = src;
        });
    }

    static tint(
        ctx: CanvasRenderingContext2D,
        r: number,
        g: number,
        b: number
    ): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve: (image: HTMLImageElement) => void) => {
            const canvas = ctx.canvas;
            let image = Sprite.image[0];
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(Sprite.image[0], 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = img.data;
            for (let i = 0; i < img.data.length; i += 4) {
                if (!data[i + 3]) {
                    continue;
                }
                data[i] = Math.round(data[i] * r);
                data[i + 1] = Math.round(data[i + 1] * g);
                data[i + 2] = Math.round(data[i + 2] * b);
            }
            ctx.putImageData(img, 0, 0);
            image = new Image();
            on(image, "load", () => {
                Sprite.image.push(image);
                resolve(image);
            });
            image.src = canvas.toDataURL();
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
        const match = name.match(/^([a-z]+)([0-9]*)$/);
        if (!match || !(match[1] in Sprite.config)) {
            return;
        }
        const color = match[2] ? parseInt(match[2]) : 0;
        const cfg = Sprite.config[match[1]];
        ctx.save();
        ctx.translate(Math.round(pos.x), Math.round(pos.y));
        ctx.scale(hflip ? -1 : 1, vflip ? -1 : 1);
        ctx.drawImage(
            Sprite.image[color],
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
