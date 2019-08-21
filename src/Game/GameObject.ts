import { Vec, Box } from "./Math";

export default abstract class GameObject {

    pos = new Vec();
    box = new Box(this.pos, 16, 16);
    dir = new Vec();
    spd = 0;
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
