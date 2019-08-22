export class Vec {

    get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    constructor(
        public x: number = 0,
        public y: number = 0
    ) {}

    set(vec: Vec): Vec;
    set(xy: number): Vec;
    set(x: number, y: number): Vec;
    set(xOrVec: any, y: number = xOrVec): Vec {
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
    add(xy: number): Vec;
    add(x: number, y: number): Vec;
    add(xOrVec: any, y: number = xOrVec): Vec {
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
    sub(xy: number): Vec;
    sub(x: number, y:number): Vec;
    sub(xOrVec: any, y:number = xOrVec): Vec {
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

    tile(size: number): Vec {
        return new Vec(Math.floor(this.x / size), Math.floor(this.y / size));
    }

    invert(): Vec {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    normalize(): Vec {
        const len = this.length;
        if (len > 0) {
            this.scale(1 / len);
        }
        return this;
    }

    clone(): Vec {
        return new Vec(this.x, this.y);
    }

}

export class Box {

    get center(): Vec {
        return new Vec(
            this.width / 2 + this.pos.x,
            this.height / 2 + this.pos.y
        );
    }

    constructor(
        public pos: Vec,
        public width: number,
        public height: number = width
    ) {}

    collide(box: Box): boolean {
        return this.pos.x < box.pos.x + box.width &&
            this.pos.x + this.width > box.pos.x &&
            this.pos.y < box.pos.y + box.height &&
            this.height + this.pos.y > box.pos.y;
    }

    contains(box: Box): boolean {
        return this.pos.x <= box.pos.x &&
            this.pos.x + this.width >= box.pos.x + box.width &&
            this.pos.y <= box.pos.y &&
            this.pos.y + this.height >= box.pos.y + box.height;
    }

    intersect(box: Box): Box {
        let Ax = Math.round(this.pos.x),
            Ay = Math.round(this.pos.y),
            AX = Ax + this.width,
            AY = Ay + this.height,
            Bx = Math.round(box.pos.x),
            By = Math.round(box.pos.y),
            BX = Bx + box.width,
            BY = By + box.height,
            Cx = Ax < Bx ? Bx : Ax,
            Cy = Ay < By ? By : Ay,
            CX = AX < BX ? AX : BX,
            CY = AY < BY ? AY : BY;
        return new Box(
            new Vec(Cx, Cy),
            CX - Cx,
            CY - Cy
        );
    }

}
