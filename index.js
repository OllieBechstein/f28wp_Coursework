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
  }
}

//Class for storing data about each piece of food
class Food {
  //Construcor takes in the x and y position of the food, as well as its radius
  constructor(x, y, r){
    this.x = x
    this.y = y
    this.r = r
  }
}

//Create an array to be used to store food objects
var food = []
var foodOBJs = []
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

//Used for zooming the camera out as the player gets larger
var scale = 1

//Creates an array to store each player on the server
var players = []
var playerOBJs = []
//Used to hold and update the client player
var client
//The starting radius of each player
const playerStartRad = 32
//The mass the player must be greater than to be able to use the boost mechanic
const boostThreshold = 3000

//Start the game for a player
function startClient(){
  //Loop for each piece of food that should be in the game
  for (var i = 0; i < 4000; i++) {
    food.push(new Food(foodOBJs[i].x, foodOBJs[i].y, foodRad))
    //Create an element in the body of the HTML code to represent this piece of food, with a unique ID
    $("body").append("<h2 class=food id=" + i.toString() + "></h2>")
    //Hide this element, using the unique ID
    $("#"+i.toString()).hide()
  }
  //Set the width and height to the width and height of the window
  width = $(window).width();
  height = $(window).height();
  //Create the player to represent the client
  createPlayer();
}

//Create the client player
function createPlayer(){
  //Add a new element to the body to represent the player
  $("body").append("<h1 class=player id=" + players.length + "></h1>")
  //Set the client to be a new player at the center of the world (0, 0) with the default radius
  client = new Player(0,0,playerStartRad, players.length)
  //Add the client to the list of players, at the end of the list
  players[players.length] = client
  //Use the css margins to control the position on the screen of the player (These values place the player in the center of the game viewport)
  $(".player,#" + client.id).css("margin-left", (width/2-client.r + 10).toString()+"px");
  $(".player,#" + client.id).css("margin-top", (height/2-client.r + 10).toString()+"px");
}

//Add a player to the server on the clients side
function addPlayer(){
  //Push the new player to the array in the center of the world (0, 0) with the default radius
  $("body").append("<h1 class=player id=" + players.length + "></h1>")
  players.push(new Player(0,0,playerStartRad, players.length))
}

//Set the interval of the update function to run every 16ms (approx. 60 times per second)
setInterval(updateClient, 16);
//Update function 
function updateClient(){
  //If the game has just been launched (if its the first frame)
  if(first){  
    //Start the client
    startClient()
    //Once this has happened it is no longer the first frame, dont run it again
    first = false
  }
  //Handle key input from the client
  keyInput()
  //If the clients radius is not accurate (based off of its current mass)
  if(client.r != Math.sqrt(client.mass / Math.PI)){
    //Set it to be the correct value using a formula derived from the radius formula
    client.r = Math.sqrt(client.mass / Math.PI)
    //Set the new size of the player, using the new radius
    $(".player,#" + client.id).css("width", (client.r*2).toString()+"px");
    $(".player,#" + client.id).css("height", (client.r*2).toString()+"px");
    //Readjust the players position to make sure it is still centered
    $(".player,#" + client.id).css("margin-left", (width/2- client.r + 16).toString()+"px");
    $(".player,#" + client.id).css("margin-top", (height/2- client.r + 16).toString()+"px");
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
  offsetX = client.x
  offsetY = client.y

  //If the client is going above the default speed (using boost)
  if(client.vel > client.defaultVel){
    //Decrease the players speed by 0.02x its total
    client.vel *= 0.98
  //Otherwise make sure the clients velocity is set to the default (not below, as sometimes the above code will make it lower than it should be)
  } else client.vel = client.defaultVel
  
  
}
//Draw the game to the clients screen
function draw(){
  //Loop through all the food in the food array
  for (var i = 0; i < food.length; i++) {
    //Represent the loop index as a string (To minimize the use of the .toString() function)
    var iString = i.toString()
    //Check to see if the food is within the viewport of the game
    if (food[i].x + offsetX >= 0 - foodRad && food[i].x + offsetX <= width + foodRad){
      if (food[i].y + offsetY >= 0 - foodRad && food[i].y + offsetY <= height + foodRad){
        //If it is, check for collision with the player
        collision(food[i])
        
        //Move where its being drawn on the screen to correspond with its position in the viewport (Again using CSS's margin as the offset)
        $("#"+iString).css("margin-left", (food[i].x + offsetX).toString()+"px");
        $("#"+iString).css("margin-top", (food[i].y + offsetY).toString()+"px");
        //Show the food
        $("#"+iString).show()
      //If the food is slightly offscreen (vertically), hide it
      } else if (food[i].y + offsetY >= -100 - foodRad && food[i].y + offsetY <= height+100 + foodRad){
        $("#"+iString).hide()
      }
    //If the food is slightly offscreen (horizontally), hide it
    } else if (food[i].x + offsetX >= -100 - foodRad && food[i].x + offsetX <= width+100 + foodRad){
        $("#"+iString).hide()
    }
  }
  for(var i = 0; i < playerOBJs.length; i++){
    
  }
}

//Handle input from the clients keyboard
function keyInput(){
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
  //Use distance formula to see how far away the player is from the food
  var dist = Math.sqrt((currentFood.x+offsetX - width/2)*(currentFood.x+offsetX - width/2) + (currentFood.y+offsetY - height/2)*(currentFood.y+offsetY - height/2))
  //If the food is within the radius of the player
  if(dist < client.r+foodRad){
    //Get the index of this piece of food in the array
    var i = food.indexOf(currentFood)
    //Set new x and y 
    var x = random(-worldSize, worldSize)
    var y = random(-worldSize, worldSize)
    //Replace the current piece of food with a new piece of food
    food[i] = new Food(x, y, foodRad)
    //Add the mass of this piece of food to the clients mass
    client.mass += foodMass
  }
}


  var xhr = new XMLHttpRequest();
  xhr.open("GET", "../food.json", false);
  xhr.onload = ajaxCallback; 
  xhr.send(); 
  function ajaxCallback(event){ 
    foodOBJs = JSON.parse(event.target.responseText)
  }

//format for sent data {id: 0, x: 0, y: 0, r: 0}
// socket.io connection setup
const socket = io(`ws://${window.location.host}`);
const connectedPromise = new Promise(resolve => {
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
setInterval(updateServer, 16);
function updateServer() {
  //sendPosition to server
  socket.emit('updatePlayer', {id: client.id, x: client.x, y: client.y, r: client.r});
  //Recieve position from server
  socket.on('updatePlayer', ({id, x, y, r}) => {
    console.log('lolxd')
    players[id].x = x
    players[id].y = y
    players[id].r = r
  })
}




