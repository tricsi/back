import { Vec, Box } from "./Math";
import { IConfig } from "../config";
import { GameObject } from "./GameEngine";

export default class Camera extends GameObject {

    public pos: Vec;
    public box: Box;
    public spd: number;

    constructor({x, y, width, height, spd}: IConfig, public bottom: number) {
        super();
        this.pos = new Vec(x, y);
        this.box = new Box(this.pos, width, height);
        this.spd = spd;
    }

    update(delta: number) {
        this.pos.y += this.spd * delta;
        if (this.pos.y + this.box.height > this.bottom) {
            this.pos.y = this.bottom - this.box.height;
        }
    }

}
