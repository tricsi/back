import Hero from "./Hero";
import GameObject from "./GameObject";
import { Input, Rand } from "../common";
import Enemy from "./Enemy";
import { Vec } from "./Math";
import EnemySpawner from "./EnemySpawner";

export default class GameScene extends GameObject{

    hero = new Hero();
    enemies: EnemySpawner[] = [];

    constructor(holes: number[][]) {
        super();
        for (const hole of holes) {
            const spawner = new EnemySpawner(
                () => new Enemy(this.hero),
                (item: Enemy) => {
                    const pos = new Vec(Math.random() - 0.5, Math.random() - 0.5);
                    pos.normalize().scale(8).add(item.parent.pos);
                    item.pos.set(pos);
                },
                new Vec(hole[0], hole[1]),
                500
            );
            this.enemies.push(spawner);
            this.addChild(spawner);
        }
        this.addChild(this.hero);
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
        this.hero.dir.set(x, y);
        this.hero.fire = keys[Input.FIRE] === true;
    }
}
