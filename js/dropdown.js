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
  render();
}


function updateTerrainHeight(newVal) {
  terrainHeight = newVal;
  render();
}

function updateLightX(newVal) {
  x = newVal;
  render();
}

function updateLightY(newVal) {
  y = newVal;
  render();
}

function updateLightZ(newVal) {
  z = newVal;
  render();
}

function updateFrac(newVal) {
  frac = newVal;
  render();
}


function set_blur() {
  if(blur ===  0.0) {
    blur = 1.0;
  } else {
    blur = 0.0;
  }
  render();
}


function set_wave() {
  if(wave ===  0.0) {
    wave = 1.0;
  } else {
    wave = 0.0;
  }
  render();
}



function set_atmos() {
  if(atmos ===  0.0) {
    atmos = 1.0;
  } else {
    atmos = 0.0;
  }
  console.log(atmos);
  render();
}
