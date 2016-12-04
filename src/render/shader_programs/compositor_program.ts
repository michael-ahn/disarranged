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

import { Program } from "./program";

export class CompositorProgram extends Program {

    private static vertexSource = [
        "attribute vec2 a_pos;",
        "attribute vec2 a_tex;",

        "varying vec2 v_texCoord;",

        "void main(void) {",
            "v_texCoord = a_tex;",
            "gl_Position = vec4(a_pos, 0.0, 1.0);",
        "}",
    ].join("\n");

    private static fragmentSource = [
        "precision mediump float;",

        "uniform vec2 u_invScreenDims;",

        "uniform sampler2D u_colourTexture;",
        "uniform sampler2D u_normalTexture;",

        "varying vec2 v_texCoord;",

        "void main(void) {",
            "vec2 xy = v_texCoord;",
            "float dx = u_invScreenDims.x, dy = u_invScreenDims.y;",

            "vec4 colour = texture2D(u_colourTexture, v_texCoord);",

            "xy.x += dx * 1.3 * sin( xy.x * 6.28318 / (30.0 * dx) + 1.25) + 1.3 * dx;",
            "xy.y += dy * 1.4 * sin( xy.y * 6.28318 / (25.0 * dy) + 1.7) - 1.0 * dy;",
            "float edge1 = texture2D(u_normalTexture, xy).r;",

            "xy.x += dx * 1.0 * sin( xy.x * 6.28318 / (40.0 * dx) + 3.0) + 1.1 * dx;",
            "xy.y += dy * 1.1* sin( xy.y * 6.28318 / (50.0 * dy) + 0.7) - 0.9 * dy;",
            "float edge2 = texture2D(u_normalTexture, xy).r;",

            "xy.x += dx * 0.9 * sin( xy.x * 6.28318 / (50.0 * dx) + 0.3) - 1.5 * dx;",
            "xy.y += dy * 0.8* sin( xy.y * 6.28318 / (60.0 * dy) + 2.8) + 1.3 * dy;",
            "float edge3 = texture2D(u_normalTexture, xy).r;",

            "float total = 0.2 * edge1 + 0.35 * edge2 + 0.45 * edge3;",

            "gl_FragColor = vec4(colour.xyz * total, 1);",
        "}",
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, CompositorProgram.vertexSource, CompositorProgram.fragmentSource);
    }

}
