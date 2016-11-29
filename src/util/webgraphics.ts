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

    private static canvas: HTMLCanvasElement;
    private static gl: WebGLRenderingContext;
    private static attemptedInit: boolean = false;

    // Get the WebGLRenderingContext for the application. Returns null if
    // WebGL is not supported.
    public static getContext(): WebGLRenderingContext {
        if (!WebGraphics.attemptedInit) {
            WebGraphics.attemptedInit = true;
            WebGraphics.initialize();
        }
        return WebGraphics.gl;
    }

    // Get the canvas for the application.
    public static getCanvas(): HTMLCanvasElement {
        if (!WebGraphics.canvas) {
            WebGraphics.canvas = <HTMLCanvasElement>document.getElementById("glcanvas");
        }
        return WebGraphics.canvas;
    }

    // Resizes the WebGL viewport to match the dimensions of the canvas.
    // Returns true if the viewport dimensions are changed from this operation.
    public static resizeToFullScreen(gl: WebGLRenderingContext): boolean {
        let width = gl.canvas.clientWidth;
        let height = gl.canvas.clientHeight;
        if (gl.canvas.width != width || gl.canvas.height != height) {
            gl.canvas.width = width;
            gl.canvas.height = height;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            return true;
        }
        return false;
    }

    private static initialize() {
        WebGraphics.gl = null;

        let canvas = WebGraphics.getCanvas();
        if (!canvas) {
            return;
        }

        // Get a WebGraphics context from the canvas
        let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            return;
        }

        WebGraphics.gl = gl;
    }
}
