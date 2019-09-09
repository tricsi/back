import { GameObject, GameEvent } from "./GameEngine";
import { Vec, Box } from "./Math";
import Hero from "./Hero";
import Sprite from "./Sprite";

export abstract class Item extends GameObject {

    pos = new Vec();
    box = new Box(this.pos, 16);

    constructor(
        public hero: Hero,
        public value: number,
        public frame: number,
        public color: number
    ) {
        super();
    }

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "item" + this.color, this.box, this.frame);
    }

    update(delta: number) {
        if (this.box.collide(this.hero.box)) {
            this.power();
            this.emit(new GameEvent("item", this));
            this.parent.removeChild(this);
        }
    }

    abstract power(): void;
}

export class Medkit extends Item {

    power() {
        const hero = this.hero;
        hero.hp += this.value;
        if (hero.hp > hero.max) {
            hero.hp = hero.max;
        }
    }

}

export class AmmoBox extends Item {

    power() {
        this.hero.grenades.load(this.value);
    }

}
