//Include required packages
const Bundler = require('parcel-bundler');
const app = require('express')();
const server = require('http').createServer(app);
const socketIO = require('socket.io');

//Initialize the server variable
let io = socketIO(server);

//Location of index file + options file (unused)
const file = 'index.html'
const options = {}

//Init bundler
const bundler = new Bundler(file, options)

//Use bundler
app.use(bundler.middleware())

//Port to launch localhost on
const port = 3000

//Lists used to store the data for the clients to read
var food = {x: 100, y: 10}
var players = []

//World data
const foodTotal = 4000
const worldSize = 7000

//Start server
server.listen(port, () => {
    console.log('Server is up on port' + port);
    //Create the world when the server starts
    createWorld()
});

//On player connection
io.on('connection', (socket) => {
    //On disconnect
    socket.on('disconnect', () => {
        //Update for players
        socket.broadcast.emit('removal', socket.pos);
    });
    
    //Send the level data to the players
    socket.emit('levelData', food)

    //When food is eaten
    socket.on('eaten', (i) => {
        //Create a new piece of food and send it back to the players
        var x = random(-worldSize, worldSize)
        var y = random(-worldSize, worldSize)
        food[i] = {x: x, y: y}
        socket.emit('eaten', i);
        socket.emit('foodAdded', {i: i, x: x, y: y});
    })
    
    //Recieve player data
    socket.on('playerData', (dat) =>{
        //Take player data, update values in players array and send back to other players
        if(players.length > dat.id){
            players[dat.id].x = dat.x
            players[dat.id].y = dat.y
            players[dat.id].r = dat.r
            socket.broadcast.emit('playerData', {x: dat.x, y: dat.y, r: dat.r, id: dat.id})
        } else {
            players.push({x: dat.x, y: dat.y, r: dat.r, id: dat.id})
            socket.broadcast.emit('playerData', {x: dat.x, y: dat.y, r: dat.r, id: dat.id})
        }
    })
})

//Create the world
function createWorld(){
    //Loop through the amount of food their should be and create it
    for(var i = 0; i < foodTotal; i++){
        food[i] = {x: random(-worldSize, worldSize), y: random(-worldSize, worldSize)}
    }
}

//RANDOM NUMBER GENERATOR
function random(min, max) {
    //Return a floored value using the random function from the Math class, between the max and min value
    return Math.floor(Math.random() * (max - min) ) + min;
}