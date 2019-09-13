import { Box, Vec } from "./Math";
import { Bullet, Grenade, Weapon } from "./Weapon";
import { IMovable, GameEvent, GameObject, IKillable } from "./GameEngine";
import { IConfig } from "../config";
import Sprite from "./Sprite";

export default class Hero extends GameObject implements IMovable, IKillable {

    hp: number;
    max: number;
    spd: number;
    score: number;
    pos: Vec;
    box: Box;
    dir = new Vec();
    aim = new Vec();
    fire = false;
    gun: Weapon;
    grenades: Weapon;
    lives: number;
    delay: number;
    time: number = 0;
    resist: number = 0;
    ouch: number = 0;

    get alive(): boolean {
        return this.lives > 0;
    }

    constructor({hp, spd, score, lives, delay, gun, gnd}: IConfig = {}) {
        super();
        this.hp = hp;
        this.max = hp;
        this.spd = spd;
        this.lives = lives;
        this.delay = delay;
        this.score = score;
        this.pos = new Vec();
        this.box = new Box(this.pos, 16, 24);
        this.gun = new Weapon(() => new Bullet(gun.bul), gun);
        this.grenades = new Weapon(() => new Grenade(gnd.bul), gnd)
        this.addChild(this.grenades);
        this.addChild(this.gun);
    }

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        if (!this.alive) {
            return;
        }
        const look = this.aim.clone().sub(this.box.center);
        let frame = look.y >= 0 ? 0 : 3,
            anim = this.time % 200,
            flip = anim < 200 / 2;
        if (Math.abs(look.x) > Math.abs(look.y)) {
            frame = anim < 200 / 2 ? 1 : 2;
            flip = look.x > 0;
        }
        let name = this.resist % 500 > 250 ? "hero" : "hero2";
        if (this.ouch > 0) {
            name = "hero6";
        }
        Sprite.draw(ctx, name, this.box, frame, flip);
    }

    update(delta: number) {
        super.update(delta);
        this.resist -= delta;
        this.ouch -= delta;
        if (this.dir.length) {
            this.time += delta;
        }
        if (!this.alive || !this.fire) {
            return;
        }
        this.gun.create((bullet: Bullet) => {
            const box = bullet.box;
            const center = this.box.center;
            bullet.dir.set(this.aim.clone().sub(center).normalize());
            bullet.pos.set(center.sub(box.width / 2, box.height / 2));
            this.emit(new GameEvent("fire", this, bullet));
        });
    }

    launch() {
        this.grenades.create((item: Grenade) => {
            const box = item.box;
            const center = this.box.center;
            item.dir.set(this.aim.clone().sub(center).normalize());
            item.pos.set(center.sub(box.width / 2, box.height / 2));
            item.aim.set(this.aim);
            this.emit(new GameEvent("launch"));
        });
    }

    hit(hp: number) {
        if (this.resist > 0) {
            return;
        }
        this.hp -= hp;
        if (this.hp > 0) {
            this.ouch = 250;
            return;
        }
        if (--this.lives > 0) {
            this.hp = this.max;
            this.resist = this.delay;
            this.emit(new GameEvent("death", this));
            return;
        }
        this.hp = 0;
        this.emit(new GameEvent("lose", this));
    }


    reset() {
        this.gun.clear();
        this.grenades.clear();
    }

}
