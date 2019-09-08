import { GameObject } from "./GameEngine";
import Hero from "./Hero";
import Txt from "./Txt";
import { Vec } from "./Math";

export default class Hud extends GameObject {

    text = new Txt(new Vec(16));

    constructor(public hero: Hero) {
        super();
        this.addChild(this.text);
        this.update(0);
    }

    update(delta: number) {
        const hero = this.hero;
        const score = new String(hero.score + 1000000).substr(1);
        this.text.text = `SQUAD ${hero.lives}  GRENADE ${hero.grenades.ammo}  SCORE ${score}`;
    }

}
