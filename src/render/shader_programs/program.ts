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

import { mat4 } from "../../lib/gl-matrix";

export abstract class Program {

    // The compiled shader objects
    private readonly vertexShader: WebGLShader;
    private readonly fragmentShader: WebGLShader;

    // The linked glsl program
    public readonly glsl: WebGLProgram;

    // The number of vertex array attributes for the shader
    public readonly attrCount: number;

    // Whether the glsl program is valid after construction
    public readonly isValid: boolean;

    // General uniform locations
    public uniformViewProject: WebGLUniformLocation;
    public uniformModel: WebGLUniformLocation;

    // Compiles the given shader source code into the specified shader type
    private static createShader(gl: WebGLRenderingContext, shaderType: number, source: string): WebGLShader {
        let shader = gl.createShader(shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }

        // Print compile error to console
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    // Links the given vertex and fragment shaders into a glsl program.
    // The given attribute list will be bound in order.
    private static createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, attribs: string[]): WebGLProgram {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Before we link, bind the attribute locations
        let index = 0;
        for (let attrib of attribs) {
            gl.bindAttribLocation(program, index, attrib);
            index++;
        }

        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        }

        // Print link error to console
        console.log(gl.getProgramInfoLog(program));
        return null;
    }

    protected constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string,
                          attribs: string[]) {
        this.vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        this.fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        this.isValid = !!(this.vertexShader && this.fragmentShader);
        if (this.isValid) {
            this.glsl = Program.createProgram(gl, this.vertexShader, this.fragmentShader, attribs);
            this.attrCount = attribs.length;
            this.isValid = !!this.glsl;
        }
    }
}
