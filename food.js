
function Food(x, y, r) {
  this.x = x
  this.y = y
  this.r = r
  this.vel = 0
  
  this.update = function() {

  }
  
  this.eaten = function() {

  }

  this.show = function() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 50, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.closePath()
  }
}
