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

export class ArenaProgram extends Program {

    private static vertexSource = `
        uniform mat4 u_viewProject;
        uniform mat4 u_model;

        attribute vec4 a_pos;
        attribute vec3 a_norm;

        varying vec3 v_norm;

        void main() {
            gl_Position = u_viewProject * u_model * a_pos;
            v_norm = a_norm;
        }
    `;

    private static fragmentSource = `
        precision mediump float;

        varying vec3 v_norm;

        void main() {
            vec3 lightdir = normalize(vec3(1, 1, 1));
            float light = dot(normalize(v_norm), lightdir);

            gl_FragColor = vec4(0, 1, 0.5, 1);
            gl_FragColor.rgb *= light;
        }
    `;

    constructor(gl: WebGLRenderingContext) {
        super(gl, ArenaProgram.vertexSource, ArenaProgram.fragmentSource, ["a_pos", "a_norm"]);
        
        // Get uniform locations
        if (this.isValid) {
            this.uniformViewProject = gl.getUniformLocation(this.glsl, "u_viewProject");
            this.uniformModel = gl.getUniformLocation(this.glsl, "u_model");
        }
    }

}
