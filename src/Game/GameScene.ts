import Hero from "./Hero";
import { Item } from "../T3D/Item";

export default class GameScene extends Item {

    constructor(public hero: Hero) {
        super();
        this.add(hero);
    }

}
