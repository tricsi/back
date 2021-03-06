import { GameObject } from "./GameEngine";
import Hero from "./Hero";
import Txt from "./Txt";
import { Vec } from "./Math";
import Camera from "./Camera";
import { TileMap } from "./TileMap";

export enum GameStatus {
    start = 0,
    run = 1,
    lose = 2,
    win = 3,
}

export default class Hud extends GameObject {

    satus = GameStatus.start;
    text = new Txt(new Vec(3));
    message = new Txt(new Vec(32, 120));
    messages: string[];

    constructor(public hero: Hero, public cam: Camera, map: TileMap) {
        super();
        this.messages = [
            "Click to Start",
            "",
            "Game Over",
            map.last ? "The End" : `Level ${map.level + 1} Complete`
        ];
        this.addChild(this.text)
            .addChild(this.message);
        this.update(0);
    }

    update(delta: number) {
        const box1 = this.cam.box;
        const box2 = this.message.box;
        const hero = this.hero;
        const hp = new String(hero.hp + 1000).substr(1);
        const ammo = new String(hero.grenades.ammo + 100).substr(1);
        const score = new String(hero.score + 1000000).substr(1);
        this.text.text = `MEN ${hero.lives}  HP ${hp}  BOMB ${ammo}  SCORE ${score}`;
        this.message.pos.set((box1.width - box2.width) / 2, (box1.height - box2.height) / 2);
        this.message.text = this.messages[this.satus];
    }

}
