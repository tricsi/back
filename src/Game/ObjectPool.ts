import GameObject from "./GameObject";

export default class ObjectPool extends GameObject {

    private pool: GameObject[] = [];

    constructor(private factory: () => GameObject) {
        super();
    }

    create(): GameObject {
        let item = this.pool.pop();
        if (!item) {
            item = this.factory();
        }
        this.addChild(item);
        return item;
    }

    removeChild(item: GameObject) {
        super.removeChild(item);
        this.pool.push(item);
    }

    dismiss(item: GameObject) {
        this.removeChild(item);
    }

}
