export class Vec {

    constructor(public x: number = 0, public y: number = 0) {}

    clone(): Vec {
        return new Vec(this.x, this.y);
    }

    set(vec: Vec): Vec;
    set(x: number, y: number): Vec;
    set(xOrVec: any, y?: number): Vec {
        if (xOrVec instanceof Vec) {
            this.x = xOrVec.x;
            this.y = xOrVec.y;
        } else {
            this.x = xOrVec;
            this.y = y;
        }
        return this;
    }

    add(vec: Vec): Vec;
    add(x: number, y: number): Vec;
    add(xOrVec: any, y?: number): Vec {
        if (xOrVec instanceof Vec) {
            this.x += xOrVec.x;
            this.y += xOrVec.y;
        } else {
            this.x += xOrVec;
            this.y += y;
        }
        return this;
    }

    sub(vec: Vec): Vec;
    sub(x: number, y:number): Vec;
    sub(xOrVec: any, y?:number): Vec {
        if (xOrVec instanceof Vec) {
            this.x -= xOrVec.x;
            this.y -= xOrVec.y;
        } else {
            this.x -= xOrVec;
            this.y -= y;
        }
        return this;
    }

    scale(value: number) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vec {
        var len = this.length();
        if (len > 0) {
            this.scale(1 / len);
        }
        return this;
    }
}

export class Box {

    constructor(
        public pos: Vec,
        public width: number,
        public height: number
    ) {}

    get x() {
        return this.pos.x - this.width / 2;
    }

    get y() {
        return this.pos.y - this.height / 2;
    }

}

export class Sphere {

    constructor(
        public pos: Vec,
        public radius: number
    ) {}

}
