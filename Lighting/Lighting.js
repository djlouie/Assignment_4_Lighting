// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform int u_TextureID0;  // A unique ID for u_Sampler0
    uniform int u_TextureID1;  // A unique ID for u_Sampler1
    uniform int u_WhichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    void main() {
        
        if (u_WhichTexture == -3) {
            gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);      // Normal For Color
        } else if (u_WhichTexture == -2) {
            gl_FragColor = u_FragColor;                     // Use Color
        } else if (u_WhichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1, 1);                // Use UV debug color
        } else if (u_WhichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);     // Use texture0
        } else if (u_WhichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);     // Use texture1
        } else if (u_WhichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);     // Use texture2
        } else if (u_WhichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);     // Use texture3
        } else if (u_WhichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler4, v_UV);     // Use texture4
        } else {
            gl_FragColor = vec4(1, .2, .2, 1);              // Error, put Redish
        }

        vec3 lightVector = u_lightPos - vec3 (v_VertPos);
        float r=length(lightVector);

        // Red/Green Visualization
        // if (r<1.0) {
        //     gl_FragColor = vec4 (1,0,0,1); // red
        // } else if (r<2.0) {
        //     gl_FragColor = vec4 (0,1,0,1); // green
        // }

        // Light Falloff Visualization 1/r^2
        // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);

        // N dot 1
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);
        
        // Reflection
        vec3 R = reflect(-L, N);

        // eye
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

        // Specular
        float specular = pow(max(dot(E,R), 0.0), 10.0);

        vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_WhichTexture;
let u_lightPos;
let u_cameraPos;

// Setup GL context
function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    // Added flag to tell webgl which buffer to preserve
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Enable Depth Buffer to Keep Track of What is In Front of Sopmething else
    gl.enable(gl.DEPTH_TEST);
    
    // Enable Blending So That The Alpha Works Correctly (Learned this from ChatGPT)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

}

// Get attributes from the GPU
function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_WhichTexture
    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    if (!u_WhichTexture) {
        console.log('Failed to get the storage location of u_WhichTexture');
        return;
    }

    // Get the storage location of u_lightPos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    console.log('u_Sampler0 in connect variables:', u_Sampler0);
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }

    // Get the storage location of u_Sampler
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
    }

    // Get the storage location of u_Sampler
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
      console.log('Failed to get the storage location of u_Sampler2');
      return false;
    }

    // Get the storage location of u_Sampler
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
      console.log('Failed to get the storage location of u_Sampler3');
      return false;
    }

    // Get the storage location of u_Sampler
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
      console.log('Failed to get the storage location of u_Sampler4');
      return false;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const TREX = 3;

