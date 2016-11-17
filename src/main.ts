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
import { Renderer } from "./render/renderer";

// For testing purposes
var testTime = 0;
var testColour = 0;
var renderer: Renderer;

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

    // Start the game loop
    gameTick();
}

function gameTick() {
    window.requestAnimationFrame(gameTick);

    let gl = WebGraphics.getContext();
    WebGraphics.resizeToFullScreen(gl);

    testTime += 0.01666667;
    testColour = 0.5 * Math.sin(0.62831853 * testTime) + 0.5;

    gl.clearColor(0, testColour, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderer.drawScene();
}

init();