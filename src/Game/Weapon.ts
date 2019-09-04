import { Vec, Box } from "./Math";
import { GameObject, IMovable, GameEvent, ObjectPool, IKiller } from "./GameEngine";
import { IConfig } from "../config";
import Sprite from "./Sprite";

export class Weapon extends ObjectPool {

    frq: number;
    ammo: number;
    magazine: number;
    children: Bullet[];
    protected time = 0;

    constructor(
        protected factory: () => GameObject,
        {frq, amm, mag}: IConfig
    ) {
        super(factory);
        this.frq = frq;
        this.ammo = amm;
        this.magazine = mag;
    }

    load(ammo: number) {
        this.ammo += ammo;
        if (this.magazine && this.ammo > this.magazine) {
            this.ammo = this.magazine;
        }
    }

    create(init: (item: GameObject) => void = null): GameObject {
        if (this.ammo <= 0 || (this.frq && this.time)) {
            return null;
        }
        this.ammo--;
        this.time = this.frq;
        return super.create(init);
    }

    update(delta: number) {
        this.time = delta < this.time ? this.time - delta : 0;
        super.update(delta);
    }
}

export class Bullet extends GameObject implements IMovable, IKiller {

    spd: number;
    dmg: number;
    size: number;
    color: string;
    pos: Vec;
    dir: Vec;
    box: Box;
    time = 0;

    constructor({spd, dmg, size, color}: IConfig = {}) {
        super();
        this.spd = spd;
        this.dmg = dmg;
        this.size = size;
        this.color = color;
        this.pos = new Vec();
        this.dir = new Vec();
        this.box = new Box(this.pos, this.size);
    }

    render(ctx: CanvasRenderingContext2D) {
        let frame = Math.floor(this.time % 200 / 50);
        Sprite.draw(ctx, "plasma", this.box, 0, frame % 2 > 0, frame > 1);
    }

    update(delta: number) {
        this.time += delta;
        this.pos.add(this.dir.clone().scale(this.spd * delta));
    }

}

export class Grenade extends Bullet {

    radius: number;
    aim: Vec;

    constructor({spd, dmg, size, color, radius}: IConfig = {}) {
        super({spd, dmg, size, color});
        this.radius = radius;
        this.aim = new Vec();
    }

    render(ctx: CanvasRenderingContext2D) {
        Sprite.draw(ctx, "grenade", this.box);
    }

    update(delta: number) {
        if (this.box.center.sub(this.aim).length <= this.spd * delta) {
            this.pos.set(this.aim);
            this.emit(new GameEvent("explode", this));
            this.parent.removeChild(this);
        } else {
            super.update(delta);
        }
    }
}
