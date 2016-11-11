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

export class Graphics {

    private static _canvas: HTMLCanvasElement;
    private static _gl: WebGLRenderingContext;
    private static _attemptedInit: boolean;

    static getContext() : WebGLRenderingContext {
        if (!Graphics._attemptedInit) {
            Graphics._attemptedInit = true;
            Graphics.createContext();
        }
        return Graphics._gl;
    }

    static getCanvas() : HTMLCanvasElement {
        if (!Graphics._canvas) {
            Graphics._canvas = <HTMLCanvasElement>document.getElementById("glcanvas");
        }
        return Graphics._canvas;
    }

    private static createContext() {
        Graphics._gl = null;

        let canvas = Graphics.getCanvas();
        if (!canvas) {
            return;
        }

        // Get a graphics context from the canvas, or fallback to experimental
        let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            return;
        }

        // Set resolution of graphics context
        gl.viewport(0, 0, canvas.width, canvas.height);

        Graphics._gl = gl;
    }

}