// Globals related to UI elements (Make sure they are the same as the slider initials)
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_walkAngle1 = 0;
let g_walkAngle2 = 0;
let g_walkAngle3 = 0;
let g_walkAngle4 = 0;
let g_walkDisplacement = 0;
let g_walkAnimation = false;
let g_tailAngle = 0;
let g_tailAnimation = false;
let g_specialAngle1 = 0;
let g_specialAngle2 = 0;
let g_specialAngle3 = 0;
let g_specialAngle4 = 0;
let g_specialDisplacement = 0;
let g_specialAnimation = false;
let g_udderAngle = 0;
let g_udderAnimation = false;
let g_aspectScalar = 1;
let g_mouseRotationScalar = 1;
let g_normalOn = false;
let g_lightPos = [0,1,-2];

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
    
    // // Mouse Rotate
    // document.getElementById('webgl').onclick = function(event) {

    //     convertCoordinateEventsToGL(event)
    // }

    // Button Events
    document.getElementById('normalOn').onclick = function() {g_normalOn=true};
    document.getElementById('normalOff').onclick = function() {g_normalOn=false};
    document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
    document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};
    document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
    document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};
    document.getElementById('animationWalkOffButton').onclick = function() {g_walkAnimation=false;};
    document.getElementById('animationWalkOnButton').onclick = function() {g_walkAnimation=true;};
    document.getElementById('animationTailOffButton').onclick = function() {g_tailAnimation=false;};
    document.getElementById('animationTailOnButton').onclick = function() {g_tailAnimation=true;};

    document.getElementById('animationSpecialOffButton').onclick = function() {g_specialAnimation=false;};
    document.getElementById('animationSpecialOnButton').onclick = function() {g_specialAnimation=true;};

    document.getElementById('animationUdderOffButton').onclick = function() {g_udderAnimation=false;};
    document.getElementById('animationUdderOnButton').onclick = function() {g_udderAnimation=true;};

    document.getElementById('webgl').addEventListener('click', function(event) {
        if (event.shiftKey && g_specialAnimation == false) {
            g_specialAnimation = true;  // Shift key + click enables animation
        } 
        else if (event.shiftKey && g_specialAnimation == true) {
            g_specialAnimation = false;  // Shift key + click disables animation
        }
    });

    // Magenta Slider Events
    document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes();})

    // Yellow Slider Events
    document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes();})

    // Walk Slider Events
    // document.getElementById('walkSlide').addEventListener('mousemove', function() { g_walkAngle1 = this.value; renderAllShapes();})

    // Tail Slider Events
    document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderAllShapes();})

    // Angle Slider Events
    // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; } );
    document.getElementById('angleSlideX').addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); mouseReset(); } );
    document.getElementById('angleSlideY').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderAllShapes(); mouseReset(); } );

    document.getElementById('fov').addEventListener('mousemove', function() { g_camera.fov = this.value; renderAllShapes(); mouseReset(); } );
    document.getElementById('aspectScalar').addEventListener('mousemove', function() { g_aspectScalar = this.value; renderAllShapes(); mouseReset(); } );

    document.getElementById('mouseRotationScalar').addEventListener('mousemove', function() { g_mouseRotationScalar = this.value; renderAllShapes(); mouseReset(); } );
    
    document.getElementById('lightX').addEventListener('mousemove', function(ev) {if(ev.buttons==1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
    document.getElementById('lightY').addEventListener('mousemove', function(ev) {if(ev.buttons==1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightZ').addEventListener('mousemove', function(ev) {if(ev.buttons==1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
    
    // document.getElementById('aspectScalar').addEventListener('mousemove', function() { g_aspectScalar = this.value; renderAllShapes(); mouseReset(); } );
    // // Size + Segments Slider Events
    // document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; })
    // document.getElementById('alphaSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value; })
    // document.getElementById('segmentsSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; })
}

// function initTextures() {
  
//     // Create the image object
//     var image1 = new Image();
//     if (!image1) {
//       console.log('Failed to create the image1 object');
//       return false;
//     }

//     // Tell the browser to load an image1
//     image1.src = '../resources/Dog.jpg'; //'../resources/sky.jpg';
    
//     // Register the event handler to be called when image1 loading is completed
//     image1.onload = function(){ sendTextureToTEXTURE0(image1); };


//     // // Create the image object
//     // var image2 = new Image();
//     // if (!image2) {
//     //   console.log('Failed to create the image2 object');
//     //   return false;
//     // }

//     // // Register the event handler to be called when image2 loading is completed
//     // image2.onload = function(){ console.log("Image 2 loaded:", image2.src); sendTextureToTEXTURE1(image2); };
//     // // Tell the browser to load an image2
//     // image2.src = '../resources/UV_Checker.jpg';
  
//     // return true;
// }

function initTextures() {
    var image1 = new Image();
    var image2 = new Image();
    var image3 = new Image();
    var image4 = new Image();
    var image5 = new Image();

    // Ensure image1 loads first
    image1.onload = function () {
        console.log("Image loaded:", image1.src);
        drawImageToCanvas(image1);  // Draw on canvas (debugging)
        sendTextureToTEXTURE0(image1); // Continue WebGL processing with image1
    };

    image1.onerror = function () {
        console.error("Failed to load image:", image1.src);
    };

    // Load image1 (Make sure it is a Power of Two dimension image)
    image1.src = '../resources/UV_Checker.jpg';

    // Ensure image2 loads after image1
    image2.onload = function () {
        console.log("Image loaded:", image2.src);
        drawImageToCanvas(image1);  // Draw on canvas (debugging)
        sendTextureToTEXTURE1(image2); // Continue WebGL processing with image2
    };

    image2.onerror = function () {
        console.error("Failed to load image:", image2.src);
    };

    // Load image2 (Make sure it is a Power of Two dimension image)
    image2.src = '../resources/sky.jpg';

    // Ensure image2 loads after image1
    image3.onload = function () {
        console.log("Image loaded:", image3.src);
        drawImageToCanvas(image3);  // Draw on canvas (debugging)
        sendTextureToTEXTURE2(image3); // Continue WebGL processing with image3
    };

    image3.onerror = function () {
        console.error("Failed to load image:", image3.src);
    };

    // Load image3 (Make sure it is a Power of Two dimension image)
    image3.src = '../resources/Stone_Bricks.png';

    // Ensure image4 loads after image1
    image4.onload = function () {
        console.log("Image loaded:", image4.src);
        drawImageToCanvas(image4);  // Draw on canvas (debugging)
        sendTextureToTEXTURE3(image4); // Continue WebGL processing with image4
    };

    image4.onerror = function () {
        console.error("Failed to load image:", image4.src);
    };

    // Load image4 (Make sure it is a Power of Two dimension image)
    image4.src = '../resources/WoodPlank.jpg';

    // Ensure image5 loads after image1
    image5.onload = function () {
        console.log("Image loaded:", image5.src);
        drawImageToCanvas(image5);  // Draw on canvas (debugging)
        sendTextureToTEXTURE4(image5); // Continue WebGL processing with image5
    };

    image5.onerror = function () {
        console.error("Failed to load image:", image5.src);
    };

    // Load image5 (Make sure it is a Power of Two dimension image)
    image5.src = '../resources/grass_field.jpg';
}

// Function to draw image on HTML <canvas>
function drawImageToCanvas(image) {
    var canvas = document.getElementById("debugCanvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear any previous drawings
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function sendTextureToTEXTURE0(image) {

    var texture = gl.createTexture();
    console.log('Binding texture to TEXTURE0:', image.src);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y-axis
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler0, 0);  // Set the sampler for TEXTURE0
    console.log('Texture bound to TEXTURE0, Sampler0 set to 0');

}

function sendTextureToTEXTURE1(image) {
    
    var texture = gl.createTexture();
    console.log('Binding texture to TEXTURE1:', image.src);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y-axis
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler1, 1);  // Set the sampler for TEXTURE1
    console.log('Texture bound to TEXTURE1, Sampler0 set to 1');
}

function sendTextureToTEXTURE2(image) {
    
    var texture = gl.createTexture();
    console.log('Binding texture to TEXTURE2:', image.src);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y-axis
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler2, 2);  // Set the sampler for TEXTURE1
    console.log('Texture bound to TEXTURE2, Sampler2 set to 2');
}

function sendTextureToTEXTURE3(image) {
    
    var texture = gl.createTexture();
    console.log('Binding texture to TEXTURE3:', image.src);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y-axis
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler3, 3);  // Set the sampler for TEXTURE1
    console.log('Texture bound to TEXTURE3, Sampler3 set to 3');
}

function sendTextureToTEXTURE4(image) {
    
    var texture = gl.createTexture();
    console.log('Binding texture to TEXTURE4:', image.src);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y-axis
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler4, 4);  // Set the sampler for TEXTURE1
    console.log('Texture bound to TEXTURE3, Sampler3 set to 3');
}


var g_stats;
function main() {

    // FPS Monitor, check out https://github.com/mrdoob/stats.js/ for more info
    g_stats = new Stats();

    // move panel to right side instead of left
    // cuz our canvas will be covered
    g_stats.dom.style.left = "auto";
    g_stats.dom.style.right = "0";
    g_stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(g_stats.dom);

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    document.onkeydown = keydown;

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };
    canvas.onmouseup = mouseReset;

    // call init textures
    initTextures(gl, 0);

    // Specify the color for clearing <canvas>
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clearColor(0, 0, 0, 1.0);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by the browser repeatedly whenever its time
function tick() {

    // get fps of tick
    g_stats.begin();

    // Print some debug information so we know we are running
    g_seconds = performance.now() / 1000.0 - g_startTime;
    // console.log(performance.now());

    // Update Animation Angles
    updateAnimationAngles();

    // Draw Everything
    renderAllShapes();

    g_stats.end();

    // Tell the browser to update again when it has the time
    requestAnimationFrame(tick);
}

// Extract the event click and change it to webGL coordinates
function convertCoordinateEventsToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

g_audio = null;
g_audio = new Audio('Audio/Polish Cow Full Version.mp3')
g_audio.loop = true;
// Update the angles of everything if currently animated
function updateAnimationAngles() {

    if (g_magentaAnimation) {
        g_magentaAngle = (45*Math.sin(3 * g_seconds));
    }

    if (g_yellowAnimation) {
        g_yellowAngle = (20*Math.sin(1.5 * g_seconds));
    }

    if (g_walkAnimation) {

        // front left
        g_walkAngle1 = (20*Math.sin(3 *g_seconds));
        // back right
        g_walkAngle4 = (20*Math.sin(3 * (g_seconds - (Math.PI / 10))));
        // front right
        g_walkAngle2 = (20*Math.sin(3 * (g_seconds - Math.PI )));
        // back left
        g_walkAngle3 = (20*Math.sin(3 * (g_seconds - (Math.PI * 11/10))));

        g_walkDisplacement = Math.cos(3 * (2*g_seconds + Math.PI));

        g_specialAngle1 = 0;
        g_specialAngle2 = 0;
        g_specialAngle3 = 0;
        g_specialAngle4 = 0;
        g_specialDisplacement = 0

    }

    if (g_tailAnimation) {
        g_tailAngle = (60*Math.sin(5 *g_seconds));
    }

    if (g_specialAnimation) {
        let k = 3;
        g_specialAngle1 = (-45 * Math.max(Math.min(Math.cos(k * g_seconds), 0.8), -0.8) * 1.25 - 45);
        g_walkAngle1 = 0;
        g_walkAngle2 = 0;
        g_walkAngle3 = 0;
        g_walkAngle4 = 0;
        g_walkDisplacement = 0;
        g_specialAngle2 = (-25 * Math.max((Math.cos(k * g_seconds) - Math.cos((k * g_seconds) * 2) + 0.5), 0) - 10);
        g_specialAngle3 = (-25 * Math.max((Math.cos(k * g_seconds + Math.PI) - Math.cos((k * g_seconds + Math.PI) * 2) + 0.5), 0) - 10);
        g_specialAngle4 = (-10 * Math.max(Math.min(Math.cos(k * g_seconds), 0.8), -0.8) * 1.25);
        g_specialDisplacement = 0.5;


        g_camera.fov = Math.cos(g_seconds) * 200 + 100;
        document.getElementById('fov').value = g_camera.fov;

        g_audio.play();
    }
    else {
        g_audio.pause();
    }

    if (g_udderAnimation) {
        g_udderAngle = (10*Math.sin(g_seconds));
    }

    // g_lightPos[0] = 2 * Math.cos(g_seconds);
    // g_lightPos[1] = Math.cos(4 * g_seconds) + 3;
    // document.getElementById('lightX').value = g_lightPos[0] * 100;
    // document.getElementById('lightY').value = g_lightPos[1] * 100;
    
}

function keydown(ev){
    let key = ev.key;

    if (key == 'a'){
        g_camera.left(1);
    } else if (key == 'd'){
        g_camera.right(1);
    } else if (key == 'w'){
        // update camera
        g_camera.collision_map = g_map;
        g_camera.forward(1);
    } else if (key == 's'){
        g_camera.backward(1);
    } else if (key == 'q'){
        g_camera.rotateLeft(5);
    } else if (key == 'e'){
        g_camera.rotateRight(5);
    } else if (key == 'ArrowUp') {
        g_camera.moveUp(1);
    } else if (key == 'ArrowDown') {
        g_camera.moveDown(1);
    } else if (key == 't'){
        console.log(g_camera.eye.elements)
        
        // direction vector
        var d = Vector3.sub(g_camera.at, g_camera.eye);
        d.normalize().mul(1);

        // eye prediction
        let eye_prediction = new Vector3(g_camera.eye.elements);
        eye_prediction.elements[0] = eye_prediction.elements[0] + 16;
        eye_prediction.elements[2] = eye_prediction.elements[2] + 16;
        // eye_prediction.elements[2] = 32 - eye_prediction.elements[2];

        console.log(g_map);
        console.log("Current Eye:", g_camera.eye.elements);
        console.log("Eye X prediction:", eye_prediction.elements[0]);
        console.log("Eye Z prediction:", eye_prediction.elements[2]);
        console.log("Wall prediction:", g_map[Math.floor(eye_prediction.elements[0])][Math.floor(eye_prediction.elements[2])]);
        

        // don't go forward if you would for into a wall
        if(g_map[Math.floor(eye_prediction.elements[0])][Math.floor(eye_prediction.elements[2])] == 1){
            g_map[Math.floor(eye_prediction.elements[0])][Math.floor(eye_prediction.elements[2])] = 0;
        }

        console.log(g_map);
    }

    renderAllShapes();
    console.log(key);
}

function drawCube(M, color, textureNum=null){
    cube = new Cube();
    cube.matrix = new Matrix4(M);
    cube.color = color;
    if (textureNum != null){
        cube.textureNum = textureNum;
    }

    if (g_normalOn){
        cube.textureNum = -3
    }
    cube.render();
}

function drawCylinder(M, color){
    cylinder = new Cylinder();
    cylinder.matrix = new Matrix4(M);
    cylinder.color = color;
    cylinder.render();
}

var g_camera = new Camera();

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

// var g_map = [
//     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1],
//     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
// ]

function drawMap(){
    for (x=0; x<32; x++){
        for (y=0; y<32; y++){
            if(g_map[x][y] == 1){
                var body = new Cube();
                body.color = [1,1,1,1];
                body.textureNum = 2;
                body.matrix.translate(0, -.75, 0);
                // body.matrix.scale(.3, .3, .3);
                body.matrix.translate(x-16, 0, y-16);
                body.render();
            }
        }
    }

    for (x=0; x<32; x++) {
        for (y=0; y<32; y++) {
            if (x==0 || x==31 || y==0 || y==31) {
                var body = new Cube();
                body.textureNum = 2;
                body.color = [0.8, 1, 1, 1];
                body.matrix.translate(0, -.75, 0);
                // body.matrix.scale(.3, .3, .3);
                body.matrix.translate(x-16, 1, y-16);
                body.render();
            }
        }    
    }

    for (x=0; x<32; x++) {
        for (y=0; y<32; y++) {
            if (x==0 || x==31 || y==0 || y==31) {
                var body = new Cube();
                body.textureNum = 2;
                body.color = [0.8, 1, 1, 1];
                body.matrix.translate(0, -.75, 0);
                // body.matrix.scale(.3, .3, .3);
                body.matrix.translate(x-16, 2, y-16);
                body.render();
            }
        }    
    }

    for (x=0; x<32; x++) {
        for (y=0; y<32; y++) {
            if ( (x==0 && y%2==0) || (x==31 && y%2==0) || (y==0 && x%2==0) || (y==31 && x%2==0)) {
                var body = new Cube();
                body.textureNum = 2;
                body.color = [0.8, 1, 1, 1];
                body.matrix.translate(0, -.75, 0);
                // body.matrix.scale(.3, .3, .3);
                body.matrix.translate(x-16, 3, y-16);
                body.render();
            }
        }    
    }

    // // draw house
    // for (x=0; x<8; x++){
    //     for (y=0; y<8; y++){
    //         if(x == 0 || x == 7 || y == 7){
    //             var body = new Cube();
    //             body.color = [1,1,1,1];
    //             body.textureNum = 2;
    //             body.matrix.translate(0, -.75, 0);
    //             // body.matrix.scale(.3, .3, .3);
    //             body.matrix.translate(12 + x-16, 1, 13 + y-16);
    //             body.render();
    //         }
    //     }
    // }

    // for (x=0; x<8; x++){
    //     for (y=0; y<8; y++){
    //         // if(x == 0 || x == 7 || y == 7){
    //         var body = new Cube();
    //         body.color = [1,1,1,1];
    //         body.textureNum = 3;
    //         body.matrix.translate(0, -.75, 0);
    //         // body.matrix.scale(.3, .3, .3);
    //         body.matrix.translate(12 + x-16, 2, 13 + y-16);
    //         body.render();
    //         // }
    //     }
    // }
}

// function drawMap() {
//     for (x=0; x<32; x++) {
//         for (y=0; y<32; y++) {
//             if (x==0 || x==31 || y==0 || y==31) {
//                 var body = new Cube();
//                 body.color = [0.8, 1, 1, 1];
//                 body.matrix.translate(0, -.75, 0);
//                 body.matrix.scale(.3, .3, .3);
//                 body.matrix.translate(x-16, 0, y-16);
//                 body.render();
//             }
//         }    
//     }
// }

// Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
    // Check the time at the start of this function
    var startTime = performance.now()

    // Pass the projection matrix
    var projMat = new Matrix4();
    // fov, aspect, near, far
    projMat.setPerspective(g_camera.fov, g_aspectScalar * canvas.width/canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2],
        g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2],
        g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]);  // (eye, at, lookup)

    // viewMat.setLookAt(0, 0, 3,
    //     0, 0, -100,
    //     0, 1, 0);  // (eye, at, lookup)

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_GlobalRotateMatrix attribute
    // var globalRotMat = new Matrix4().rotate(g_globalAngleY, 1, 0, 0);
    // globalRotMat = globalRotMat.rotate(g_globalAngleX, 0, 1, 0);

    var globalRotMat = new Matrix4();

    if(g_globalAngleY != 0){
        globalRotMat = globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
    }
    if(g_globalAngleX != 0){
        globalRotMat = globalRotMat.rotate(g_globalAngleX, 0, 1, 0);
    }
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Pass the light position to GLSL
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    // Pass the light position to GLSL
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ///////////////////////////////////////////////////
    // ACTUAL OBJECTS IN SCENE
    ///////////////////////////////////////////////////

    // Draw Floor
    var floor = new Cube();
    floor.color = [1,0,0,1];
    floor.textureNum = -1;
    floor.matrix.translate(0, -.75, 0);
    floor.matrix.scale(30, 0, 30);
    floor.matrix.translate(-.5, 0, -.5);
    floor.render();

    // Draw the sky
    var sky = new Cube();
    sky.color = [1,0,0,1];
    sky.textureNum = 0;
    if (g_normalOn) sky.textureNum = -3;
    sky.matrix.scale(-50, -50, -50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    // Draw Map
    drawMap()


    // Draw The Light
    var light = new Cube();
    light.color = [2, 2, 0, 1]
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1, -.1, -.1);
    light.matrix.translate(-.5, -.5, -.5);
    light.render()

    // draw test sphere
    var test = new Sphere();
    test.color = [1,0,0,1];
    test.textureNum = 0
    if(g_normalOn) test.textureNum = -3;
    test.matrix.translate(1.5, 0.5, -0.5);
    test.render();

    // Draw the body
    var body = new Matrix4();
    var bodyColor = [1.0, 1.0, 1.0, 1.0];
    var bodyTextureNum = 1;

    body.translate(-.20, -0.25, -0.5);
    // body.rotate(0, 1, 0, 0);
    body.rotate(180, 0, 1, 0);

    // special animation
    body.rotate(g_specialAngle1, 0, 1, 0);
    body.rotate(g_specialAngle4, 0, 0, 1);

    body.translate(0, -g_specialAngle4 / 80, 0);
    body.translate(0, g_specialAngle2 / 400, 0);
    body.translate(0, -g_specialAngle3 / 400, 0);
    body.translate(g_specialDisplacement, 0, 0);

    body.translate(0, g_walkDisplacement / 30, 0)

    bodyCoordinateMat = new Matrix4(body);

    body.scale(0.3, .4, 1);

    drawCube(body, bodyColor, bodyTextureNum);

    
    // console.log("Rendered Body");

    // Draw the head
    var head = new Matrix4();
    var headColor = [1.0, 1.0, 1.0, 1.0];
    head = new Matrix4(bodyCoordinateMat);
    head.translate(.05, 0.25, -0.27);

    head.translate(.05, 0, 0);
    
    head.rotate(-g_magentaAngle, 0, 0, 1);   

    head.translate(-.05, 0, 0);

    headCoordinateMat = new Matrix4(head);

    head.scale(0.2, 0.25, 0.35);
    
    drawCube(head, headColor);

    // Draw the nose
    var nose = new Matrix4();
    var noseColor = [1, 0.4118, 0.7059, 1.0];
    nose = new Matrix4(headCoordinateMat);
    nose.translate(.025, 0.02, -0.1);

    nose.translate(0, g_yellowAngle / 200 / 4, 0);

    nose.scale(0.15, 0.1, 0.1);

    drawCube(nose, noseColor);

    // Eyes
    var eye1 = new Matrix4();
    var eye1Color = [0, 0, 0, 1.0];
    eye1 = new Matrix4(headCoordinateMat);

    eye1.translate(.025, 0.15, -0.05);

    eye1.scale(0.05, 0.05, 0.05);

    drawCube(eye1, eye1Color);

    var eye2 = new Matrix4();
    var eye2Color = [0, 0, 0, 1.0];
    eye2 = new Matrix4(headCoordinateMat);

    eye2.translate(.125, 0.15, -0.05);

    eye2.scale(0.05, 0.05, 0.05);

    drawCube(eye2, eye2Color);

    // Ears (1 = left from the front)
    var innerEar1 = new Matrix4();
    var innerEar1Color = [1, 0.4118, 0.7059, 1.0];
    innerEar1 = new Matrix4(headCoordinateMat);

    innerEar1.translate(.02, 0.11, 0.2);
    innerEar1.rotate(45, 0, 0, 1);
    innerEar1.scale(0.1, 0.15, 0.05);

    drawCube(innerEar1, innerEar1Color);

    var innerEar2 = new Matrix4();
    var innerEar2Color = [1, 0.4118, 0.7059, 1.0];
    innerEar2 = new Matrix4(headCoordinateMat);

    innerEar2.translate(.12, 0.185, 0.2);
    innerEar2.rotate(-45, 0, 0, 1);
    innerEar2.scale(0.1, 0.15, 0.05);

    drawCube(innerEar2, innerEar2Color);

    var outerEar1 = new Matrix4();
    var outerEar1Color = [1, 1, 1, 1.0];
    outerEar1 = new Matrix4(headCoordinateMat);

    outerEar1.translate(.02, 0.08, 0.25);
    outerEar1.rotate(45, 0, 0, 1);
    outerEar1.scale(0.15, 0.2, 0.05);

    drawCube(outerEar1, outerEar1Color);

    var outerEar2 = new Matrix4();
    var outerEar2Color = [1, 1, 1, 1.0];
    outerEar2 = new Matrix4(headCoordinateMat);

    outerEar2.translate(.09, 0.2, 0.25);
    outerEar2.rotate(-45, 0, 0, 1);
    outerEar2.scale(0.15, 0.2, 0.05);

    drawCube(outerEar2, outerEar2Color);

    // Legs

    // leg 1
    var leftFrontTopLeg = new Matrix4(bodyCoordinateMat);
    var leftFrontTopLegColor = [1.0, 1.0, 1.0, 1.0];
    
    leftFrontTopLeg.translate(.05, 0.2, 0.25);

    leftFrontTopLeg.rotate(g_walkAngle1 + 15, 1, 0, 0);

    leftFrontTopLeg.rotate(g_specialAngle2, 0, 0, 1);

    leftFrontTopLeg.rotate(180, 1, 0, 0);

    leftFrontTopLeg.translate(0, g_specialAngle2 / 400, 0);
    leftFrontTopLeg.translate(0, -g_specialAngle3 / 400, 0);

    var leftFrontTopLegCoordinateMat = new Matrix4(leftFrontTopLeg);

    leftFrontTopLeg.scale(0.5, 0.5, 0.5);
    leftFrontTopLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(leftFrontTopLeg, leftFrontTopLegColor);


    // leg 2
    var rightFrontTopLeg = new Matrix4(bodyCoordinateMat);
    var rightFrontTopLegColor = [1.0, 1.0, 1.0, 1.0];

    rightFrontTopLeg.translate(.25, 0.2, 0.25);
    
    rightFrontTopLeg.rotate(g_walkAngle2 + 15, 1, 0, 0);

    rightFrontTopLeg.rotate(-g_specialAngle3, 0, 0, 1);

    rightFrontTopLeg.rotate(180, 1, 0, 0);

    rightFrontTopLeg.translate(0, g_specialAngle2 / 400, 0);
    rightFrontTopLeg.translate(0, -g_specialAngle3 / 400, 0);

    var rightFrontTopLegCoordinateMat = new Matrix4(rightFrontTopLeg);

    rightFrontTopLeg.scale(0.5, 0.5, 0.5);
    rightFrontTopLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(rightFrontTopLeg, rightFrontTopLegColor);

    // leg 3
    var leftBackTopLeg = new Matrix4(bodyCoordinateMat);
    var leftBackTopLegColor = [1.0, 1.0, 1.0, 1.0];

    leftBackTopLeg.translate(.05, 0.2, 0.8);
    leftBackTopLeg.rotate(g_walkAngle3 - 20, 1, 0, 0);

    leftBackTopLeg.rotate(g_specialAngle2, 0, 0, 1);

    leftBackTopLeg.rotate(180, 1, 0, 0);

    leftBackTopLeg.translate(0, g_specialAngle2 / 400, 0);
    leftBackTopLeg.translate(0, -g_specialAngle3 / 400, 0);

    var leftBackTopLegCoordinateMat = new Matrix4(leftBackTopLeg);

    leftBackTopLeg.scale(0.5, 0.5, 0.5);
    leftBackTopLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(leftBackTopLeg, leftBackTopLegColor);

    // leg 4
    var rightBackTopLeg = new Matrix4(bodyCoordinateMat);
    var rightBackTopLegColor = [1.0, 1.0, 1.0, 1.0];

    rightBackTopLeg.translate(.25, 0.2, 0.8);
    rightBackTopLeg.rotate(g_walkAngle4 - 20, 1, 0, 0);
    rightBackTopLeg.rotate(-g_specialAngle3, 0, 0, 1);
    rightBackTopLeg.rotate(180, 1, 0, 0);

    rightBackTopLeg.translate(0, g_specialAngle2 / 400, 0);
    rightBackTopLeg.translate(0, -g_specialAngle3 / 400, 0);

    var rightBackTopLegCoordinateMat = new Matrix4(rightBackTopLeg);

    rightBackTopLeg.scale(0.5, 0.5, 0.5);
    rightBackTopLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(rightBackTopLeg, rightBackTopLegColor);

    // leg 5
    var leftFrontBotLeg = new Matrix4(leftFrontTopLegCoordinateMat);
    var leftFrontBotLegColor = [1.0, 1.0, 1.0, 1.0];

    leftFrontBotLeg.scale(1, 0.5, 1);

    leftFrontBotLeg.translate(0, 0.7, 0.01);

    // var leftFrontBotLegCoordinateMat = new Matrix4(leftFrontBotLeg);
    
    leftFrontBotLeg.rotate(g_walkAngle1 - 15, 1, 0, 0);
    leftFrontBotLeg.scale(0.5, 0.5, 0.5);
    leftFrontBotLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(leftFrontBotLeg, leftFrontBotLegColor);

    // leg 6
    var rightFrontBotLeg = new Matrix4(rightFrontTopLegCoordinateMat);
    var rightFrontBotLegColor = [1.0, 1.0, 1.0, 1.0];

    rightFrontBotLeg.scale(1, 0.5, 1);

    rightFrontBotLeg.translate(0, 0.7, 0.01);

    // var rightFrontBotLegCoordinateMat = new Matrix4(rightFrontBotLeg);
    
    rightFrontBotLeg.rotate(g_walkAngle2 - 15, 1, 0, 0);
    rightFrontBotLeg.scale(0.5, 0.5, 0.5);
    rightFrontBotLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(rightFrontBotLeg, rightFrontBotLegColor);

    // leg 7
    var leftBackBotLeg = new Matrix4(leftBackTopLegCoordinateMat);
    var leftBackBotLegColor = [1.0, 1.0, 1.0, 1.0];

    leftBackBotLeg.scale(1, 0.5, 1);

    leftBackBotLeg.translate(0, 0.7, -0.01);

    // var leftBackBotLegCoordinateMat = new Matrix4(leftBackBotLeg);
    
    leftBackBotLeg.rotate(g_walkAngle3 + 15, 1, 0, 0);
    leftBackBotLeg.scale(0.5, 0.5, 0.5);
    leftBackBotLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(leftBackBotLeg, leftBackBotLegColor);

    // leg 8
    var rightBackBotLeg = new Matrix4(rightBackTopLegCoordinateMat);
    var rightBackBotLegColor = [1.0, 1.0, 1.0, 1.0];

    rightBackBotLeg.scale(1, 0.5, 1);

    rightBackBotLeg.translate(0, 0.7, -0.01);

    // var rightBackBotLegCoordinateMat = new Matrix4(rightBackBotLeg);
    
    rightBackBotLeg.rotate(g_walkAngle4 + 15, 1, 0, 0);
    rightBackBotLeg.scale(0.5, 0.5, 0.5);
    rightBackBotLeg.scale(0.1, 0.8, 0.1);
    
    drawCylinder(rightBackBotLeg, rightBackBotLegColor);

    // TAIL
    // tail 1
    var tailbase = new Matrix4(bodyCoordinateMat);
    var tailbaseColor = [0.50, 0.25, 0.13, 1];
    
    tailbase.translate(.15, 0.3, 1);

    tailbase.rotate(g_tailAngle, 0, 1, 0);
    tailbase.rotate(g_tailAngle / 3, 1, 0, 0);

    tailbase.rotate(90, 1, 0, 0);

    var tailbaseCoordinateMat = new Matrix4(tailbase);

    tailbase.scale(0.5, 0.2, 0.5);
    tailbase.scale(0.1, 0.8, 0.1);
    
    drawCylinder(tailbase, tailbaseColor);

    // tail 2
    var tailMid = new Matrix4(tailbaseCoordinateMat);
    var tailMidColor = [0.50, 0.25, 0.13, 1];
    
    tailMid.translate(0, 0.15, 0);

    tailMid.rotate(-g_tailAngle, 0, 0, 1);

    var tailMidCoordinateMat = new Matrix4(tailMid);

    tailMid.scale(0.3, 0.2, 0.3);
    tailMid.scale(0.1, 0.8, 0.1);
    
    drawCylinder(tailMid, tailMidColor);

    // tail 3
    var tailEnd = new Matrix4(tailMidCoordinateMat);
    var tailEndColor = [0.50, 0.25, 0.13, 1];
    
    tailEnd.translate(0, 0.15, 0);

    tailEnd.rotate(-g_tailAngle, 0, 0, 1);

    // var tailEndCoordinateMat = new Matrix4(tailEnd);

    tailEnd.scale(0.4, 0.15, 0.4);
    tailEnd.scale(0.1, 0.8, 0.1);
    
    drawCylinder(tailEnd, tailEndColor);

    // Patches

    // patch 1
    var patch1 = new Matrix4(bodyCoordinateMat);
    var patch1Color = [0.50, 0.25, 0.13, 1];
    
    patch1.translate(.15, .25, .7);

    patch1.scale(0.6, 0.6, 0.8)
    patch1.scale(0.3, 0.3, 0.3)

    drawCube(patch1, patch1Color)

    // patch 2
    var patch2 = new Matrix4(bodyCoordinateMat);
    var patch2Color = [0.50, 0.25, 0.13, 1];
    
    patch2.translate(-.025, .1, .65);

    patch2.scale(0.6, 0.8, 0.6)
    patch2.scale(0.3, 0.3, 0.3)

    drawCube(patch2, patch2Color)

    // patch 3
    var patch3 = new Matrix4(bodyCoordinateMat);
    var patch3Color = [0.50, 0.25, 0.13, 1];
    
    patch3.translate(-.025, .25, .4);

    patch3.scale(0.6, 0.6, 0.6)
    patch3.scale(0.3, 0.3, 0.3)

    drawCube(patch3, patch3Color)

    // patch4
    var patch4 = new Matrix4(bodyCoordinateMat);
    var patch4Color = [0.50, 0.25, 0.13, 1];
    
    patch4.translate(.15, .25, .1);

    patch4.scale(0.6, 0.6, 0.8)
    patch4.scale(0.3, 0.3, 0.3)

    drawCube(patch4, patch4Color)

    // patch5
    var patch5 = new Matrix4(bodyCoordinateMat);
    var patch5Color = [0.50, 0.25, 0.13, 1];
    
    patch5.translate(-.025, .1, .15);

    patch5.scale(0.6, 0.8, 0.6)
    patch5.scale(0.3, 0.3, 0.3)

    drawCube(patch5, patch5Color)

    // patch6
    var patch6 = new Matrix4(bodyCoordinateMat);
    var patch6Color = [0.50, 0.25, 0.13, 1];
    
    patch6.translate(.15, .12, .4);

    patch6.scale(0.6, 0.7, 0.7)
    patch6.scale(0.3, 0.3, 0.3)

    drawCube(patch6, patch6Color)

    // Udder
    var udder = new Matrix4(bodyCoordinateMat);
    var udderColor = [1, 0.4118, 0.7059, 1.0];
    
    udder.translate(.045, -.1, .55);

    var udderCoordinateMat = new Matrix4(udder);

    udder.scale(0.7, 0.7, 0.7)
    udder.scale(0.3, 0.3, 0.3)

    drawCube(udder, udderColor)

    // subUdder1
    var subUdder1 = new Matrix4(udderCoordinateMat);
    var subUdder1Color = [1, 0.4118, 0.7059, 1.0];
    
    subUdder1.rotate(g_udderAngle, 1, 1, 0);

    subUdder1.translate(.055, .015, 0.05);

    subUdder1.rotate(180, 1, 0, 0);

    subUdder1.scale(0.3, 0.4, 0.3)
    subUdder1.scale(0.1, 0.3, 0.1)

    drawCylinder(subUdder1, subUdder1Color)

    // subUdder2
    var subUdder2 = new Matrix4(udderCoordinateMat);
    var subUdder2Color = [1, 0.4118, 0.7059, 1.0];
    
    subUdder2.rotate(g_udderAngle, 1, -1, 0);

    subUdder2.translate(.155, .015, 0.05);

    subUdder2.rotate(180, 1, 0, 0);

    subUdder2.scale(0.3, 0.4, 0.3)
    subUdder2.scale(0.1, 0.3, 0.1)

    drawCylinder(subUdder2, subUdder2Color)

    // subUdder3
    var subUdder3 = new Matrix4(udderCoordinateMat);
    var subUdder3Color = [1, 0.4118, 0.7059, 1.0];
    
    subUdder3.rotate(g_udderAngle, -1, 1, 0);

    subUdder3.translate(.155, .015, 0.15);

    subUdder3.rotate(180, 1, 0, 0);

    subUdder3.scale(0.3, 0.4, 0.3)
    subUdder3.scale(0.1, 0.3, 0.1)

    drawCylinder(subUdder3, subUdder3Color)

    // subUdder4
    var subUdder4 = new Matrix4(udderCoordinateMat);
    var subUdder4Color = [1, 0.4118, 0.7059, 1.0];
    
    subUdder4.rotate(g_udderAngle, -1, -1, 0);

    subUdder4.translate(.055, .015, 0.15);

    subUdder4.rotate(180, 1, 0, 0);

    subUdder4.scale(0.3, 0.4, 0.3)
    subUdder4.scale(0.1, 0.3, 0.1)

    drawCylinder(subUdder4, subUdder4Color)

    // Check the time at the end of the function, and show on webpage
    // var duration = performance.now() - startTime;
    // sendTextToHTML(" ms: " + Math.floor(duration) + " fps " + Math.floor(10000/duration)/10, "numdot")
}

