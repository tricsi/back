import "./style.scss";
import { on, $ } from "./common";
import GameScene from "./Game/GameScene";

const canvas = <HTMLCanvasElement>$("#game");
const ctx = canvas.getContext("2d");
const scene = new GameScene();
const keys: boolean[] = [];
let time: number;

function render() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    scene.render(ctx);
    ctx.restore();
}

function update() {
    const now = new Date().getTime();
    requestAnimationFrame(update);
    scene.update(now - time);
    time = now;
    render();
}

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function bind() {
    on(document, 'keydown', (e: KeyboardEvent) => {
        keys[e.keyCode] = true;
        scene.input(keys, true);
    });
    on(document, 'keyup', (e: KeyboardEvent) => {
        keys[e.keyCode] = false;
        scene.input(keys, false);
    })
    on(document, 'mousedown', (e: MouseEvent) => {
        keys[e.button] = true;
        scene.input(keys, true);
    });
    on(document, 'mouseup', (e: MouseEvent) => {
        keys[e.button] = false;
        scene.input(keys, false);
    });
    on(document, 'mousemove', (e: MouseEvent) => {
        scene.pointer(e.clientX - canvas.width / 2, e.clientY - canvas.height / 2);
    });
    on(window, "resize", resize);
}

on(window, "load", async () => {
    resize();
    bind();
    time = new Date().getTime();
    update();
});
