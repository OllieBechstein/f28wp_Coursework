
var canvas = document.getElementById("gameCanvas")
var ctx = canvas.getContext("2d")

var food = []
var foodRad = 12
var foodMass = foodRad*foodRad * Math.PI

var width = 1280
var height = 720
var first = true

var offsetX = 0
var offsetY = 0
var scale = 1

var playerVel = 1
var playerRotate = 1
var playerAngle = 0
var playerRad = 32
var playerStartRad = 32
var playerMass

function setup() {
  for (var i = 0; i < 100000; i++) {
    var x = random(-20000, 20000)
    var y = random(-20000, 20000)
    food[i] = new Food(x, y, 16)
  }
  playerMass = Math.PI * playerRad * playerRad
  ctx.canvas.width  = width;
  ctx.canvas.height = height;
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  for (var i = food.length - 1; i >= 0; i--) {
    if (food[i].x + offsetX >= 0 - foodRad && food[i].x + offsetX <= width + foodRad){
      if (food[i].y + offsetY >= 0 - foodRad && food[i].y + offsetY <= height + foodRad){
        collision(food[i])

        ctx.beginPath()
        ctx.arc(food[i].x + offsetX, food[i].y + offsetY, foodRad, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
      }
    }

  }
  ctx.beginPath()
  ctx.arc(width/2,height / 2, playerRad, 0, 2 * Math.PI)
  ctx.fill()
  ctx.closePath()

}

setInterval(update, 16);
function update(){
  keyInput()

  playerRad = Math.sqrt(playerMass / Math.PI)

  scale = playerStartRad/(playerRad)

  playerAngle += playerRotate * Math.PI / 180
  offsetX += playerVel * Math.sin(playerAngle)
  offsetY += playerVel * Math.cos(playerAngle)

  if(playerVel > 1){
    playerVel *= 0.98
  } else playerVel = 1

  if(food.length < 100000) {
    for(var i = food.length; i < 100000; i++){
      var x = random(-20000, 20000)
      var y = random(-20000, 20000)
      food[food.length] = new Food(x, y, 16)
    }
  }
}

var boostToggled = false

function keyInput(){
  document.addEventListener('keydown', function(event) {
    event.preventDefault()
    if(event.key === 'd') {
      playerRotate = -1
    } else if(event.key === 'a') {
      playerRotate = 1
    }
    if (playerMass > 3000){
      if (event.key === ' '){
        if(!boostToggled){
          playerVel += 7
          playerMass -= playerMass/4
          boostToggled = true
        }
      }
    }
  })
  document.addEventListener('keyup', function(event) {
    event.preventDefault()
    if (event.key === ' '){
      boostToggled = false
    }
  })

}

function loop(timestamp) {
  if(first){  
    setup()
    first = false
  }

  draw()
  update()

  window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)


function random(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function collision(currentFood) {
  var dist = Math.sqrt((currentFood.x+offsetX - width/2)*(currentFood.x+offsetX - width/2) + (currentFood.y+offsetY - height/2)*(currentFood.y+offsetY - height/2))
  if(dist < playerRad+foodRad){
    var i = food.indexOf(currentFood)
    food.splice(i, 1)
    playerMass += foodMass
  }
}

// experimenting with using DOM to draw
function generateScreen() {
  // get the reference for the body
  var body = document.getElementsByTagName("body")[0];

  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
  var tblBody = document.createElement("tbody");
  // creating all cells
  for (var i = 0; i < 140; i++) {
    // creates a table row
    var row = document.createElement("tr");
    row.style.letterSpacing = "-4px";
    row.style.borderSpacing = "-4px";
    row.style.lineHeight = "0"
    row.style.padding = "0px"

    for (var j = 0; j < 240; j++) {
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      var cell = document.createElement("td");
      var cellText = document.createTextNode(".");
      cell.appendChild(cellText);
      row.appendChild(cell);
    }

    // add the row to the end of the table body
    tblBody.appendChild(row);
  }

  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <body>
  body.appendChild(tbl);
  // sets the border attribute of tbl to 0;
  tbl.setAttribute("border", "0");
}