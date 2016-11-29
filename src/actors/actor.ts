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

import { mat4 } from "../lib/gl-matrix";
import { RenderStyle } from "../render/renderer";

export abstract class Actor {

    // The render style the actor is drawn in
    public abstract readonly renderStyle: RenderStyle;

    // The world-to-model transform for the vertex data
    public readonly modelTransform = mat4.create();

    // Draws the actor for the given WebGL context
    public abstract draw(gl: WebGLRenderingContext): void;

    // The vertex buffer object for the actor
    protected readonly vbo: WebGLBuffer;

    protected constructor(gl: WebGLRenderingContext, vboData: Float32Array) {
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);
    }
}
