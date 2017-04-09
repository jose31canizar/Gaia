var paletteArray = Object.keys(palette).map(function(key, i) {
  return [palette[key], key];
});

var dropdown = paletteArray.map(function(colorTuple, i) {
    var btn = document.createElement("BUTTON");
    btn.innerHTML = colorTuple[1];
    btn.setAttribute('width', '10px');
    btn.addEventListener("click", changeColor.bind(null, event, colorTuple[0]));
    return btn;
  });

  var drpdwn = document.getElementById('dropdown');

  for(var i = 0; i < dropdown.length; i++) {
    drpdwn.appendChild(dropdown[i]);
  }

function changeColor(n, colorName) {
  console.log(colorName);
  currentColor = colorName;
  console.log(currentColor);
}
