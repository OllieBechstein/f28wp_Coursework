

var left = false;
var right = false;
var x = 100;
var y = 100;
var speed = 4;



let canvas;
let context;

window.onload = init;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    // Start the first frame request
    window.requestAnimationFrame(gameLoop);
}

let secondsPassed;
let oldTimeStamp;
let fps;

function gameLoop(timeStamp) {

    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    // Calculate fps
    fps = Math.round(1 / secondsPassed);

    // Perform the drawing operation
    draw();

    // The loop function has reached it's end. Keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 68) {
        right = true;
    }
    if(event.keyCode == 65) {
        left = true;
    }
});

document.addEventListener("keyup", function(event) {
    if (event.keyCode == 68) {
        right = false;
    }
    if (event.KeyCode == 65) {
        left = false;
    }
});

function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    if(right){
        x += speed;
    }
    if(left){
        x -= speed;
    }

    context.fillStyle = '#ff0000';
    context.fillRect(x, y, 64, 64);

}
