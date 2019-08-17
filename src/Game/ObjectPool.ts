import GameObject from "./GameObject";

export default class ObjectPool extends GameObject {

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
