var paletteArray = Object.keys(palette).map(function(key, i) {
  return [palette[key], key];
});

var dropdown = paletteArray.map(function(colorTuple, i) {
    var btn = document.createElement("DIV");
    btn.className = 'btn';
    var p = document.createElement("p");
    p.innerHTML = colorTuple[1];
    btn.appendChild(p);
    btn.setAttribute('width', '10px');
    btn.addEventListener("click", changeColor.bind(null, event, colorTuple[0]));
    return btn;
  });

  var dropdownList = document.getElementById('dropdown');

  for(var i = 0; i < dropdown.length; i++) {
    dropdownList.appendChild(dropdown[i]);
  }

function changeColor(n, colorName) {
  console.log(colorName);
  currentColor = colorName;
  console.log(currentColor);
}
