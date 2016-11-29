//
// Copyright 2016 Michael Ahn m3ahn@edu.uwaterloo.ca
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { WebGraphics } from "./util/webgraphics";
import { Keyboard, KeyCode } from "./util/keyboard";
import { Renderer } from "./render/renderer";

import { Actor } from "./actors/actor";
import { BasicActor } from "./actors/basic_actor";

// For testing purposes
var testTime = 0;

var renderer: Renderer;
var keyboard: Keyboard;
var actors: Actor[];

function init() {
    // Create and initialize the WebGL context
    let gl = WebGraphics.getContext();
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Create actors
    actors = [
        new BasicActor(gl)
    ];

    // Create a renderer to draw the game graphics
    renderer = new Renderer(gl);
    if (!renderer.isReady) {
        return;
    }

    // Initialize user input
    keyboard = new Keyboard();

    // Start the game loop
    gameTick();
}

function gameTick() {
    window.requestAnimationFrame(gameTick);

    let gl = WebGraphics.getContext();
    WebGraphics.resizeToFullScreen(gl);

    testTime += 0.01666667;

    let r = 0, g = 0, b = 0;
    if (keyboard.isKeyDown(KeyCode.W)) {
        r = g = b = 0.4;
    }
    if (keyboard.isKeyDown(KeyCode.A)) {
        r = 1;
    }
    if (keyboard.isKeyDown(KeyCode.S)) {
        g = 1;
    }
    if (keyboard.isKeyDown(KeyCode.D)) {
        b = 1;
    }
    let brightFactor = 0.25 * Math.sin(0.62831853 * testTime) + 0.75;
    r *= brightFactor;
    g *= brightFactor;
    b *= brightFactor;

    gl.clearColor(r, g, b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderer.drawScene(actors);
}

init();