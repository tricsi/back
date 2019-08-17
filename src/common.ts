export function $(query: string, element?: Element): Element {
    return (element || document).querySelector(query);
}

export function on(element: any, event: string, callback: EventListenerOrEventListenerObject, capture: any = false) {
    element.addEventListener(event, callback, capture);
}

export class Rand {

    static seed: number = Math.random();

    static get(max: number = 1, min: number = 0, round: boolean = true): number {
        if (max <= min) {
            return max;
        }
        Rand.seed = (Rand.seed * 9301 + 49297) % 233280;
        let value = min + (Rand.seed / 233280) * (max - min);
        return round ? Math.round(value) : value;
    }

}

export enum Input {
    FIRE = 0,
    ALT = 32,
    LEFT = 65,
    RIGHT = 68,
    UP = 87,
    DOWN = 83,
}
