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

import { WebGraphics } from "./util/webgraphics"
import { ArenaActor } from "./actors/arena_actor"

// For testing purposes
var testTime = 0;
var testColour = 0;

function init() {
    // Create and initialize the WebGL context
    let gl = WebGraphics.getContext();
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Set canvas to render to full screen
    WebGraphics.resizeToFullScreen();
    // Have handler to resize to full screen on window resize after 0.5s
    var resizeEventId: number | null = null;
    window.addEventListener('resize', function onWindowResized(event) {
        if (resizeEventId)
            window.clearTimeout(resizeEventId);
        resizeEventId = window.setTimeout(WebGraphics.resizeToFullScreen, 500);
    });

    // Set defaults for rendering context
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Start the game loop
    gameTick();
}

function gameTick() {
    window.requestAnimationFrame(gameTick);

    testTime += 0.01666667;
    testColour = 0.5 * Math.sin(0.62831853 * testTime) + 0.5;

    let gl = WebGraphics.getContext();
    gl.clearColor(0, testColour, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

init();