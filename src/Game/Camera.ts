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
        {width, height, spd}: IConfig,
        public bottom: number
    ) {
        super();
        this.pos = new Vec();
        this.box = new Box(this.pos, width, height);
        this.spd = spd;
    }

    update(delta: number) {
        const hero = this.hero;
        if (
            hero.alive &&
            hero.box.bottom <= this.pos.y
        ) {
            hero.hit(100);
        }
        this.pos.y += this.spd * delta;
    }

}
