import "./style.scss";
import Sfx from "./sfx";
import { on, $ } from "./common";
import GameScene from "./Game/GameScene";
import Sprite from "./Game/Sprite";
import config from "./config";

const canvas = $("#game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const scene = new GameScene();
const keys: boolean[] = [];
let running = false;
let time: number;

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scene.render(ctx);
}

function update() {
    const now = new Date().getTime();
    const delta = now - time;
    requestAnimationFrame(update);
    scene.update(delta < 34 ? delta : 34);
    time = now;
    render();
}

function resize() {
    const body = document.body;
    // canvas.width = canvas.height / body.clientHeight * body.clientWidth;
    // scene.cam.pos.x = (canvas.width - scene.cam.box.width) / 2;
}

function bind() {
    const body = document.body;
    on(document, 'keydown', (e: KeyboardEvent) => {
        keys[e.keyCode] = true;
        scene.input(keys, true);
    });
    on(document, 'keyup', (e: KeyboardEvent) => {
        keys[e.keyCode] = false;
        scene.input(keys, false);
    })
    on(body, 'mousedown', (e: MouseEvent) => {
        keys[e.button] = true;
        scene.input(keys, true);
    });
    on(body, 'mouseup', (e: MouseEvent) => {
        keys[e.button] = false;
        scene.input(keys, false);
    });
    on(body, 'mousemove', (e: MouseEvent) => {
        const ratio = canvas.height / body.clientHeight;
        const left = (body.clientWidth * ratio - canvas.width) / 2
        scene.pointer(e.clientX * ratio - left, e.clientY * ratio);
    });
}

on(window, "load", async () => {
    await Sprite.load(require("./assets/texture.png"), require("./assets/texture.json"));
    await Sprite.tint(ctx, .8, .3, .1); // brown
    await Sprite.tint(ctx, .4, .9, .4); // green
    await Sprite.tint(ctx, 1, .9, 0); // yellow
    await Sprite.tint(ctx, .1, 1, 1); // cyan
    await Sprite.tint(ctx, .8, .1, 1); // purple
    canvas.style.display = "block";
    // return;
    canvas.width = config.cam.width;
    canvas.height = config.cam.height;
    on(document, 'contextmenu', (e: MouseEvent) => e.preventDefault());
    on(window, "resize", resize);
    resize();
    render();
});

on(canvas, "click", async () => {
    if (running) {
        return;
    }
    await Sfx.init();
    time = new Date().getTime();
    running = true;
    update();
    bind();
});
