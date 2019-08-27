import { GameObject, GameEvent } from "./GameEngine";
import { Vec, Box } from "./Math";
import Hero from "./Hero";

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

    render(ctx: CanvasRenderingContext2D) {
        const box = this.box;
        const pos = this.pos;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(pos.x + 3, pos.y + 3, box.width, box.height);
        ctx.restore();
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
        this.hero.gun.load(this.value);
    }

}

export class GrenadeBox extends Item {

    power() {
        this.hero.grenades.load(this.value);
    }

}
