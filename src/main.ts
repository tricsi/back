import "./style.scss";
import Sfx, { Sound, Channel } from "./sfx";
import { on, $ } from "./common";
import GameScene from "./Game/GameScene";
import Sprite from "./Game/Sprite";
import config from "./config";
import { GameStatus } from "./Game/Hud";
import { TileMap } from "./Game/TileMap";
import Hero from "./Game/Hero";
import IntroScene from "./Game/IntroScene";

const canvas = $("#game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const keys: boolean[] = [];
let level: number = 0;
let hero = new Hero(config.hero);
let intro = new IntroScene();
let scene = new GameScene(hero, new TileMap(level));
let time = new Date().getTime();
let running = false;
let music: AudioBufferSourceNode = null;
const volume = 0.2;

function update() {
    const now = new Date().getTime();
    const delta = now - time;
    time = now;
    requestAnimationFrame(update);
    if (!running) {
        intro.update(delta);
        intro.render(ctx);
        return;
    }
    scene.update(delta < 34 ? delta : 34);
    scene.render(ctx);
}

function bind() {
    const body = document.body;
    on(document, "keydown", (e: KeyboardEvent) => {
        keys[e.keyCode] = true;
        scene.input(keys, true);
        if (music && e.keyCode === 32) {
            const gain = Sfx.mixer("music").gain;
            gain.value = gain.value ? 0 : volume;
        }
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

async function init() {
    running = true;
    await Sfx.init();
    await Promise.all([
        Sfx.sound("hit", new Sound("custom", [2, 1, 0], 1), [110, 0], .2),
        Sfx.sound("fire", new Sound("square", [.2, .1, 0], .2), [660, 110], .1),
        Sfx.sound("eject", new Sound("triangle", [.2, .1, 0], .2), [220, 0], .1),
        Sfx.sound("launch", new Sound("custom", [1, .5, 0], 1), [880, 0], .1),
        Sfx.sound("explode", new Sound("custom", [5, 1, 0], 1), [220, 0], 1),
        Sfx.sound("item", new Sound("square", [.3, .1, 0], 1), [220, 440, 220, 440, 220, 440, 220, 440], .3),
        Sfx.music("music", [
            new Channel(new Sound("sawtooth", [.2, .2], .2), "2c5eb5g5,1f4ab4c5,1g4bb4d5,2c5eb5g5,1f4ab4c5,1bb4d5ff5|3|", 1),
            new Channel(new Sound("square", [1, .3], .2), "2c4,2c4,1c3,2c4,3ab3,2ab3,2ab2,2ab3,2f2,2f2,2g3,2g2,2bb2,2bb3,2g2,2g3,2c4,2c4,1c3,2c4,3ab3,2ab3,2ab2,2ab3,1f2,1f3,1f2,1f3,2g3,2g2,1bb2,1,2bb3,2g2,2g3|3|", .125),
            new Channel(new Sound("square", [.5, .5], 1), "2,2c5,2eb5,1g5,2d5,3c5,4ab4,2,2f4,2g4,1f4,2bb4,1eb4,2g4,2b4,2g4,2,2c5,2eb5,1g5,2d5,3c5,4ab4,2,2g5,3bb5,3eb6,2d6,2bb5,2c6,2,2c5,2eb5,1g5,2d5,3c5,4ab4,2,2f4,2g4,1f4,2bb4,1eb4,2g4,2b4,2g4,2,2c5,2eb5,1g5,2d5,3c5,4ab4,2,.5g5,.5bb5,.5c6,.5eb6,2f6,1b5,3eb6,1d6,1d5,1c6,1c5,2bb5", .125),
        ])
    ]);
    Sfx.mixer("music").gain.value = volume;
    music = Sfx.play("music", true, "music");
}

on(window, "load", async () => {
    bind();
    await Sprite.load(require("./assets/texture.png"), require("./assets/texture.json"));
    await Sprite.tint(ctx, .8, .3, .1); // brown
    await Sprite.tint(ctx, .4, .9, .4); // green
    await Sprite.tint(ctx, 1, .7, 0); // yellow
    await Sprite.tint(ctx, .1, 1, 1); // cyan
    await Sprite.tint(ctx, .8, .1, 1); // purple
    await Sprite.tint(ctx, 1, .2, .2); // red
    canvas.width = config.cam.width;
    canvas.height = config.cam.height;
    canvas.style.display = "block";
    update();
});

on(document.body, "mousedown", async () => {
    if (!running) {
        init();
    }
    switch (scene.hud.satus) {
        case GameStatus.run:
            break;
        case GameStatus.start:
            scene.hud.satus = GameStatus.run;
            break;
        case GameStatus.win:
            if (++level < TileMap.MAPS.length) {
                hero.reset();
                scene = new GameScene(hero, new TileMap(level));
                break;
            }
        default:
            level = 0;
            hero = new Hero(config.hero);
            scene = new GameScene(hero, new TileMap(level));
            break;
    }
});
