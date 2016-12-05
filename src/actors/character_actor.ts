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

import { Actor } from "./actor";
import { BallActor } from "./ball_actor";
import { EarActor } from "./ear_actor";
import { FootActor } from "./foot_actor";
import { RenderStyle } from "../render/renderer";
import { Program } from "../render/shader_programs/program";
import { mat4, vec3, vec2 } from "../lib/gl-matrix";

export class CharacterActor extends BallActor {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public readonly renderStyle = RenderStyle.Arena;

    public constructor(gl: WebGLRenderingContext) {
        super(gl);
        this.edgeFactor = 0.4;

        this.leftEar = new EarActor(gl, false);
        this.rightEar = new EarActor(gl, true);
        this.leftFoot = new FootActor(gl);
        this.rightFoot = new FootActor(gl);

        // Calculate static transforms
        vec3.set(this.heightOffset, 0, 1.0, 0);
    }

    // Sets the position, rotation and animates by one step
    public tick(position: vec3, forward: vec3, vertical: number, horizontal: number) {
        this.time += 0.016666;
        let pi = 3.14159265;
        let deg30 = pi / 6, deg90 = pi / 2;

        // Set position
        mat4.fromTranslation(this.dynamicTransform, position);

        // Tween the rotation
        vec2.set(this.destRotation, deg30 * vertical, deg30 * -horizontal);
        vec2.subtract(this.tweenRotation, this.destRotation, this.curRotation);
        let diffFactor = vec2.length(this.tweenRotation), stepSize = pi * 0.01666;
        if (diffFactor < stepSize) {
            vec2.copy(this.curRotation, this.destRotation);
        } else {
            vec2.scaleAndAdd(this.curRotation, this.curRotation, this.tweenRotation, stepSize / diffFactor);
        }

        // Set rotation of the body
        let facingAngle = -(Math.atan2(forward[2], forward[0]) - deg90);
        mat4.fromTranslation(this.staticTransform, this.heightOffset);
        mat4.rotateY(this.staticTransform, this.staticTransform, facingAngle);
        mat4.rotateZ(this.staticTransform, this.staticTransform, this.curRotation[1]);
        mat4.rotateX(this.staticTransform, this.staticTransform, this.curRotation[0]);

        // Bake transformation
        mat4.multiply(this.modelTransform, this.dynamicTransform, this.staticTransform);

        // Make normal transformation
        mat4.invert(this.scratchMatrix1, this.modelTransform);
        mat4.transpose(this.invModelTransform, this.scratchMatrix1);

        // Move children
        this.leftEar.tick(this.time, this.modelTransform, this.scratchMatrix1);
        this.rightEar.tick(this.time, this.modelTransform, this.scratchMatrix1);
    }

    public draw(gl: WebGLRenderingContext, program: Program) {
        super.draw(gl, program);
        this.leftEar.draw(gl, program);
        this.rightEar.draw(gl, program);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    // Child actors
    private readonly leftEar : EarActor;
    private readonly rightEar: EarActor;
    private readonly leftFoot: FootActor;
    private readonly rightFoot: FootActor;

    // Transforms
    private readonly scratchMatrix1 = mat4.create();
    private readonly scratchMatrix2 = mat4.create();
    private readonly heightOffset = vec3.create();

    // Tweening
    private readonly destRotation = vec2.create();
    private readonly curRotation = vec2.create();
    private readonly tweenRotation = vec2.create();

    private time = 0;

}