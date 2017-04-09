var paintify = function(arr, hex) {
  var newArr = arr.map(function(num, i) {
      switch (i % 3) {
        case 0:
          return red(hex)/255.0;
          break;
        case 1:
          return green(hex)/255.0;
          break;
        case 2:
          return blue(hex)/255.0;
          break;
        default:
          return 'FFFFFF';
          break;
      }
  });
  return newArr;
}
