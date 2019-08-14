import "./style.scss";
import SFX, { Channel, Sound } from "./sfx";
import { Vec3, Camera, Shader, Mesh, Item, Box, Sphere } from "./T3D/index";
import { on, $ } from "./common";

const canvas = <HTMLCanvasElement>$("#game");
const gl = canvas.getContext("webgl");
const light = new Vec3(5, 15, 7);
const camera = new Camera(canvas.width / canvas.height);
const shader = new Shader(gl, require("./shader/vert.glsl?t=vertex"), require("./shader/frag.glsl"));
const scene = new Item();

function render(item: Item, stroke: number = 0) {
    item.childs.forEach(child => {
        render(child, stroke);
    });
    if (!item.active || !item.mesh) {
        return;
    }
    const invert = item.transform.matrix().invert();
    if (!invert) {
        return;
    }
    gl.cullFace(stroke > 0 ? gl.FRONT : gl.BACK);
    gl.useProgram(shader.program);
    shader.attrib("aPos", item.mesh.verts, 3)
        .attrib("aNorm", item.mesh.normals, 3)
        .uniform("uWorld", camera.transform(item.transform).data)
        .uniform("uProj", camera.perspective().data)
        .uniform("uInverse", invert)
        .uniform("uColor", stroke ? [0, 0, 0, 1] : item.color)
        .uniform("uLight", light.clone().sub(camera.position).toArray())
        .uniform("uStroke", stroke + item.stroke);
    gl.drawArrays(gl.TRIANGLES, 0, item.mesh.length);
}

function update() {
    requestAnimationFrame(update);
    gl.clear(gl.COLOR_BUFFER_BIT);
    render(scene);
}

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    camera.aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function bind() {
    on(window, "resize", resize);
}

on(document, "click", async () => {
    const body = document.body;
    if (body.className) {
        return;
    }
    body.className = "load";
    resize();
    await SFX.init();
    await Promise.all([
        SFX.sound("exp", new Sound("custom", [5, 1, 0], 1), [220, 0], 1),
        SFX.sound("hit", new Sound("custom", [3, 1, 0], 1), [1760, 0], .3),
        SFX.sound("power", new Sound("square", [.5, .1, 0], 1), [440, 880, 440, 880, 440, 880, 440, 880], .3),
        SFX.sound("jump", new Sound("triangle", [.5, .1, 0], 1), [220, 880], .1),
        SFX.sound("coin", new Sound("square", [.2, .1, 0], .2), [1760, 1760], .2),
        SFX.sound("move", new Sound("custom", [.1, .5, 0], .3), [1760, 440], .3),
    ]);
    bind();
    update();
    body.className = "run";
});
