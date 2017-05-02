var vertices = [
    1.0,  1.0,  1.0,
   -1.0, -1.0,  1.0,
   -1.0,  1.0, -1.0,
    1.0, -1.0, -1.0
];

var indices = [
  0, 1, 2, 3, 0, 1
];

gl.drawElements(gl.TRIANGLE_STRIP, 6, gl.UNSIGNED_SHORT, 0);
