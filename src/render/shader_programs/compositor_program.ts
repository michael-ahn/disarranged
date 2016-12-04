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
        "uniform sampler2D u_uvTexture;",

        "uniform sampler2D u_imgPencil;",

        "varying vec2 v_texCoord;",

        "const vec4 c_lowerToneWeights = vec4(0.5, 0.25, 0.0, -0.25);",
        "const vec4 c_upperToneWeights = vec4(1.0, 0.75, 0.5, 0.25);",

        "void main(void) {",
            "vec2 xy = v_texCoord;",
            "float dx = u_invScreenDims.x, dy = u_invScreenDims.y;",

            // Get data from colour texture
            "vec4 colour = texture2D(u_colourTexture, v_texCoord);",
            "vec3 c = colour.xyz;",
            "float cosFactor = colour.w;",

            // Get pencil tone data from pencil texture
            "vec2 uv = texture2D(u_uvTexture, v_texCoord).xy;",
            "vec4 tones = texture2D(u_imgPencil, uv) - 1.0;",

            // Get data from normal texture
            "vec4 data = texture2D(u_normalTexture, v_texCoord);",

            // Sample the edge factor 3 times to build a rough edge
            "xy.x += dx * 1.3 * sin( xy.x * 6.28318 / (30.0 * dx) + 1.25) + 1.3 * dx;",
            "xy.y += dy * 1.4 * sin( xy.y * 6.28318 / (25.0 * dy) + 1.7) - 1.0 * dy;",
            "vec2 sample1 = texture2D(u_normalTexture, xy).xy;",

            "xy.x += dx * 1.0 * sin( xy.x * 6.28318 / (40.0 * dx) + 3.0) + 1.1 * dx;",
            "xy.y += dy * 1.1* sin( xy.y * 6.28318 / (50.0 * dy) + 0.7) - 0.9 * dy;",
            "vec2 sample2 = texture2D(u_normalTexture, xy).xy;",

            "xy.x += dx * 0.9 * sin( xy.x * 6.28318 / (50.0 * dx) + 0.3) - 1.5 * dx;",
            "xy.y += dy * 0.8* sin( xy.y * 6.28318 / (60.0 * dy) + 2.8) + 1.3 * dy;",
            "vec2 sample3 = texture2D(u_normalTexture, xy).xy;",

            // Calculate the weighted edge contribution
            "float edgeFactor = 0.2 * sample1.x + 0.35 * sample2.x + 0.45 * sample3.x - 1.0;",

            // Calculate the weighted shadow contribution
            "float shadowFactor = 0.4 * data.y + 0.2 * sample1.y + 0.2 * sample2.y + 0.2 * sample3.y;",

            // Calculate the weight tone contribution
            "vec4 toneFactor = vec4(cosFactor * shadowFactor);",
            "vec4 upperBound = max(c_upperToneWeights - toneFactor, vec4(0.0));",
            "vec4 toneWeights = 4.0 * clamp(toneFactor - c_lowerToneWeights, vec4(0.0), upperBound);",
            "float weightedTone = dot(tones, toneWeights);",

            // Calculate the resultant colour
            "c += vec3(weightedTone);",
            "c += vec3(edgeFactor);",

            // Enforce a lower bound to the colour
            "c = max(c, vec3(0.0));",

            // Output the resultant colour
            "gl_FragColor = vec4(c, 1);",
        "}",
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, CompositorProgram.vertexSource, CompositorProgram.fragmentSource);
    }

}
