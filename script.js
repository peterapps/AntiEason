// Global variables
var canvas, ctx;
var width = 800;
var height = 500;
var limit = 200;

// Game variables
var path, dot;
var cursor = {x: 0, y: 0};
var pressed = {};
var targetKey = 0;
var iter = 0;
var score = 0;

// Helper functions
function drawCircle(x, y, r){
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

var dirx = 0;
var diry = 0;

function generateCoords(){
  if (iter % 10 == 0 && Math.random() > 0.5){
    dirx = 1.2 * (2*Math.random() - 1);
    diry = 1.2 * (2*Math.random() - 1);
  }
  dot.x += dirx;
  dot.y += diry;
  if (dot.x < dot.r) dot.x = dot.r;
  if (dot.x > width - dot.r) dot.x = width - dot.r;
  if (dot.y < dot.r) dot.y = dot.r;
  if (dot.y > height - dot.r) dot.y = height - dot.r;
}

function generateKey(){
  targetKey = Math.floor(Math.random() * 26) + 65;
}

function getCursor(event){
	var rect = canvas.getBoundingClientRect();
	var x = (event.clientX - rect.left) * canvas.width / canvas.offsetWidth;
	var y = (event.clientY - rect.top) * canvas.height / canvas.offsetHeight;
	cursor = {x: Math.round(x), y: Math.round(y)};
}

function getKey(event){
  pressed[event.keyCode] = true;
}

function inside(){
  var good = false;
  var index = path.length - 10;
  if (index < 0) index = 0;
  for (var i = index; i < path.length; i++){
    var dx = cursor.x - path[i].x;
    var dy = cursor.y - path[i].y;
    if (Math.sqrt(dx*dx + dy*dy) <= dot.r) good = true;
  }
  return good;
}

// Game setup
window.addEventListener("load", function(){
  canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext("2d");
  startScreen();
}, false);

function startScreen(){
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Move your cursor over the dot to begin", width/2, height/4);

  dot = {x: width/2, y: height/2, r: 25};
  path = [];
  path.push({x: dot.x, y: dot.y});

  ctx.fillStyle = "red";
  drawCircle(dot.x, dot.y, dot.r);
  window.addEventListener("mousemove", checkStart, false);
}

function checkStart(event){
  getCursor(event);
  var dx = cursor.x - dot.x;
  var dy = cursor.y - dot.y;
  var dist = Math.sqrt(dx*dx + dy*dy);
  if (dist < dot.r/2){
    window.removeEventListener("mousemove", checkStart, false);
    startGame();
  }
}

function startGame(){
  window.addEventListener("mousemove", getCursor, false);
  window.addEventListener("keydown", getKey, false);
  generateKey();
  requestAnimationFrame(loop);
}

function loop(){
  iter++;
  ctx.clearRect(0, 0, width, height);
  generateCoords();
  // Generate key and check if they pressed the old one
  var ontime = true;
  if (iter % 120 == 0){
    ontime = false;
    if (pressed[targetKey]) ontime = true;
    pressed = {};
    generateKey();
    score += 10;
  }
  path.push({x: dot.x, y: dot.y});
  // Delete old points
  while (path.length > limit){
    path.shift();
  }
  // Draw all the previous dots
  for (var i = 0; i < path.length - 1; i += 10){
    var x = path[i].x;
    var y = path[i].y;
    var opacity = (i + 1) / path.length;
    opacity = Math.pow(opacity, 4);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "maroon";
    drawCircle(x, y, dot.r);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "red";
  drawCircle(dot.x, dot.y, dot.r);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(score, 5, 5);

  ctx.font = "50px Arial";
  ctx.textAlign = "right";
  if (pressed[targetKey]) ctx.fillStyle = "#0F0";
  ctx.fillText(String.fromCharCode(targetKey), width - 5, 5);

  if (inside() && ontime){
    requestAnimationFrame(loop);
  } else if (!ontime){
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "30px Arial";
    ctx.fillText("You lose.", width/2, height/4);
    ctx.fillText("You did not press the key on time", width/2, height/2);
  } else {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "30px Arial";
    ctx.fillText("You lose.", width/2, height/4);
    ctx.fillText("Your cursor went outside the dot", width/2, height/2);
  }
}
