import "./style.scss";
import { Vec3, Camera, Shader, Mesh, Item, Box, Sphere, RAD_SCALE } from "./T3D/index";
import { on, $ } from "./common";
import GameScene from "./Game/GameScene";
import Hero from "./Game/Hero";

const canvas = <HTMLCanvasElement>$("#game");
const gl = canvas.getContext("webgl");
const light = new Vec3(0, 0, -5);
const camera = new Camera(canvas.width / canvas.height);
//camera.rotate.x = RAD_SCALE;
camera.position.set(0, 0, 5);

const shader = new Shader(gl, require("./shader/vert.glsl?t=vertex"), require("./shader/frag.glsl"));
const meshes = {
    sphere: new Mesh(gl, 20),
};
const colors = {
    red: [1, .3, .3, 0],
};
const hero = new Hero(meshes.sphere, colors.red);
const scene = new GameScene(hero);
// camera.position = hero.transform.translate;
// camera.rotate = hero.transform.rotate;

function render(item: Item, stroke: number = 0) {
    item.childs.forEach(child => {
        render(child, stroke);
    });
    if (!item.active || !item.mesh) {
        return;
    }
    const invert = item.transform.matrix().invert();
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

on(window, "load", async () => {
    resize();
    bind();
    update();
});