// Set the text of an HTML element
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

// var g_shapesList = [];

// // var g_points = [];    // The array for the position of a mouse press
// // var g_colors = [];    // The array to store the color of a point
// // var g_sizes = [];   // The array to store the size of the point

g_initialAngleX = null;
g_initialAngleY = null;
g_initialMouseX = null;
g_initialMouseY = null;
function rotate(x, y){

    if (g_initialAngleX === null){
        g_initialAngleX = parseFloat(g_globalAngleX);
    }
    if (g_initialAngleY === null){
        g_initialAngleY = parseFloat(g_globalAngleY);
    }
    if (g_initialMouseX === null){
        g_initialMouseX = x;
    }
    if (g_initialMouseY === null){
        g_initialMouseY = y;
    }

    // Rotate
    console.log("ROTATE")
    console.log(g_initialAngleX)
    console.log(g_initialAngleY)
    console.log(g_initialMouseX)
    console.log(g_initialMouseY)
    console.log(g_globalAngleX)
    console.log(g_globalAngleY)

    g_globalAngleX = (g_initialAngleX + (g_initialMouseX - x)*360) % 360;
    g_globalAngleY = (g_initialAngleY + (y - g_initialMouseY)*360) % 360;
}

let g_oldRotateAngle = 0;

function gameWorldRotate(x, y){

    if (g_initialMouseX === null){
        g_initialMouseX = x;
    }
    if (g_initialMouseY === null){
        g_initialMouseY = y;
    }
    if (g_oldRotateAngle === null){
        g_oldRotateAngle = 0;
    }

    // Rotate
    // console.log("ROTATE")
    // console.log(g_initialAngleX)
    // console.log(g_initialAngleY)
    // console.log(g_initialMouseX)
    // console.log(g_initialMouseY)
    // console.log(g_globalAngleX)
    // console.log(g_globalAngleY)

    let rotateDirection =  ((g_initialMouseX - x)*360) % 360;
    let rotateAngle = g_oldRotateAngle - rotateDirection;

    console.log('Rotate Direction:', rotateDirection);
    console.log('Rotate Angle:', rotateAngle);
    console.log('Old Rotate Angle:', g_oldRotateAngle);

    if (rotateAngle >= 0){
        g_camera.rotateLeft(-rotateAngle * g_mouseRotationScalar);
    } else {
        g_camera.rotateRight(rotateAngle * g_mouseRotationScalar);
    }

    g_oldRotateAngle = rotateDirection;
}

