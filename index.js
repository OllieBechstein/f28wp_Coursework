//Class for storing data about each player
class Player {
  //constructor takes in their x and y position, the radius of the player
  constructor(x, y, r, id){
    //Set the classes x, y and radius to the values taken in from the constructor
    this.x = x
    this.y = y
    this.r = r
    //Set a unique ID to be recognised by the server
    this.id = id
    //Set the default velocity of the player and the current velocity (upon creation these are the same)
    this.defaultVel = 4
    this.vel = this.defaultVel
    //Set the mass of the player to PI*r^2
    this.mass = r * r * Math.PI
    //Creates a variable to control the direction of the player (-vel is right and vel is left)
    this.dir = this.vel
    //Create a variable to store the actual angle the player is facing (Using radians/degrees)
    this.ang = -1
    this.boostToggled = false
    this.removed = false
  }
}

//Class for storing data about each piece of food
class Food {
  //Construcor takes in the x and y position of the food, as well as its radius
  constructor(x, y, r){
    this.x = x
    this.y = y
    this.r = r
    this.removed = false
  }
}

//Create an array to be used to store food objects
var food = []
//The radius of each food object
const foodRad = 12
//The mass of each food object (PI*r^2)
const foodMass = foodRad*foodRad * Math.PI

//Store the size of the level (from -worldSzie to worldSize in both the X and Y directions)
const worldSize = 7000
//Store the total ammount of food on the level
const totalFood = 4000

//The width and height of the game screen (1920 and 1080 are placeholder values)
var width = 1920
var height = 1080
//A value used to check if the game is on its first frame
var first = true

//Used for positioning the camera (offsetting the x and y of the world)
var offsetX = 0
var offsetY = 0
var wait = 0
const waitTime = 10

const deathWindowWidth = 400;
const deathWindowHeight = 300;

//Creates an array to store each player on the server
var players = []
//Used to hold and update the client player
var client
//The starting radius of each player
const playerStartRad = 32
//The mass the player must be greater than to be able to use the boost mechanic
const boostThreshold = 3000

/*var xhr = new XMLHttpRequest();
  xhr.open("GET", "../food.json", false);
  xhr.onload = ajaxCallback; 
  xhr.send(); 
  function ajaxCallback(event){ 
    foodOBJs = JSON.parse(event.target.responseText)
  }*/

//Start the game for a player
function startClient(){
  //Loop for each piece of food that should be in the game
  for (var i = 0; i < food.length; i++) {
    //Create an element in the body of the HTML code to represent this piece of food, with a unique ID
    $("body").append("<h2 class=food id=" + i.toString() + "></h2>")
    //Hide this element, using the unique ID
    $("#"+i.toString()).hide()
  }
  //Loop for each piece of food that should be in the game
  for (var i = 0; i < players.length; i++) {
    //Create an element in the body of the HTML code to represent other players, with a unique id
    $("body").append("<h1 class=player id=" + players[i].id.toString() + "></h1>")
    //Hide this element, using the unique ID
    $(".player,#"+i.toString()).hide()
  }
  buildDead()
  //Set the width and height to the width and height of the window
  width = $(window).width();
  height = $(window).height();
  //Create the player to represent the client
  createPlayer();
}

//Create the client player
function createPlayer(){
  //Set the client to be a new player at the center of the world (0, 0) with the default radius
  client = new Player(0,0,playerStartRad, players.length)
  $("body").append("<p class=mass>Current Mass</p>")
  $(".mass").css("margin-left", (32).toString()+"px")
  $(".mass").css("margin-top", (32).toString()+"px")
  $(".mass").show()

  $("body").append("<h1 class=player id=" + client.id.toString() + "></h1>")
  //Hide this element, using the unique ID
  $(".player,#"+client.id.toString()).hide()
  //Add the client to the list of players, at the end of the list
  players[client.id] = client

}

