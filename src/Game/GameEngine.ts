import { Vec, Box } from "./Math";

export interface IMovable {
    pos: Vec;
    box: Box;
    dir: Vec;
    spd: number;
}

export abstract class GameObject {

    parent: GameObject;
    children: GameObject[] = [];

    addChild(child: GameObject) {
        this.children.push(child);
        child.parent = this;
    }

    removeChild(child: GameObject) {
        const index = this.children.indexOf(child);
        if (index >= 0) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        this.children.forEach(child => child.render(ctx));
    }

    update(delta: number) {
        this.children.forEach(child => child.update(delta));
    }

}

export class ObjectPool extends GameObject {

    private pool: GameObject[] = [];

    constructor(protected factory: () => GameObject) {
        super();
    }

    create(init: (item: GameObject) => void = null): GameObject {
        let item = this.pool.pop();
        if (!item) {
            item = this.factory();
        }
        this.addChild(item);
        if (init) {
            init(item);
        }
        return item;
    }

    removeChild(item: GameObject) {
        super.removeChild(item);
        this.pool.push(item);
    }

}

export class ObjectSpawner extends ObjectPool
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
