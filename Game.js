class Player {
  constructor(x, y, r, vel, col){
      this.x = x
      this.y = y
      this.r = r
      this.vel = vel
      this.col = col
      this.mass = r * r * Math.PI
      this.rot = 1
      this.ang = -1
  }
}

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

var players = []
var client
var playerStartRad = 32

function createWorld() {
  for (var i = 0; i < 100000; i++) {
    var x = random(-20000, 20000)
    var y = random(-20000, 20000)
    food[i] = new Food(x, y, 16, '#ff0000')
  }
  ctx.canvas.width  = width;
  ctx.canvas.height = height;
  createPlayer();
}

function createPlayer(){
  client = new Player(0,0,playerStartRad,1,'#00A500')
  players[0] = client
  client.mass = Math.PI * client.r * client.r
}

function addPlayer(){
  players.push(new Player(0,0,playerStartRad,1,'#00A500'))
  players[players.length-1].mass = Math.PI * players[players.length-1].r * players[players.length-1].r
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  for (var i = 0; i < food.length; i++) {
    if (food[i].x + offsetX >= 0 - foodRad && food[i].x + offsetX <= width + foodRad){
      if (food[i].y + offsetY >= 0 - foodRad && food[i].y + offsetY <= height + foodRad){
        collision(food[i])

        ctx.beginPath()
        ctx.arc(food[i].x + offsetX, food[i].y + offsetY, foodRad, 0, 2 * Math.PI)  
        ctx.fillStyle = food[i].col;
        ctx.fill()
        ctx.closePath()
      }
    }

  }
  ctx.beginPath()
  ctx.arc(width/2,height / 2, client.r, 0, 2 * Math.PI)
  ctx.fillStyle = '#00A500';
  ctx.fill()
  ctx.closePath()

  for(var i = 1; i < players.length; i++){
    ctx.beginPath()
    ctx.arc(players[i].x+offsetX,players[i].y+offsetY, players[i].r, 0, 2 * Math.PI)
    ctx.fillStyle = '#00A500';
    ctx.fill()
    ctx.closePath()
  }

}

setInterval(update, 16);
function update(){
  keyInput()

  client.r = Math.sqrt(client.mass / Math.PI)

  scale = playerStartRad/(client.r)

  client.ang += client.rot * Math.PI / 180
  client.x += client.vel * Math.sin(client.ang)
  client.y += client.vel * Math.cos(client.ang)
  offsetX = client.x
  offsetY = client.y

  if(client.vel > 1){
    client.vel *= 0.98
  } else client.vel = 1

  if(food.length < 100000) {
    for(var i = food.length; i < 100000; i++){
      var x = random(-20000, 20000)
      var y = random(-20000, 20000)
      food[food.length] = new Food(x, y, 16, '#ff0000')
    }
  }
}

var boostToggled = false

function keyInput(){
  document.addEventListener('keydown', function(event) {
    event.preventDefault()
    if(event.key === 'd') {
      client.rot = -1
    } else if(event.key === 'a') {
      client.rot = 1
    }
    if (event.key === ' '){
      if (client.mass > 3000){
        if(!boostToggled){
          addPlayer()
          alert(players.length)
          client.vel += 7
          client.mass -= client.mass/4
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
    createWorld()
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
  if(dist < client.r+foodRad){
    var i = food.indexOf(currentFood)
    food.splice(i, 1)
    client.mass += foodMass
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
    //Styling
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

