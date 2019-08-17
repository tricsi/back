import "./style.scss";
import { on, $ } from "./common";
import GameScene from "./Game/GameScene";

const canvas = <HTMLCanvasElement>$("#game");
const ctx = canvas.getContext("2d");
const scene = new GameScene([[-100, -150],[100, -100]]);
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
    const body = document.body;
    canvas.width = canvas.height / body.clientHeight * body.clientWidth;
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
        const body = document.body;
        const ratio = canvas.height / body.clientHeight;
        const x = (e.clientX - body.clientWidth / 2) * ratio;
        const y = (e.clientY - body.clientHeight / 2) * ratio;
        scene.pointer(x, y);
    });
    on(window, "resize", resize);
}

on(window, "load", async () => {
    resize();
    bind();
    time = new Date().getTime();
    update();
});