//Set the interval of the update function to run every 16ms (approx. 60 times per second)
setInterval(updateClient, 16);
//Update function 
function updateClient(){
  //If the game has just been launched (if its the first frame)
  if(wait == waitTime){  
    //Start the client
    startClient()
    //Once this has happened it is no longer the first frame, dont run it again
  } else if(wait > waitTime){
    if(!client.removed){
      //Handle key input from the client
      keyInput()
      //If the clients radius is not accurate (based off of its current mass)
      if(client.r != Math.sqrt(client.mass / Math.PI)){
        //Set it to be the correct value using a formula derived from the radius formula
        client.r = Math.sqrt(client.mass / Math.PI)
        //Adjust the viewport scale
        scale = playerStartRad/(client.r)
      }
      //HANDLE MOVEMENT
      //The angle of the players movement can be derived from the direction it moves in
      client.ang += client.dir * Math.PI / 180
      //Update the x position using a sine graph and y position using a cosine graph (multiplying by velocity)
      client.x += client.vel * Math.sin(client.ang)
      client.y += client.vel * Math.cos(client.ang)
      //Set the screens offset to be equal to the clients position so that the correct part of the level is in the viewport

      //If the client is going above the default speed (using boost)
      if(client.vel > client.defaultVel){
        //Decrease the players speed by 0.02x its total
        client.vel *= 0.98
      //Otherwise make sure the clients velocity is set to the default (not below, as sometimes the above code will make it lower than it should be)
      } else client.vel = client.defaultVel
    }
  }
  wait++
}
//Draw the game to the clients screen
function draw(){
  if(wait > waitTime){ 
    offsetX = -client.x + width/2
    offsetY = -client.y + height/2
    //Loop through all the food in the food array
    for (var i = 0; i < food.length; i++) {
      //Check to see if the food is within the viewport of the game
      if(!food[i].removed){
        if (food[i].x + offsetX >= 0 - foodRad && food[i].x + offsetX <= width + foodRad){
          if (food[i].y + offsetY >= 0 - foodRad && food[i].y + offsetY <= height + foodRad){
            //If it is, check for collision with the player
            collision(food[i])
            //Move where its being drawn on the screen to correspond with its position in the viewport (Again using CSS's margin as the offset)
            $("#"+i).css("margin-left", (food[i].x + offsetX).toString()+"px");
            $("#"+i).css("margin-top", (food[i].y + offsetY).toString()+"px");
            //Show the food
            $("#"+i).show()
          //If the food is slightly offscreen (vertically), hide it
          } else if (food[i].y + offsetY >= -100 - foodRad && food[i].y + offsetY <= height+100 + foodRad){
            $("#"+i).hide()
          }
        //If the food is slightly offscreen (horizontally), hide it
        } else if (food[i].x + offsetX >= -100 - foodRad && food[i].x + offsetX <= width+100 + foodRad){
            $("#"+i).hide()
        }
      } else {
        $("#"+i).hide()
      }
    }
    for(var i = 0; i < players.length; i++){
      if(!players[i].removed){
        //Move where its being drawn on the screen to correspond with its position in the viewport (Again using CSS's margin as the offset)
        $(".player,#"+i).css("margin-left", (players[i].x + offsetX - players[i].r).toString()+"px");
        $(".player,#"+i).css("margin-top", (players[i].y + offsetY - players[i].r).toString()+"px");
        $(".player,#"+i).css("width", (players[i].r*2).toString()+"px");
        $(".player,#"+i).css("height", (players[i].r*2).toString()+"px");
        $(".player,#"+i).css("background-color", "darkblue")
        //Show the player
        $(".player,#"+i).show()
      } else {
        $(".player,#"+i).hide()
      }
    }

    if(client.removed){
      displayDead()
    } else {
      hideDead()
      $(".mass").text("Current Mass: " + Math.round(client.mass/100));
    }
  }
}

function buildDead(){
  $("body").append("<div class=deathScreen></div>")
  $(".deathScreen").css("margin-left", (width/2 - deathWindowWidth/4).toString()+"px")
  $(".deathScreen").css("margin-top", (height/2 - deathWindowHeight).toString()+"px")
  $(".deathScreen").hide()
}

function displayDead(){
  $(".deathScreen").show()
}

function hideDead(){
  $(".deathScreen").hide()
}

