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
    var textureCoordinates = [];

    var vertexAttribArray;
    var vertexBuffer;
    var normalsBuffer;
    var indicesBuffer;
    var textureCoordinatesBuffer;

    var dim = 4;
    var scale = 1;
    var la = [0.1]; //ambient light
    var ld = [1.9]; //diffuse light
    var ls = [0.75]; //specular light

    //light position
    var x = [1.5];
    var y = [1.5];
    var z = [1.5];

    var positionLocation;
    var normalLocation;
    var textureLocation;

    var prog;

    function createAndSetupTexture(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
    }


      // create 2 textures and attach them to framebuffers.
    var textures = [];
    var framebuffers = [];
    for (var ii = 0; ii < 2; ++ii) {
      var texture = createAndSetupTexture(gl);
      textures.push(texture);

      // make the texture the same size as the image
      gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
          gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Create a framebuffer
      var fbo = gl.createFramebuffer();
      framebuffers.push(fbo);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Attach a texture to it.
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }



    // Define several convolution kernels
    var kernels = {
      normal: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
      ],
      gaussianBlur: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
      ],
      unsharpen: [
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
      ],
      emboss: [
         -2, -1,  0,
         -1,  1,  1,
          0,  1,  2
      ]
    };

    // List of effects to apply.
    var effectsToApply = [
      "gaussianBlur",
      "emboss",
      "gaussianBlur",
      "unsharpen"
    ];





    function initTextureFramebuffer() {
      Framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, Framebuffer);
      Framebuffer.width = 512;
      Framebuffer.height = 512;

      Texture = gl.createTexture();
        Framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, Framebuffer);
        Framebuffer.width = 512;
        Framebuffer.height = 512;
        Texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, Texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.getExtension('OES_texture_float');
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Framebuffer.width, Framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); //gl.Float third to last parameter was gl.RGBA
        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, Framebuffer.width, Framebuffer.height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, Texture, 0);
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
          vertices.push(0.0);
          vertices.push(i*2 - dim);
        }
      }
      return vertices;
    }

    function setUpNormals(dim) {
      var normals = [];
      for(var i = 0; i < dim + 1; i++) {
        for(var j = 0; j < dim + 1; j++) {
          normals.push(0.0);
          normals.push(1.0);
          normals.push(0.0);
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

    function setUpTextureCoordinates(dim) {
      var textureCoordinates = [];
      for(var i = 0; i < dim + 1; i++) {
        for(var j = 0; j < dim + 1; j++) {
          textureCoordinates.push(i/5.0);
          textureCoordinates.push(j/5.0);
        }
      }
      console.log(textureCoordinates);
      return textureCoordinates;
    }

    function setup(d) {
      normals = setUpNormals(d);
      vertices = setUpVertices(d);
      indices = setUpIndices(d);
      textureCoordinates = setUpTextureCoordinates(d);
    }

    function increase_dim() {
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(normalsBuffer);
      gl.deleteBuffer(indicesBuffer);
      dim = dim *2;
      setup(dim);
      render();
    }

    function decrease_dim() {
      dim = dim / 2;
      setup(dim);
      render();
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

      //create our framebuffer
      initTextureFramebuffer();

      //  Load Shader
      prog = CompileShaderProg(gl, "shader-vs", "shader-fs");

      //  Set program
      gl.useProgram(prog);


      positionLocation = gl.getAttribLocation(prog, "XYZ");
      normalLocation = gl.getAttribLocation(prog, "Normal");
      textureLocation = gl.getAttribLocation(prog, "TexCoord");

      // image = new Image();
      // image.crossOrigin = 'Anonymous';
      // image.src = "./IMG_4250.jpg";
      // image.onload = function() {
        render();
      // }
    }

    var gl, canvas;

    function render() {

        //  Set viewport to entire canvas
        gl.viewport(0, 0, canvas.width, canvas.height);

        //  Set projection
        var ProjectionMatrix = new CanvasMatrix4();

        ProjectionMatrix.perspective(100, asp, 0.001, 100);

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

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


        textureCoordinatesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);

        textureCoordinates = setUpTextureCoordinates(dim);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);


        // indicesBuffer.itemSize = 1;
        // indicesBuffer.numItems = 16;

        //  Set state to draw scene
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(r, g, b, 1);

        Display();


        setInterval(function(){
          Display();
        }, 50);


        function Display() {

          // gl.bindFramebuffer(gl.FRAMEBUFFER, Framebuffer);
          //
          // Draw();
          //
          // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

          // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
          // gl.viewport(0, 0, Framebuffer.width, Framebuffer.height);

          //  Clear the screen and Z buffer
          // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
          var p = Math.sin(Math.sin(t + 2.0) + 2.0) + 0.25;

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

          gl.enableVertexAttribArray(textureLocation);
          gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
          gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, 0, 0);



          //  Set projection and modelview matrixes
          gl.uniformMatrix4fv(gl.getUniformLocation(prog, "ProjectionMatrix"), false, new Float32Array(ProjectionMatrix.getAsArray()));
          gl.uniformMatrix4fv(gl.getUniformLocation(prog, "ModelViewMatrix"), false, new Float32Array(ModelViewMatrix.getAsArray()));
          gl.uniformMatrix4fv(gl.getUniformLocation(prog, "NormalMatrix"), false, new Float32Array(ModelViewMatrix.getAsArray()));



          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

          const v = dim*2 + 2;
          for(var i = 0; i < dim; i++) {
            gl.drawElements(gl.TRIANGLE_STRIP, v, gl.UNSIGNED_SHORT, i*(v*2));
          }

          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, Texture);
          gl.uniform1i(prog.samplerUniform, 0);
        }

        function Draw() {

            // gl.viewport(0, 0, Framebuffer.width, Framebuffer.height);
            // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
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
            var p = Math.sin(Math.sin(t + 2.0) + 2.0) + 0.25;

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

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);



            const v = dim*2 + 2;
            for(var i = 0; i < dim; i++) {
              gl.drawElements(gl.TRIANGLE_STRIP, v, gl.UNSIGNED_SHORT, i*(v*2));
            }

            gl.bindTexture(gl.TEXTURE_2D, Texture);
            // gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

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
