const { Console } = require('console');
const Bundler = require('parcel-bundler');
const app = require('express')();
const server = require('http').createServer(app);
const socketIO = require('socket.io');

let io = socketIO(server);

const file = 'index.html';
const options = {};

const bundler = new Bundler(file, options);

app.use(bundler.middleware());

const port = 3000;

var food = {x: 100, y: 10}
const foodTotal = 4000;
const worldSize = 7000;
var players = []

server.listen(port, () => {
    console.log('Server is up on port' + port);
    createWorld()
});

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id)
    //for(var i = 0; i < players.length; i++){
        //if(players[i].socket == socket.id){
            //Console.log("Player " + socket.id + " rejoined!")
        //    
        //}
    //}
    //clients[socket.id] = socket

    socket.emit('levelData', food, players)
    // Receive player positions and type
    
    socket.on('eaten', (i) => {
        var x = random(-worldSize, worldSize)
        var y = random(-worldSize, worldSize)
        food[i] = {x: x, y: y}
        socket.broadcast.emit('eaten', i)
        socket.emit('foodAdded', {i: i, x: x, y: y})
    })

    socket.on('playerData', (dat) => {
        
        if(players.length > dat.id){
            players[dat.id].x = dat.x
            players[dat.id].y = dat.y
            players[dat.id].r = dat.r
            socket.broadcast.emit('playerData', {x: dat.x, y: dat.y, r: dat.r, id: dat.id, removed: players[dat.id].removed})
        } else {
            players.push({x: dat.x, y: dat.y, r: dat.r, id: dat.id, removed: dat.removed, socket: socket.id})
            socket.broadcast.emit('playerData', {x: dat.x, y: dat.y, r: dat.r, id: dat.id})
        }
        
    })
    socket.on('shouldRemove', () => {
        for(var i = 0; i < players.length; i++){
            for(var j = 0; j < players.length; j++){
                if(players[i] != players[j] && (!players[i].removed || !players[j].removed)){
                    var dist = Math.sqrt((players[i].x - players[j].x)*(players[i].x - players[j].x) + (players[i].y-players[j].y)*(players[i].y-players[j].y))
                  
                    if(dist < players[j].r - players[i].r + (players[j].r/10)){
                        if(players[j].r > players[i].r){
                            console.log('working!')
                            players[i].removed = true
                            socket.emit('playerRemoved', (j, i))
                        } else if(players[j].r < players[i].r){
                            players[j].removed = true
                            socket.emit('playerRemoved', (i, j))
                            players[j].vel = 0
                        }
                    }
                }
            }
        }
    })
 
    socket.on('disconnect', () => {
        console.log(socket.id + ' left the server');
        for(var i = 0; i < players.length; i++){
            if(players[i].socket == socket.id){
                players[i].removed = true
            }
        }
    });
    
})

function createWorld(){
    for(var i = 0; i < foodTotal; i++){
        food[i] = {x: random(-worldSize, worldSize), y: random(-worldSize, worldSize)}
    }
}

//RANDOM NUMBER GENERATOR
function random(min, max) {
    //Return a floored value using the random function from the Math class, between the max and min value
    return Math.floor(Math.random() * (max - min) ) + min;
}