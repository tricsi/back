import ObjectPool from "./ObjectPool";
import GameObject from "./GameObject";
import { Vec, Box } from "./Math";

export default class ObjectSpawner extends ObjectPool
{

    time = 0;
    box = new Box(this.pos, 16, 16);

    constructor(
        protected factory: () => GameObject,
        protected init: (item: GameObject) => void,
        public pos: Vec = new Vec(),
        public period: number = 0,
        public limit: number = 0
    ) {
        super(factory);
    }

    create(init: (item: GameObject) => void = null): GameObject {
        return !this.limit || this.children.length < this.limit
            ? super.create(init)
            : null;
    }

    update(delta: number) {
        super.update(delta);
        if (this.period <= 0) {
            return;
        }
        this.time += delta;
        if (this.time > this.period) {
            this.time -= this.period;
            this.create(this.init);
        }
    }

}
