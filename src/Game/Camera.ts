import { Vec, Box } from "./Math";
import { IConfig } from "../config";
import { GameObject, GameEvent } from "./GameEngine";
import Hero from "./Hero";

export default class Camera extends GameObject {

    public pos: Vec;
    public box: Box;
    public spd: number;
    public move: boolean = true;

    constructor(
        public hero: Hero,
        {x, y, width, height, spd}: IConfig,
        public bottom: number
    ) {
        super();
        this.pos = new Vec(x, y);
        this.box = new Box(this.pos, width, height);
        this.spd = spd;
    }

    update(delta: number) {
        if (
            this.hero.alive &&
            this.hero.box.bottom <= this.pos.y
        ) {
            this.emit(new GameEvent("death", this.hero));
        }
        if (!this.move) {
            return;
        }
        this.pos.y += this.spd * delta;
        if (this.pos.y + this.box.height > this.bottom) {
            this.pos.y = this.bottom - this.box.height;
            this.move = false;
        }
    }

}
