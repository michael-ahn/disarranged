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
import { Game } from "./game/game";
import { Camera } from "./render/camera";

// For testing purposes
var testTime = 0;

var renderer: Renderer;
var keyboard: Keyboard;
var game: Game;
var camera: Camera;

function init() {
    // Create and initialize the WebGL context
    let gl = WebGraphics.getContext();
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Create a renderer to draw the game graphics
    renderer = new Renderer(gl);
    if (!renderer.isReady) {
        return;
    }

    // Initialize user input
    keyboard = new Keyboard();

    // Create game
    game = new Game(gl, keyboard);

    // Create a camera
    camera = new Camera(gl);

    // Start the game loop
    gameTick();
}

function gameTick() {
    window.requestAnimationFrame(gameTick);

    let gl = WebGraphics.getContext();
    if (WebGraphics.resizeToFullScreen(gl)) {
        camera.buildProjection();
    }

    game.tick(keyboard);

    camera.follow(game.player, game.enemy);

    renderer.drawDeferred(game.actors, camera);
}

init();