//Handle input from the clients keyboard
function keyInput(){
  if(!client.removed){
    //Check for a key being pressed down
    document.addEventListener('keydown', function(event) {
      //If d is pressed
      if(event.key === 'd') {
        //Set the direction to -defaultVel, (Move right at the default velocity)
        client.dir = -client.defaultVel
      //If a is pressed
      } else if(event.key === 'a') {
        //Set the direction to defaultVel, (Move left at the default velocity)
        client.dir = client.defaultVel
      }
      //If space is being pressed
      if (event.key === ' '){
        //If the mass of the client is greater than the boost threshold
        if (client.mass > boostThreshold){
          if(!client.boostToggled){
            client.vel += 12
            client.mass -= client.mass/4
            client.boostToggled = true
          }
        }
      }
    })
  }
  window.addEventListener("wheel", function(e){e.preventDefault();}, {passive: false} );
  //Check for a key being released
  document.addEventListener('keyup', function(event) {
    //If space has been released
    if (event.key === ' '){
      //The player is no longer boosting, so set boostToggled to false
      client.boostToggled = false
    }
  })
}

//GAME LOOP
function loop(timestamp) {
  

  //Draw the game
  draw()

  //Run the loop the next time the window is ready to update (Runs until the game is closed)
  window.requestAnimationFrame(loop)
}
//Run the loop when the window is ready to update
window.requestAnimationFrame(loop)

//RANDOM NUMBER GENERATOR
function random(min, max) {
  //Return a floored value using the random function from the Math class, between the max and min value
  return Math.floor(Math.random() * (max - min) ) + min;
}

//HANDLE COLLISION
//Pass in the food you want to check
function collision(currentFood) {
  if(!client.removed){
    //Use distance formula to see how far away the player is from the food
    var dist = Math.sqrt((currentFood.x - (client.x - 16))*(currentFood.x - (client.x - 16)) + (currentFood.y-(client.y - 16))*(currentFood.y-(client.y - 16)))
    //If the food is within the radius of the player
    if(dist < client.r + foodRad){
      //Get the index of this piece of food in the array
      var i = food.indexOf(currentFood)
      //Set new x and y 
      socket.emit('eaten', i);
      food[i].removed = true
      //Add the mass of this piece of food to the clients mass
      client.mass += foodMass
    }
  }
}
  


const io = require('socket.io-client');

// socket.io connection setup
const socket = io(`ws://${window.location.host}`);
const connectPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });
});

// Your socket id
socket.on('player-number', num => {
    console.log(`your socket id is ${num}`);
})

//Set the interval of the updateServer function to run every 16ms (approx. 60 times per second)
setInterval(updateServer, 16)
function updateServer() {

  //sendPosition to server
  if(wait > waitTime+10){
    socket.emit('playerData', {id: client.id, x: client.x, y: client.y, r: client.r});
    socket.emit('shouldRemove')
  }
}

socket.on('levelData', (foo, pla) => {
  for(var i = 0; i < totalFood; i++){
    food.push(new Food(foo[i].x, foo[i].y, foodRad))
  }
  for(var i in pla){
    players[pla[i].id] = new Player(pla[i].x, pla[i].y, pla[i].r, pla[i].id)
  }
})

socket.on('playerRemoved', (removed, remover) => {
  players[removed].removed = true
  console.log(removed)
  console.log(client.id)
  //players[remover].r += players[removed].r
  if(removed == client.id){
    client.removed = true
  } else if(remover == client.id){
    client.r += players[removed].r
  }
})

socket.on('playerData', (dat) => {
  var found = false
  for(var i = 0; i < players.length; i++){
    if(players[i].id == dat.id){
      players[i].x = dat.x
      players[i].y = dat.y
      players[i].r = dat.r
      players[i].removed = dat.removed
      players[i].mass = dat.r*dat.r*Math.PI
      found = true
    }
  }

  if(!found){
    players.push(new Player(dat.x, dat.y, dat.r, dat.id))
    $("body").append("<h1 class=player id=" + players.length-1 + "></h1>")
    $(".player,#"+(players.length-1).toString()).hide()
  }
})

socket.on('foodAdded', (dat) => {
  food[dat.i].x = dat.x
  food[dat.i].y = dat.y
  food[dat.i].removed = false
  //Move where its being drawn on the screen to correspond with its position in the viewport (Again using CSS's margin as the offset)
  $("#"+dat.i).css("margin-left", (dat.x + offsetX).toString()+"px");
  $("#"+dat.i).css("margin-top", (dat.y + offsetY).toString()+"px");
  $("#"+dat.i).hide()
  console.log('that worked bro')
})

  socket.on('eaten', (dat) => {
    food[dat].removed = true
    console.log('eaten bruh')
  })