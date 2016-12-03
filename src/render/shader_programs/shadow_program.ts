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

export class ShadowProgram extends Program {

    private static vertexSource = [
        "precision mediump float;",

        "uniform mat4 u_projectView;",
        "uniform mat4 u_model;",

        "attribute vec4 a_pos;",
        "attribute vec4 a_norm;",

        "void main() {",
            "gl_Position = u_projectView * u_model * a_pos;",
        "}",
    ].join("\n");

    private static fragmentSource = [
        "precision mediump float;",

        "void main() {",
        "}",
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, ShadowProgram.vertexSource, ShadowProgram.fragmentSource);
    }

}
