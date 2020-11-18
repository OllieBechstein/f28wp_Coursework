
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

var playerVel = 0
var playerRotate = 1
var playerAngle = 0
var playerRad = 32
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

function update(){
  keyInput()

  playerRad = Math.sqrt(playerMass / Math.PI)
  playerAngle += playerRotate * Math.PI / 180
  offsetX += 2 * Math.sin(playerAngle)
  offsetY += 2 * Math.cos(playerAngle)

  if(food.length < 100000) {
    for(var i = food.length; i < 100000; i++){
      var x = random(-20000, 20000)
      var y = random(-20000, 20000)
      food[food.length] = new Food(x, y, 16)
    }
  }
}

function keyInput(){
  document.addEventListener('keydown', function(event) {
    if(event.key === 'd') {
      playerRotate = -1
    }else if(event.key === 'a') {
      playerRotate = 1
    }
  })

}

function loop(timestamp) {
  if(first){  
    setup()
    first = false
  }
  var progress = timestamp - lastRender

  draw()
  update()

  lastRender = timestamp
  window.requestAnimationFrame(loop)
}
var lastRender = 0
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
