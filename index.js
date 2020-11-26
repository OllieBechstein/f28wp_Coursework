//Class for storing data about each player
class Player {
  //constructor takes in their name, x and y position, the radius of the player and unique id
  constructor(name, x, y, r, id){
    //Set the classes name, x, y and radius to the values taken in from the constructor
    this.x = x
    this.y = y
    this.r = r
    this.name = name
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
    //Used to find out whether the player is boosting
    this.boostToggled = false
    //Stores whether or not the player has been removed
    this.removed = false
  }
}

//Class for storing data about each piece of food
class Food {
  //Construcor takes in the x and y position of the food, as well as its radius and stores whether or not its been removed
  constructor(x, y, r){
    this.x = x
    this.y = y
    this.r = r
    this.removed = false
  }
}

//Has the game started? (Build in delay for the player to connect to the server)
var started = false;
var wait = 0
const waitTime = 10

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

//Default player name if something goes wrong inputting one
let playerName = 'Player'

//Used for positioning the camera (offsetting the x and y of the world)
var offsetX = 0
var offsetY = 0

//How big the death pop-up window should be
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


//Socket.io connection setup

import io from 'socket.io-client';

const socket = io(`ws://${window.location.host}`);
const connectPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });
});


//Start the game for a player
function startClient(){
  //Loop for each piece of food that should be in the game
  for (var i = 0; i < food.length; i++) {
    //Create an element in the body of the HTML code to represent this piece of food, with a unique ID
    $("body").append("<div class=food id=" + i.toString() + "></div>")
    //Hide this element, using the unique ID
    $("#"+i.toString()).hide()
  }
  //Loop for each player that should be in the game
  for (var i = 0; i < players.length; i++) {
      //Create an element in the body of the HTML code to represent other players, with a unique id
      $("body").append("<div class=player id=" + players[i].id + "></div>")
      $(".player,#" + players[i].id).append("<p>" + players[i].name + "</p>");
      //Hide this element, using the unique ID
      $(".player,#"+i.toString()).hide()
  }
  //Set the width and height to the width and height of the window
  width = $(window).width();
  height = $(window).height();
  //Create the screen to be shown when the player dies
  buildDead()
  //Create the player to represent the client
  createPlayer();
}

//Create the client player
function createPlayer(){
  //Set the client to be a new player at random position in the world with the default radius
  client = new Player(playerName, random(-worldSize + 300, worldSize -300),random(-worldSize + 300, worldSize -300),playerStartRad, players.length)
  //Set up for drawing
  $("body").append("<p class=mass>Current Mass</p>")
  $(".mass").show()
  $("body").append("<div class=player id=" + client.id + "></div>")
  $(".player,#" + client.id).append("<p>" + playerName + "</p>");
  //Hide this element, using the unique ID
  $(".player,#"+client.id).hide()
  //Add the client to the list of players, at the end of the list
  players[client.id] = client

}

//Set the interval of the update function to run every 16ms (approx. 60 times per second)
setInterval(updateClient, 16);
//Update function 
function updateClient(){
  //Make sure the width and height are still accurate
  width = $(window).width();
  height = $(window).height();
  //If the game has just been launched (if its the first frame)
  if(wait == waitTime){  
    //Start the client
    startClient()
    wait++
    //Once this has happened it is no longer the first frame, dont run it again
  } else if(wait > waitTime){
    if(!client.removed){
      //Handle key input from the client
      keyInput()
      //If the clients radius is not accurate (based off of its current mass)
      if(client.r != Math.sqrt(client.mass / Math.PI)){
        //Set it to be the correct value using a formula derived from the radius formula
        client.r = Math.sqrt(client.mass / Math.PI)
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
  //Before the player enters the server
  if(started && wait < waitTime){
    wait++
  } else {
    if(wait == 0){
      //Pressing enter on the log-in screen sets the name and starts the game
      $(document).keydown(function(event){
        if(event.key == "Enter"){
          playerName = document.getElementById("inputName").value
          startGame()
        }
      
      });
      //Remove all the log-in UI and set started to true
      function startGame(){
        $("#loginBox").remove()
        $("#welcome").remove()
        $("#enterName").remove()
        $("#inputName").remove()
        started = true
      }
    }
  }
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
          } else if (food[i].y + offsetY >= -foodRad && food[i].y + offsetY <= height + foodRad){
            $("#"+i).hide()
          }
        //If the food is slightly offscreen (horizontally), hide it
        } else if (food[i].x + offsetX >= -100-foodRad && food[i].x + offsetX <= width+100 + foodRad){
            $("#"+i).hide()
        }
      } else {
        $("#"+i).hide()
      }
    }

    //Loop through each player
    for(var i = 0; i < players.length; i++){
        //Move where each player being drawn on the screen to correspond with its position in the viewport (Again using CSS's margin as the offset)
        $(".player,#"+i).css("margin-left", (players[i].x + offsetX - players[i].r).toString()+"px");
        $(".player,#"+i).css("margin-top", (players[i].y + offsetY - players[i].r).toString()+"px");
        $(".player,#"+i).css("width", (players[i].r*2).toString()+"px");
        $(".player,#"+i).css("height", (players[i].r*2).toString()+"px");
        $(".player,#"+i).css("background-color", "darkblue")
        //Write the name below the player
        $("p,.player,#"+i).html(players[i].name).css("color", "white").css("text-align", "center");
        //Show the player if its in the game, otherwise remove it
        if(players[i].removed){
          $(".player,#"+i).hide()
        } else {
          $(".player,#"+i).show()
        }
    }

    //If the client player has been removed display the dead screen, otherwise hide the dead screen
    if(client.removed){
      displayDead()
    } else {
      hideDead()
      $(".mass").text("Current Mass: " + Math.round(client.mass/100));
    }
  }
}

