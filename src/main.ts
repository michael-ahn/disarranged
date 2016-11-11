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

import { ArenaActor } from "./actors/arena_actor"
import { Graphics } from "./graphics"

function init() {
    let gl = Graphics.getContext();
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Set clear color to opaque black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth test
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the resolution of the context
    let blah = new ArenaActor();
    blah.print();
}

init();