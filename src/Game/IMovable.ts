import { Vec, Box } from "./Math";

export default interface IMovable {
    pos: Vec;
    box: Box;
    dir: Vec;
    spd: number;
}
