//Class for storing data about each player
class Player {
  //constructor takes in their x and y position, the radius of the player and the velocity of the player (default 1)
  constructor(x, y, r, vel){
      this.x = x
      this.y = y
      this.r = r
      this.vel = vel
      this.mass = r * r * Math.PI
      this.rot = 1
      this.ang = -1
  }
}

var food = []
var foodRad = 12
var foodMass = foodRad*foodRad * Math.PI

var worldSize = 7000
var totalFood = 2000

var width = 1920
var height = 1080
var first = true

var offsetX = 0
var offsetY = 0
var scale = 1

var players = []
var client
var playerStartRad = 32

function createWorld() {
  width = $(window).width();
  height = $(window).height();
  for (var i = 0; i < totalFood; i++) {
    addFood()
    $("body").append("<h2 class=food id=" + i.toString() + "></h2>")
    $("#"+i.toString()).hide()
  }
  createPlayer();


}

function addFood(){
  var x = random(-worldSize, worldSize)
  var y = random(-worldSize, worldSize)
  food[food.length-1] = new Food(x, y, 16, '#ff0000')
}

function createPlayer(){
  $("body").append("<h1 class=player></h1>")
  client = new Player(0,0,playerStartRad,1,'#00A500')
  players[0] = client
  client.mass = Math.PI * client.r * client.r
  $(".player").css("margin-left", (width/2-client.r + 10).toString()+"px");
  $(".player").css("margin-top", (height/2-client.r + 10).toString()+"px");
}

function addPlayer(){
  players.push(new Player(0,0,playerStartRad,1,'#00A500'))
  players[players.length-1].mass = Math.PI * players[players.length-1].r * players[players.length-1].r
}

var foodUsed = 0

function draw(){
  if(client.r != Math.sqrt(client.mass / Math.PI)){
    client.r = Math.sqrt(client.mass / Math.PI)
    $(".player").css("width", (client.r*2).toString()+"px");
    $(".player").css("height", (client.r*2).toString()+"px");
    
    $(".player").css("margin-left", (width/2- client.r + 10).toString()+"px");
    $(".player").css("margin-top", (height/2- client.r + 10).toString()+"px");
  }
  for (var i = 0; i < food.length; i++) {
    var iString = i.toString()
    if (food[i].x + offsetX >= 0 - foodRad && food[i].x + offsetX <= width + foodRad){
      if (food[i].y + offsetY >= 0 - foodRad && food[i].y + offsetY <= height + foodRad){
        collision(food[i])
        
        $("#"+iString).css("margin-left", (food[i].x + offsetX).toString()+"px");
        $("#"+iString).css("margin-top", (food[i].y + offsetY).toString()+"px");
        $("#"+iString).show()
      } else if (food[i].y + offsetY >= 100 - foodRad && food[i].y + offsetY <= height+100 + foodRad){
        $("#"+iString).hide()
      }
    } else if (food[i].x + offsetX >= 100 - foodRad && food[i].x + offsetX <= width+100 + foodRad){
      if (food[i].y + offsetY >= 100 - foodRad && food[i].y + offsetY <= height+100 + foodRad){
        $("#"+iString).hide()
      }
    }

  }
}

setInterval(update, 16);
function update(){
  keyInput()

  scale = playerStartRad/(client.r)

  client.ang += client.rot * Math.PI / 180
  client.x += client.vel * Math.sin(client.ang)
  client.y += client.vel * Math.cos(client.ang)
  offsetX = client.x
  offsetY = client.y

  if(client.vel > 1){
    client.vel *= 0.98
  } else client.vel = 1

  if(food.length < totalFood) {
    for(var i = 0; i < 100; i++){
      if(food.length < totalFood) {
        var x = random(-worldSize, worldSize)
        var y = random(-worldSize, worldSize)
        food[food.length] = new Food(x, y, 16, '#ff0000')
      }
    }
  }

  

  if(players.length > 1){
    for(var i = 1; i < players.length; i++){

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

  update()
  draw()

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
    var x = random(-worldSize, worldSize)
    var y = random(-worldSize, worldSize)
    food[i] = new Food(x, y, 16, '#ff0000')
    client.mass += foodMass
  }
}