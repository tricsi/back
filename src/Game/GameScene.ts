import Hero from "./Hero";
import GameObject from "./GameObject";
import { Input } from "../common";
import ObjectPool from "./ObjectPool";
import Bullet from "./Bullet";

export default class GameScene extends GameObject{

    hero: Hero = new Hero();
    bullets: ObjectPool = new ObjectPool(() => new Bullet());
    fire: boolean = false;
    fireTime: number = 0;
    fireSpeed:number = 100;

    constructor() {
        super();
        this.addChild(this.bullets);
        this.addChild(this.hero);
    }

    update(delta: number) {
        super.update(delta);
        this.fireTime -= delta;
        if (this.fire && this.fireTime <= 0) {
            const bullet = this.bullets.create() as Bullet;
            bullet.pos.set(this.hero.pos);
            bullet.move.set(this.hero.aim.clone().sub(this.hero.pos).normalize());
            this.fireTime = this.fireSpeed;
        }
    }

    pointer(x: number, y: number) {
        this.hero.aim.set(x, y);
    }

    input(keys: boolean[], down: boolean) {
        let x = 0;
        let y = 0;
        if (keys[Input.LEFT]) {
            x -= 1;
        }
        if (keys[Input.RIGHT]) {
            x += 1;
        }
        if (keys[Input.UP]) {
            y -= 1;
        }
        if (keys[Input.DOWN]) {
            y += 1;
        }
        this.fire = keys[Input.FIRE] === true;
        this.hero.move.set(x, y);
    }
}
