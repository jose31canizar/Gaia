    var currentColor = palette.red;

    var r = 0.95;
    var g = 0.95;
    var b = 0.94;

    var Framebuffer;
    var Texture;

    //  Mouse control variables
    var x0 = y0 = move = 0;
    //  Rotation angles
    var th = ph = 15;
    //  Draw scene the first time

    var asp = window.innerWidth/window.innerHeight;

    var image;

    //
    //  Compile a shader
    //

    var normals = [];
    var vertices = [];
    var indices = [];

    var vertexAttribArray;
    var vertexBuffer;
    var normalsBuffer;
    var indicesBuffer;

    var dim = 4;
    var scale = 1;
    var la = [0.9]; //ambient light
    var ld = [0.5]; //diffuse light
    var ls = [0.5]; //specular light

    var x = [0.5];
    var y = [0.5];
    var z = [0.5];

    var positionLocation;
    var normalLocation;

    var prog;


    function initTextureFramebuffer() {
      Framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, Framebuffer);
      Framebuffer.width = 512;
      Framebuffer.height = 512;

      Texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, Texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Framebuffer.width, Framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      var renderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    function setUpVertices(dim) {
      var vertices = [];
      for(var i = 0; i < dim + 1; i++) {
        for(var j = 0; j < dim + 1; j++) {
          vertices.push(j*2 - dim);
          vertices.push(0);
          vertices.push(i*2 - dim);
        }
      }
      return vertices;
    }

    function setUpNormals(dim) {
      var normals = [];
      for(var i = 0; i < dim + 1; i++) {
        for(var j = 0; j < dim + 1; j++) {
          normals.push(0);
          normals.push(1.0);
          normals.push(0);
        }
      }
      return normals;
    }

    function setUpIndices(dim) {
      var indices= [];
      for(var i = 0; i < dim; i++) {
        const inc = i*(dim + 1);
        for(var j = 0; j < dim + 1; j++) {
          indices.push(inc + dim + j + 1);
          indices.push(inc + j);
        }
      }
      return indices;
    }

    function setup(d) {
      normals = setUpNormals(d);
      vertices = setUpVertices(d);
      indices = setUpIndices(d);

    }

    function increase_dim() {
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(normalsBuffer);
      gl.deleteBuffer(indicesBuffer);
      dim = dim *2;
      setup(dim);
      render();
      // console.log('changed to ' + dim);
    }

    function decrease_dim() {
      dim = dim / 2;
      setup(dim);
      render();
      // console.log('changed to ' + dim);
    }

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


    function main() {

      //  Set canvas
      canvas = document.getElementById("canvas");
      //  Select canvas size
      var size = Math.min(window.innerWidth, window.innerHeight) - 10;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

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
      prog = CompileShaderProg(gl, "shader-vs", "shader-fs");

      //  Set program
      gl.useProgram(prog);


      positionLocation = gl.getAttribLocation(prog, "XYZ");
      normalLocation = gl.getAttribLocation(prog, "Normals");

      image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src = "./IMG_4250.jpg";
      image.onload = function() {
        render();
      }
    }

    function setRectangle(gl, x, y, width, height) {
      var x1 = x;
      var x2 = x + width;
      var y1 = y;
      var y2 = y + height;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
         x1, y1,
         x2, y1,
         x1, y2,
         x1, y2,
         x2, y1,
         x2, y2,
      ]), gl.STATIC_DRAW);
    }

    var gl, canvas;

    function render() {

        // console.log('rendering!');

        //  Set projection
        var ProjectionMatrix = new CanvasMatrix4();

        ProjectionMatrix.perspective(100, asp, 0.001, 100);

        // var texcoordLocation = gl.getAttribLocation(prog, "a_texCoord");


          // // Set a rectangle the same size as the image.
          // setRectangle(gl, 0, 0, image.width, image.height);
          //
          // // provide texture coordinates for the rectangle.
          // var texcoordBuffer = gl.createBuffer();
          // gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          //     0.0,  0.0,
          //     1.0,  0.0,
          //     0.0,  1.0,
          //     0.0,  1.0,
          //     1.0,  0.0,
          //     1.0,  1.0,
          // ]), gl.STATIC_DRAW);
          //
          // // Create a texture.
          // var texture = gl.createTexture();
          // gl.bindTexture(gl.TEXTURE_2D, texture);
          //
          // // Set the parameters so we can render any size image.
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          //
          // // Upload the image into the texture.
          // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          //
          // // lookup uniforms
          // var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
          //
          // gl.enableVertexAttribArray(positionLocation);
          // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          //
          // var size = 2;          // 2 components per iteration
          // var type = gl.FLOAT;   // the data is 32bit floats
          // var normalize = false; // don't normalize the data
          // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
          // var offset = 0;        // start at the beginning of the buffer
          // gl.vertexAttribPointer(
          //             positionLocation, size, type, normalize, stride, offset)
          //
          // // Turn on the teccord attribute
          // gl.enableVertexAttribArray(texcoordLocation);
          //
          // // Bind the position buffer.
          // gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          //
          // // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
          // var size = 2;          // 2 components per iteration
          // var type = gl.FLOAT;   // the data is 32bit floats
          // var normalize = false; // don't normalize the data
          // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
          // var offset = 0;        // start at the beginning of the buffer
          // gl.vertexAttribPointer(
          //     texcoordLocation, size, type, normalize, stride, offset)
          //
          // // set the resolution
          // gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
          //
          // // Draw the rectangle.
          // var primitiveType = gl.TRIANGLES;
          // var offset = 0;
          // var count = 6;
          // gl.drawArrays(primitiveType, offset, count);


        normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);

        normals = setUpNormals(dim);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        vertices = setUpVertices(dim);



        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

        indices = setUpIndices(dim);

        // console.log('indices: ' + indices);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        // indicesBuffer.itemSize = 1;
        // indicesBuffer.numItems = 16;

        //  Set state to draw scene
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(r, g, b, 1);

        Display();


        setInterval(function(){
          Display();
        }, 200);


        //
        //  Display the scene
        //
        function Display() {

            gl.bindFramebuffer(gl.FRAMEBUFFER, Framebuffer);

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

            var t = Date.now() /1000; //seconds in decimal
            var p = t;
            // console.log(p);

            gl.uniform1f(gl.getUniformLocation(prog, "time"), new Float32Array([p]));

            gl.uniform1f(gl.getUniformLocation(prog, "lx"), new Float32Array(x));
            gl.uniform1f(gl.getUniformLocation(prog, "ly"), new Float32Array(y));
            gl.uniform1f(gl.getUniformLocation(prog, "lz"), new Float32Array(z));

            gl.uniform1f(gl.getUniformLocation(prog, "LightAmbient"), new Float32Array(la));
            gl.uniform1f(gl.getUniformLocation(prog, "LightDiffuse"), new Float32Array(ld));
            gl.uniform1f(gl.getUniformLocation(prog, "LightSpecular"), new Float32Array(ls));

            gl.uniform1f(gl.getUniformLocation(prog, "Red"), new Float32Array(r));
            gl.uniform1f(gl.getUniformLocation(prog, "Green"), new Float32Array(g));
            gl.uniform1f(gl.getUniformLocation(prog, "Blue"), new Float32Array(b));

            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(normalLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
            gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);


            //  Set projection and modelview matrixes
            gl.uniformMatrix4fv(gl.getUniformLocation(prog, "ProjectionMatrix"), false, new Float32Array(ProjectionMatrix.getAsArray()));
            gl.uniformMatrix4fv(gl.getUniformLocation(prog, "ModelViewMatrix"), false, new Float32Array(ModelViewMatrix.getAsArray()));
            gl.uniformMatrix4fv(gl.getUniformLocation(prog, "NormalMatrix"), false, new Float32Array(ModelViewMatrix.getAsArray()));

            // var ext = gl.getExtension('OES_element_index_uint');

            //  Disable vertex arrays
            gl.disableVertexAttribArray(normalLocation);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

            const v = dim*2 + 2;
            for(var i = 0; i < dim; i++) {
              gl.drawElements(gl.TRIANGLE_STRIP, v, gl.UNSIGNED_SHORT, i*(v*2));
            }


            gl.disableVertexAttribArray(positionLocation);


            //  Flush
            gl.flush ();
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
