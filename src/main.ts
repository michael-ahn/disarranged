var gl: WebGLRenderingContext;

function init() {
    let canvas = <HTMLCanvasElement>document.getElementById("glcanvas");

    // Initialize the GL context
    gl = initWebGL(canvas);

    // Stop if we have no GL context
    if (!gl) {
        return;
    }

    // Set clear color to opaque black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth test
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // Clear color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the resolution of the context
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initWebGL(canvas: HTMLCanvasElement) {
    gl = null;

    // Try to get the standard context, or fallback to experimental
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // Stop if we don't have a context
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }

    return gl;
}

init();