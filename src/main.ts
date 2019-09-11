import "./style.scss";
import Sfx, { Sound } from "./sfx";
import { on, $ } from "./common";
import GameScene from "./Game/GameScene";
import Sprite from "./Game/Sprite";
import config from "./config";
import { GameStatus } from "./Game/Hud";
import { TileMap } from "./Game/TileMap";
import Hero from "./Game/Hero";

const canvas = $("#game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const keys: boolean[] = [];
let level: number = 0;
let map = new TileMap(level);
let hero = new Hero(config.hero);
let scene = new GameScene(hero, map);
let time = new Date().getTime();
let running = false;

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

function bind() {
    const body = document.body;
    on(document, "keydown", (e: KeyboardEvent) => {
        keys[e.keyCode] = true;
        scene.input(keys, true);
    });
    on(document, "keyup", (e: KeyboardEvent) => {
        keys[e.keyCode] = false;
        scene.input(keys, false);
    })
    on(body, "mousedown", (e: MouseEvent) => {
        keys[e.button] = true;
        scene.input(keys, true);
    });
    on(body, "mouseup", (e: MouseEvent) => {
        keys[e.button] = false;
        scene.input(keys, false);
    });
    on(body, "mousemove", (e: MouseEvent) => {
        const ratio = canvas.height / body.clientHeight;
        const left = (body.clientWidth * ratio - canvas.width) / 2
        scene.pointer(e.clientX * ratio - left, e.clientY * ratio);
    });
    on(document, "contextmenu", (e: MouseEvent) => e.preventDefault());
}

on(window, "load", async () => {
    bind();
    await Sprite.load(require("./assets/texture.png"), require("./assets/texture.json"));
    await Sprite.tint(ctx, .8, .3, .1); // brown
    await Sprite.tint(ctx, .4, .9, .4); // green
    await Sprite.tint(ctx, 1, .9, 0); // yellow
    await Sprite.tint(ctx, .1, 1, 1); // cyan
    await Sprite.tint(ctx, .8, .1, 1); // purple
    canvas.width = config.cam.width;
    canvas.height = config.cam.height;
    canvas.style.display = "block";
    update();
    render();
});

on(canvas, "mousedown", async () => {
    if (running) {
        switch (scene.hud.satus) {
            case GameStatus.run:
                break;
            case GameStatus.start:
                scene.hud.satus = GameStatus.run;
                break;
            case GameStatus.win:
                map = new TileMap(++level);
                scene = new GameScene(hero, map);
                break;
            default:
                level = 0;
                hero = new Hero(config.hero);
                map = new TileMap(level);
                scene = new GameScene(hero, map);
                break;
        }
        return;
    }
    await Sfx.init();
    await Promise.all([
        Sfx.sound("hit", new Sound("custom", [2, 1, 0], 1), [110, 0], .2),
        Sfx.sound("fire", new Sound("square", [.2, .1, 0], .2), [660, 110], .1),
        Sfx.sound("eject", new Sound("triangle", [.2, .1, 0], .2), [220, 0], .1),
        Sfx.sound("launch", new Sound("custom", [1, .5, 0], 1), [880, 0], .1),
        Sfx.sound("explode", new Sound("custom", [5, 1, 0], 1), [220, 0], 1),
        Sfx.sound("item", new Sound("square", [.3, .1, 0], 1), [220, 440, 220, 440, 220, 440, 220, 440], .3),
    ]);
    running = true;
    scene.hud.satus = GameStatus.run;
});
