import { GameObject } from "./GameEngine";
import { $ } from "../common";
import Hero from "./Hero";

export default class Hud extends GameObject {

    hud: HTMLCollectionOf<HTMLSpanElement>;

    constructor(public hero: Hero) {
        super();
        this.hud = $("#hud").getElementsByTagName("span");
    }

    update(delta: number) {
        const hud = this.hud;
        const hero = this.hero;
        hud.item(0).innerText = hero.hp.toString();
        hud.item(1).innerText = hero.gun.ammo.toString();
        hud.item(2).innerText = hero.grenades.ammo.toString();
        hud.item(3).innerText = hero.score.toString();
    }

}