function mouseReset() {
    g_initialAngleX = null;
    g_initialAngleY = null;
    g_initialMouseX = null;
    g_initialMouseY = null;
    g_oldRotateAngle = null;
}

function click(ev) {

    console.log("On CLICK")
    console.log(g_initialAngleX)
    console.log(g_initialAngleY)
    console.log(g_initialMouseX)
    console.log(g_initialMouseY)
    console.log(g_globalAngleX)
    console.log(g_globalAngleY)

    let [x, y] = convertCoordinateEventsToGL(ev);

    gameWorldRotate(x, y);

    // // Create and store the new point
    // let point;
    // if (g_selectedType == POINT){
    //     point = new Point();
    // } else if (g_selectedType == TRIANGLE) {
    //     point = new Triangle();
    // } else if (g_selectedType == CIRCLE){
    //     point = new Circle();
    // } else {
    //     point = new TRex();
    // }
    // point.position = [x, y];
    // point.color = g_selectedColor.slice();
    // point.size = g_selectedSize;

    // if (g_selectedType == CIRCLE){
    //     point.segments = g_selectedSegments;
    // }

    // g_shapesList.push(point);

    // // // Store the coordinates to g_points array
    // // g_points.push([x, y]);
    
    // // // Store the selected color to the g_colors array
    // // g_colors.push(g_selectedColor.slice());

    // // // Store the size of the point
    // // g_sizes.push(g_selectedSize);
    
    // // // Store the coordinates to g_points array
    // // if (x >= 0.0 && y >= 0.0) {            // First quadrant
    // //     g_colors.push([1.0, 0.0, 0.0, 1.0]);    // Red
    // // } else if (x < 0.0 && y < 0.0) { // Third quadrant
    // //     g_colors.push([0.0, 1.0, 0.0, 1.0]);    // Green
    // // } else {                                                 // Others
    // //     g_colors.push([1.0, 1.0, 1.0, 1.0]);    // White
    // // }

    // renderAllShapes();
}
