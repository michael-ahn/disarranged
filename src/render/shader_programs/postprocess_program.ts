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

export class PostProcessProgram extends Program {

    private static vertexSource = [
        "attribute vec2 a_pos;",
        "attribute vec2 a_tex;",

        "varying vec2 v_texCoord;",

        "void main(void) {",
            "v_texCoord = a_tex;",
            "gl_Position = vec4(a_pos, 0.0, 1.0);",
        "}",
    ].join("\n");

    private static fragmentSource = [
        "#extension GL_EXT_draw_buffers : require",
        "precision mediump float;",

        "uniform mat4 u_invProj;",
        "uniform mat4 u_viewToLight;",
        "uniform vec2 u_invScreenDims;",

        "uniform sampler2D u_colourTexture;",
        "uniform sampler2D u_normalTexture;",
        "uniform sampler2D u_depthTexture;",
        "uniform sampler2D u_shadowMap;",

        "varying vec2 v_texCoord;",

        "void main(void) {",
            "vec4 colour = texture2D(u_colourTexture, v_texCoord);",
            "float depth = texture2D(u_depthTexture, v_texCoord).r;",

            // Calculate light-view-space position from depth
            "vec4 p = u_invProj * (vec4(v_texCoord, depth, 1.0) * 2.0 - 1.0);",
            "vec4 light_pos = u_viewToLight * (p / p.w);",

            // Calculate effect from shadow
            "vec3 shadow_depth = light_pos.xyz / light_pos.w;",
            "float shadow = texture2D(u_shadowMap, shadow_depth.xy).r;",
            "shadow_depth.z = min(shadow_depth.z, 1.0) - 0.002;",
            "float s = shadow < shadow_depth.z ? 0.4 : 1.0;",

            // Darken the colour by the shadow
            "colour.xyz *= s;",

            "vec2 xy = v_texCoord;",
            "float dx = u_invScreenDims.x, dy = u_invScreenDims.y;",

            // Sobel operator to find edges
            "vec3 nlb = texture2D(u_normalTexture, xy + vec2(-dx, -dy)).xyz;",
            "vec3 nb = texture2D(u_normalTexture, xy + vec2(0, -dy)).xyz;",
            "vec3 nrb = texture2D(u_normalTexture, xy + vec2(dx, -dy)).xyz;",

            "vec3 nl = texture2D(u_normalTexture, xy + vec2(-dx, 0)).xyz;",
            "vec3 nr = texture2D(u_normalTexture, xy + vec2(dx, 0)).xyz;",

            "vec3 nlt = texture2D(u_normalTexture, xy + vec2(-dx, dy)).xyz;",
            "vec3 nt = texture2D(u_normalTexture, xy + vec2(0, dy)).xyz;",
            "vec3 nrt = texture2D(u_normalTexture, xy + vec2(dx, dy)).xyz;",

            "vec3 gx = -nlt - 2.0*nl - nlb + nrt + 2.0*nr + nrb;",
            "vec3 gy = -nlb - 2.0*nb - nrb + nlt + 2.0*nt + nrt;",

            "float gx2 = dot(gx, gx);",
            "float gy2 = dot(gy, gy);",
            "float g = sqrt(gx2 + gy2);",
            "g = 1.0 - 5.0 * g * float(g > 0.6);",

            // Write data
            "gl_FragData[0] = colour;",
            "gl_FragData[1] = vec4(g);",
        "}",
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, PostProcessProgram.vertexSource, PostProcessProgram.fragmentSource);
    }

}
