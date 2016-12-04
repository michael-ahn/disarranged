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

export class DeferredProgram extends Program {

    private static vertexSource = [
        "precision mediump float;",

        "attribute vec3 a_pos;",
        "attribute vec3 a_norm;",
        "attribute vec2 a_tex;",

        "uniform mat4 u_projectView;",
        "uniform mat4 u_model;",
        "uniform float u_uvScale;",

        "varying vec2 v_tex;",
        "varying vec3 v_norm;",

        "void main(void) {",
            "vec4 world_pos = u_model * vec4(a_pos, 1.0);",
            "v_norm = a_norm;",
            "v_tex = u_uvScale * a_tex;",
            "gl_Position = u_projectView * world_pos;",
        "}"
    ].join("\n");

    private static fragmentSource = [
        "#extension GL_EXT_draw_buffers : require",
        "precision mediump float;",

        "uniform vec3 u_lightPos;",

        "varying vec2 v_tex;",
        "varying vec3 v_norm;",

        "void main(void) {",
            // Calculate the light
            "float cosFactor = clamp(dot(normalize(v_norm), u_lightPos), 0.0, 1.0);",
            "vec3 colour = vec3(1.0);",

            "gl_FragData[0] = vec4(colour, cosFactor);",
            "gl_FragData[1] = vec4(v_norm, 1);",
            "gl_FragData[2] = vec4(v_tex, 0, 1);",
        "}"
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, DeferredProgram.vertexSource, DeferredProgram.fragmentSource);
    }

}
