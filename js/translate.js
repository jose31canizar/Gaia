var translateX = function(arr, x) {
  var newArr = arr.map(function(value, i) {
    switch (i % 3) {
      case 0:
        return value - x;
        break;
      case 1:
        return value;
        break;
      case 2:
        return value;
        break;
      default:
        return value;
        break;
    }
  });
  return newArr;
}

var translateY = function(arr, x) {
  var newArr = arr.map(function(value, i) {
    switch (i % 3) {
      case 0:
        return value;
        break;
      case 1:
        return value - x;
        break;
      case 2:
        return value;
        break;
      default:
        return value;
        break;
    }
  });
  return newArr;
}

var translateZ = function(arr, x) {
  var newArr = arr.map(function(value, i) {
    switch (i % 3) {
      case 0:
        return value;
        break;
      case 1:
        return value;
        break;
      case 2:
        return value - x;
        break;
      default:
        return value;
        break;
    }
  });
  return newArr;
}