//Format the dead screen using jquery
function buildDead(){
  $("body").append("<div class=deathScreen></div>")
  $("body").append("<h3 class=deathScreen id=deathText>PRESS SPACE TO PLAY AGAIN</h3>")
  $(".deathScreen").css("margin-left", (width/2 - deathWindowWidth/4).toString()+"px")
  $(".deathScreen").css("margin-top", (height/2 - deathWindowHeight).toString()+"px")
  $("#deathText").css("margin-left", (width/2 - deathWindowWidth/4).toString()+"px")
  $("#deathText").css("margin-top", (height/2 - deathWindowHeight).toString()+"px")
  $(".deathScreen").hide()
}

//show dead screen
function displayDead(){
  $(".deathScreen").show()
}

//hide dead screen
function hideDead(){
  $(".deathScreen").hide()
}

//Handle input from the clients keyboard
function keyInput(){
  document.addEventListener('keydown', function(event) {
    if(!client.removed){
    //Check for a key being pressed down
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
    } else {
      //If space is being pressed
      if (event.key === ' '){
        //Respawn the player
        players[client.id] = new Player(playerName, 0, 0, playerStartRad, client.id)
        client = players[client.id]
        //Boost to prevent wasting mass as soon as the player spawns
        client.boostToggled = true
        socket.emit('respawn', client.id)
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

  //Set the interval of the updateServer function to run every 16ms (approx. 60 times per second)
  setInterval(updateServer, 16)
  function updateServer() {

    if(wait > waitTime){
      //Send position to server
      socket.emit('playerData', {name: client.name, id: client.id, x: client.x, y: client.y, r: client.r, removed: client.removed});
      //Ping the server to see if it should be removed
      socket.emit('shouldRemove')
    }
  }
  //When it recieves level data
  socket.on('levelData', (foo, pla) => {
    //Add all the food in the level to the list of food in the client
    for(var i = 0; i < totalFood; i++){
      food.push(new Food(foo[i].x, foo[i].y, foodRad))
    }
    //Do the same for players
    for(var i in pla){
      players[pla[i].id] = new Player(pla[i].name, pla[i].x, pla[i].y, pla[i].r, pla[i].id)
      if(pla[i].removed){
        players[pla[i].id].removed = true
      }
    }
  })

  //If a player is removed then make sure it appears that way for the client
  socket.on('playerRemoved', (dat) => {
    console.log(client.mass)
    if(dat[0] == client.id){
      client.removed = true
    } else if(dat[1] == client.id){
      if(!players[dat[0].removed]){
        client.mass += players[dat[0]].r * players[dat[0]].r * Math.PI
        console.log(client.mass)
      }
    }
    players[dat[0]].removed = true
    players[dat[0]].x = -1000000
    players[dat[0]].y = -1000000
    players[dat[0]].r = 0
      
  })

  //When the client recieves player data, update that player in the players array
  socket.on('playerData', (dat) => {
    var found = false
    for(var i = 0; i < players.length; i++){
        if(players[i].id == dat.id){
          players[i].x = dat.x
          players[i].y = dat.y
          players[i].r = dat.r
          players[i].name = dat.name
          players[i].removed = dat.removed
          players[i].mass = dat.r*dat.r*Math.PI
          found = true
      }
    }
    //If it doesn't exist in the players array, its a new player and should be added
    if(!found){
      players.push(new Player(dat.name, dat.x, dat.y, dat.r, dat.id))
      $("body").append("<div class=player id=" + dat.id + "></div>")
      $(".player,#" + dat.id).hide()
    }
  })

  //When food is added, update the food array
  socket.on('foodAdded', (dat) => {
    food[dat.i].x = dat.x
    food[dat.i].y = dat.y
    food[dat.i].removed = false
    //Move where its being drawn on the screen to correspond with its position in the viewport (Again using CSS's margin as the offset)
    $("#"+dat.i).css("margin-left", (dat.x + offsetX).toString()+"px");
    $("#"+dat.i).css("margin-top", (dat.y + offsetY).toString()+"px");
    $("#"+dat.i).hide()
  })

  //When food has been eaten, remove that piece of food
  socket.on('eaten', (dat) => {
    food[dat].removed = true
  })