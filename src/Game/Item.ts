import { GameObject, GameEvent } from "./GameEngine";
import { Vec, Box } from "./Math";
import Hero from "./Hero";
import Sprite from "./Sprite";

export abstract class Item extends GameObject {

    pos = new Vec();
    box = new Box(this.pos, 10);

    constructor(
        public hero: Hero,
        public value: number,
        public color: string
    ) {
        super();
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

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "item", this.box, 0);
    }

    power() {
        const hero = this.hero;
        hero.hp += this.value;
        if (hero.hp > hero.max) {
            hero.hp = hero.max;
        }
    }

}

export class AmmoBox extends Item {

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "item", this.box, 1);
    }

    power() {
        this.hero.grenades.load(this.value);
    }

}

export class GrenadeBox extends Item {

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "item", this.box, 2);
    }

    power() {
        this.hero.grenades.load(this.value);
    }

}
