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

// Supported key codes for user input
export const enum KeyCode {
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,
    LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40,
    SPACE = 32,
    SHIFT = 16,
    ENTER = 13,
    BACKSPACE = 8,
    ESC = 27,
}

export class Keyboard {

    private readonly pressedBuffer: ArrayBuffer;
    private readonly isPressedMap: Uint8Array;

    private readonly handlers: { [key: number]: () => void };

    public constructor() {
        // Initialize key press buffers
        this.pressedBuffer = new ArrayBuffer(128); // Max keycode to support
        this.isPressedMap = new Uint8Array(this.pressedBuffer);
        this.isPressedMap.fill(0);

        this.handlers = {};

        // Add event listeners for relevant events
        window.addEventListener("keydown", (e) => this.handleKeyDown(e), false);
        window.addEventListener("keyup", (e) => this.handleKeyUp(e), false);
        window.addEventListener("blur", (e) => this.handleWindowBlur(), false);
    }

    // Returns true if the given key is being held down
    public isKeyDown(key: KeyCode) {
        return this.isPressedMap[key] > 0;
    }

    // Causes the given handler to be called whenever the given key is pressed
    public registerEvent(key: KeyCode, handler: () => void) {
        this.handlers[key] = handler;
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.keyCode > this.pressedBuffer.byteLength || this.isPressedMap[e.keyCode] !== 0)
            return;
        this.isPressedMap[e.keyCode] = 1;
        if (e.keyCode in this.handlers) {
            this.handlers[e.keyCode]();
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        if (e.keyCode > this.pressedBuffer.byteLength)
            return;
        this.isPressedMap[e.keyCode] = 0;
    }

    private handleWindowBlur() {
        this.isPressedMap.fill(0);
    }

}
