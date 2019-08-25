import { Vec, Box } from "./Math";

export interface IMovable {
    pos: Vec;
    box: Box;
    dir: Vec;
    spd: number;
}

export class GameEvent {

    stoped: boolean = false;

    constructor(
        public type: string,
        public target: GameObject = null,
        public payload: any = null,
        public bubble: boolean = true
    ) {
    }

    stop() {
        this.stoped = true;
    }
}

export class GameObject {

    parent: GameObject;
    children: GameObject[] = [];
    listeners: {[event: string]: {(event:GameEvent): void}[]} = { all: [] };

    addChild(child: GameObject): GameObject {
        this.children.push(child);
        child.parent = this;
        return this;
    }

    removeChild(child: GameObject) {
        const index = this.children.indexOf(child);
        if (index >= 0) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    each(callback: (item: GameObject, index?: number) => void) {
        for (let i = this.children.length - 1; i >= 0; i--) {
            callback(this.children[i], i);
        }
    }

    on(event:string, listener: {(event:GameEvent): void}): void {
        const events = event.match(/[a-zA-Z]+/g);
        if (!events) {
            return;
        }
        events.forEach(event => {
            if (!(event in this.listeners)) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(listener);
        });
    }

    emit(event: GameEvent): void {
        for (const listener of this.listeners["all"]) {
            if (event.stoped) {
                return;
            }
            listener(event);
        };
        if (event.type in this.listeners) {
            for (const listener of this.listeners[event.type]) {
                if (event.stoped) {
                    return;
                }
                listener(event);
            };
        }
        if (event.bubble && this.parent) {
            this.parent.emit(event);
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

    pos: Vec = this.box.pos;
    time: number = 0;

    constructor(
        protected factory: () => GameObject,
        protected init: (item: GameObject) => void,
        public box: Box,
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
