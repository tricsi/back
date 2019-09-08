import { GameObject } from "./GameEngine";
import Hero from "./Hero";
import Txt from "./Txt";
import { Vec } from "./Math";
import Camera from "./Camera";

export enum GameStatus {
    start = 0,
    run = 1,
    lose = 2,
    win = 3,
}

export default class Hud extends GameObject {

    satus = GameStatus.start;
    text = new Txt(new Vec(16));
    message = new Txt(new Vec(32, 120));
    messages: string[] = ["Click to Start", "", "Game Over", "Level Complete"];

    constructor(public hero: Hero, public cam: Camera) {
        super();
        this.addChild(this.text)
            .addChild(this.message);
        this.update(0);
    }

    update(delta: number) {
        const box1 = this.cam.box;
        const box2 = this.message.box;
        const hero = this.hero;
        const score = new String(hero.score + 1000000).substr(1);
        this.text.text = `SQUAD ${hero.lives}  GRENADE ${hero.grenades.ammo}  SCORE ${score}`;
        this.message.pos.set((box1.width - box2.width) / 2, (box1.height - box2.height) / 2);
        this.message.text = this.messages[this.satus];
    }

}
