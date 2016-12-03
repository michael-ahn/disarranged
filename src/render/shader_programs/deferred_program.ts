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

        "uniform mat4 u_projectView;",
        "uniform mat4 u_model;",
        "uniform mat4 u_lightProjectView;",

        "varying vec4 v_pos;",
        "varying vec3 v_norm;",

        "const mat4 c_depthBias = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);",

        "void main(void) {",
            "vec4 position =  u_model * vec4(a_pos, 1.0);",
            "vec4 shadowPos = c_depthBias *  u_lightProjectView * position;",
            "v_pos = shadowPos;",
            "v_norm = a_norm;",
            "gl_Position = u_projectView * position;",
        "}"
    ].join("\n");

    private static fragmentSource = [
        "#extension GL_EXT_draw_buffers : require",
        "precision mediump float;",

        "uniform vec3 u_lightPos;",

        "varying vec4 v_pos;",
        "varying vec3 v_norm;",

        "void main(void) {",
            // Calculate the light
            "float surfaceFactor = dot(normalize(v_norm), u_lightPos);",
            "vec3 colour = vec3(0, 1, 0.5);",

            "vec3 depth = v_pos.xyz;",
            "depth.z -= 0.005;// * surfaceFactor;",

            "vec3 outColour = colour * ((0.8 * surfaceFactor) + 0.2);",
            "gl_FragData[0] = vec4(depth, 1);",
            "gl_FragData[1] = vec4(outColour, 1);",
            "gl_FragData[2] = vec4(v_norm, 1);",
        "}"
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, DeferredProgram.vertexSource, DeferredProgram.fragmentSource);
    }

}
