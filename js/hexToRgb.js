function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b];
}

function red(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  return r;
}

function green(hex) {
  var bigint = parseInt(hex, 16);
  var g = (bigint >> 8) & 255;
  return g;
}

function blue(hex) {
  var bigint = parseInt(hex, 16);
  var b = bigint & 255;
  return b;
}
