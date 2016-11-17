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

export class WebGraphics {

    private static _canvas: HTMLCanvasElement;
    private static _gl: WebGLRenderingContext;
    private static _attemptedInit: boolean = false;

    public static getContext(): WebGLRenderingContext {
        if (!WebGraphics._attemptedInit) {
            WebGraphics._attemptedInit = true;
            WebGraphics.initialize();
        }
        return WebGraphics._gl;
    }

    public static getCanvas(): HTMLCanvasElement {
        if (!WebGraphics._canvas) {
            WebGraphics._canvas = <HTMLCanvasElement>document.getElementById("glcanvas");
        }
        return WebGraphics._canvas;
    }

    public static resizeToFullScreen(gl: WebGLRenderingContext) {
        let width = gl.canvas.clientWidth;
        let height = gl.canvas.clientHeight;
        if (gl.canvas.width != width || gl.canvas.height != height) {
            gl.canvas.width = width;
            gl.canvas.height = height;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }

    private static initialize() {
        WebGraphics._gl = null;

        let canvas = WebGraphics.getCanvas();
        if (!canvas) {
            return;
        }

        // Get a WebGraphics context from the canvas
        let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            return;
        }

        WebGraphics._gl = gl;
    }
}
