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

    static getContext(): WebGLRenderingContext {
        if (!WebGraphics._attemptedInit) {
            WebGraphics._attemptedInit = true;
            WebGraphics.initialize();
        }
        return WebGraphics._gl;
    }

    static getCanvas(): HTMLCanvasElement {
        if (!WebGraphics._canvas) {
            WebGraphics._canvas = <HTMLCanvasElement>document.getElementById("glcanvas");
        }
        return WebGraphics._canvas;
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

    static resizeToFullScreen() {
        let canvas = WebGraphics.getCanvas();
        let gl = WebGraphics.getContext();
        if (!canvas || !gl) {
            return;
        }

        // Set canvas to full screen
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;

         // Set resolution of WebGraphics context
        gl.viewport(0, 0, canvas.width, canvas.height);
    }


}
