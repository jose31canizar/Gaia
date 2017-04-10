    var currentColor = palette.blue;

    var r = 0.93725490196;
    var g = 0.83529411764;
    var b = 0.76470588235;

    //
    //  Compile a shader
    //

    var vertexAttribArray;
    var vertexBuffer;
    var normalsBuffer;
    var indicesBuffer;

    var gridSize = 4;
    var scale = 1;

    function CompileShader(gl, id) {
        //  Get shader by id
        var src = document.getElementById(id);
        //  Create shader based on type setting
        var shader;
        if (src.type == "x-shader/x-fragment")
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        else if (src.type == "x-shader/x-vertex")
            shader = gl.createShader(gl.VERTEX_SHADER);
        else
            return null;
        //  Read source into str
        var str = "";
        var k = src.firstChild;
        while (k) {
            if (k.nodeType == 3) str += k.textContent;
            k = k.nextSibling;
        }
        gl.shaderSource(shader, str);
        //  Compile the shader
        gl.compileShader(shader);
        //  Check for errors
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            alert(gl.getShaderInfoLog(shader));
        //  Return shader
        return shader;
    }

    //
    //  Compile shader program
    //
    function CompileShaderProg(gl, vert, frag) {
        //  Compile the program
        var prog = gl.createProgram();
        gl.attachShader(prog, CompileShader(gl, vert));
        gl.attachShader(prog, CompileShader(gl, frag));
        gl.linkProgram(prog);
        //  Check for errors
        if (gl.getProgramParameter(prog, gl.LINK_STATUS) == 0)
            alert(gl.getProgramInfoLog(prog));
        //  Return program
        return prog;
    }

    var gl, canvas;

    function webGLStart() {
        //  Set canvas
        canvas = document.getElementById("canvas");
        //  Select canvas size
        var size = Math.min(window.innerWidth, window.innerHeight) - 10;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var asp = window.innerWidth/window.innerHeight;
        //  Start WebGL
        if (!window.WebGLRenderingContext) {
            alert("Your browser does not support WebGL. See http://get.webgl.org");
            return;
        }
        try {
            gl = canvas.getContext("webgl2");
        } catch (e) {}
        if (!gl) {
            alert("Can't get WebGL");
            return;
        }

        //  Set viewport to entire canvas
        gl.viewport(0, 0, canvas.width, canvas.height);

        //  Load Shader
        var prog = CompileShaderProg(gl, "shader-vs", "shader-fs");

        //  Set program
        gl.useProgram(prog);

        //  Set projection
        var ProjectionMatrix = new CanvasMatrix4();
        // ProjectionMatrix.ortho(-2.5*asp, +2.5*asp, -2.5, +2.5, -2.5, +2.5);


        ProjectionMatrix.perspective(100, asp, 0.001, 100);

        normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);

        //  Cube normal coordinates
        var normals = [
          // Top
           0.0,  1.0,  0.0,
           0.0,  1.0,  0.0,
           0.0,  1.0,  0.0,
           0.0,  1.0,  0.0,

           0.0,  1.0,  0.0,
           0.0,  1.0,  0.0,
           0.0,  1.0,  0.0,
           0.0,  1.0,  0.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        var vertices = [];

        for(var i = 0; i < gridSize + 1; i++) {
          for(var j = 0; j < gridSize + 1; j++) {
            vertices.push(j*2 - gridSize);
            vertices.push(0);
            vertices.push(i*2 - gridSize);
          }
        }



        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

        // var indices = [
        //   4, 0, 5, 1, 6, 2, 7, 3,
        //   8, 4, 9, 5, 10, 6, 11, 7,
        //   12, 8, 13, 9, 14, 10, 15, 11
        // ];

        var indices = [];

        for(var i = 0; i < gridSize; i++) {
          const inc = i*(gridSize + 1);
          for(var j = 0; j < gridSize + 1; j++) {
            indices.push(inc + gridSize + j + 1);
            indices.push(inc + j);
          }
        }

        console.log(indices);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        // indicesBuffer.itemSize = 1;
        // indicesBuffer.numItems = 16;

        //  Set state to draw scene
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(r, g, b, 1);
        //  Mouse control variables
        var x0 = y0 = move = 0;
        //  Rotation angles
        var th = ph = 15;
        //  Draw scene the first time
        Display();


        setInterval(function(){
          Display();
     }, 100);


        //
        //  Display the scene
        //
        function Display() {
            //  Clear the screen and Z buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Compute modelview matrix
            var ModelViewMatrix = new CanvasMatrix4();
            ModelViewMatrix.makeIdentity();

            ModelViewMatrix.rotate(ph, 0, 1, 0);
            ModelViewMatrix.rotate(th, 1, 0, 0);
            ModelViewMatrix.translate(0, 0, -0.2);

            // Set shader
            gl.useProgram(prog);

            var r = [red(currentColor)/255.0];
            var g = [green(currentColor)/255.0];
            var b = [blue(currentColor)/255.0];

            var la = [0.9]; //ambient light
            var ld = [0.5]; //diffuse light
            var ls = [0.5]; //specular light

            var x = [0.0];
            var y = [0.5];
            var z = [0.5];

            gl.uniform1f(gl.getUniformLocation(prog, "lx"), new Float32Array(x));
            gl.uniform1f(gl.getUniformLocation(prog, "ly"), new Float32Array(y));
            gl.uniform1f(gl.getUniformLocation(prog, "lz"), new Float32Array(z));

            gl.uniform1f(gl.getUniformLocation(prog, "LightAmbient"), new Float32Array(la));
            gl.uniform1f(gl.getUniformLocation(prog, "LightDiffuse"), new Float32Array(ld));
            gl.uniform1f(gl.getUniformLocation(prog, "LightSpecular"), new Float32Array(ls));

            gl.uniform1f(gl.getUniformLocation(prog, "Red"), new Float32Array(r));
            gl.uniform1f(gl.getUniformLocation(prog, "Green"), new Float32Array(g));
            gl.uniform1f(gl.getUniformLocation(prog, "Blue"), new Float32Array(b));




            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            var Vertices = gl.getAttribLocation(prog, "XYZ");
            gl.enableVertexAttribArray(Vertices);
            gl.vertexAttribPointer(Vertices, 3, gl.FLOAT, false, 0, 0);

            //  Set up 3D normal array
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
            var Normals = gl.getAttribLocation(prog, "Normals");
            gl.enableVertexAttribArray(Normals);
            gl.vertexAttribPointer(Normals, 3, gl.FLOAT, false, 0, 0);


            //  Set projection and modelview matrixes
            gl.uniformMatrix4fv(gl.getUniformLocation(prog, "ProjectionMatrix"), false, new Float32Array(ProjectionMatrix.getAsArray()));
            gl.uniformMatrix4fv(gl.getUniformLocation(prog, "ModelViewMatrix"), false, new Float32Array(ModelViewMatrix.getAsArray()));
            gl.uniformMatrix4fv(gl.getUniformLocation(prog, "NormalMatrix"), false, new Float32Array(ModelViewMatrix.getAsArray()));

            // var ext = gl.getExtension('OES_element_index_uint');

            //  Disable vertex arrays
            gl.disableVertexAttribArray(Normals);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

            const v = gridSize*2 + 2;
            for(var i = 0; i < gridSize; i++) {
              gl.drawElements(gl.TRIANGLE_STRIP, v, gl.UNSIGNED_SHORT, i*(v*2));
            }


            gl.disableVertexAttribArray(vertexAttribArray);



            //  Flush
            gl.flush();
        }

        //
        //  Resize canvas
        //
        canvas.resize = function() {
            var size = Math.min(window.innerWidth, window.innerHeight) - 10;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            Display();
        }

        //
        //  Mouse button pressed
        //
        canvas.onmousedown = function(ev) {
            move = 1;
            x0 = ev.clientX;
            y0 = ev.clientY;
        }

        //
        //  Mouse button released
        //
        canvas.onmouseup = function(ev) {
            move = 0;
        }

        //
        //  Mouse movement
        //
        canvas.onmousemove = function(ev) {
            //convert to normalized device coordinates
            var mouseX3D = (ev.clientX / window.innerWidth) * 2 - 1;
            var mouseY3D = (ev.clientY / window.innerHeight) * 2 - 1;
            //console.log('x: ' + mouseX3D + 'y: ' + 'mouseY3D');

            if (move == 0) return;
            //  Update angles
            ph -= ev.clientX - x0;
            th += ev.clientY - y0;
            //  Store location
            x0 = ev.clientX;
            y0 = ev.clientY;
            //  Redisplay
            Display();
        }
    }
