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

export abstract class Actor {

    // Available render styles for the actors to be drawn in
    public static readonly renderStyles = {
        basic: 0,
    };

    // The render style the actor is drawn in
    public abstract readonly renderStyle: number;

    // Draws the actor for the given WebGL context
    public abstract draw(gl: WebGLRenderingContext): void;

    protected readonly vbo: WebGLBuffer;

    protected constructor(gl: WebGLRenderingContext, vboData: Float32Array) {
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);
    }
}
