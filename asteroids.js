var ctx;
var space;
var scoredisplay;
var frameinterval = 1;
var framerate = 100;
var rocketship = function() {
	this.y = 320;
	this.x = 500;
	this.theta = 0;
	this.rotate = 0;
	this.rocket = 0;
	this.brake = 0;
	this.trigger = 0;
	this.destroy = 0;
	this.score = 0;
	this.velocity = {theta: 0, mag: 0};
	this.color = "rgb(200,0,0)";
	this.points = function() {
		var transTheta = this.theta; //-ship.theta-1/2*Math.PI;
		nose  = [this.x - Math.cos(transTheta)*13,
			    this.y - Math.sin(transTheta)*13];
		left  = [this.x + Math.cos(transTheta)*12 - Math.sin(transTheta)*10,
			    this.y + Math.sin(transTheta)*12 + Math.cos(transTheta)*10];
		right = [this.x + Math.cos(transTheta)*12 - Math.sin(transTheta)*-10,
			    this.y + Math.sin(transTheta)*12 + Math.cos(transTheta)*-10];
	 	return [nose, left, right];

	}
	this.lastPoints = this.points();
	this.rocketPoints = function() {
		var transTheta = ship.theta; //-ship.theta-1/2*Math.PI;
		xFudge = Math.floor(5*Math.random());
		yFudge = Math.floor(4*Math.random());
		tail  = [this.x + Math.cos(transTheta)*(18-xFudge) - Math.sin(transTheta)*(2-yFudge),
			    this.y + Math.sin(transTheta)*(18-xFudge) + Math.cos(transTheta)*(2-yFudge)];
		left  = [this.x + Math.cos(transTheta)*12 - Math.sin(transTheta)*5,
			    this.y + Math.sin(transTheta)*12 + Math.cos(transTheta)*5];
		right = [this.x + Math.cos(transTheta)*12 - Math.sin(transTheta)*-5,
			    this.y + Math.sin(transTheta)*12 + Math.cos(transTheta)*-5];
	 	return [tail, left, right];

	}
	this.draw = function() {
		if (this.destroy == 0) {
			var corners = this.points();
			this.lastPoints = corners;
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.moveTo(corners[0][0], corners[0][1]);
			ctx.lineTo(corners[1][0], corners[1][1]);
			ctx.lineTo(corners[2][0], corners[2][1]);
			ctx.fill();
			if (this.rocket) {
				ctx.fillStyle = "rgb(255,255,128)";
				corners = this.rocketPoints();
				ctx.beginPath();
				ctx.moveTo(corners[0][0], corners[0][1]);
				ctx.lineTo(corners[1][0], corners[1][1]);
				ctx.lineTo(corners[2][0], corners[2][1]);
				ctx.fill();
			}
		} else {
			this.velocity.mag = 0;
			ctx.fillStyle = "rgb(255,255,0)";
			ctx.beginPath();
			ctx.arc(this.x, this.y, Math.random()*this.destroy/10+3, 0, Math.PI*2, true);
			ctx.fill();
			this.destroy++;
		}
	}
}
var createShip = function() {
	ship = new rocketship();
	scoredisplay.value = ship.score;
}
var ship = new rocketship();

var asteroids = [];
var asteroid = function(radius) {
	this.radius = radius;
	this.y = Math.floor(Math.random()*500);
	this.x = Math.floor(Math.random()*500);
	this.deltaX = 1 - Math.random()*2;
	this.deltaY = 1 - Math.random()*2;
	this.destroy = 0;
	this.draw = function() {
		color = "rgb(128,128,128)";
		ctx.fillStyle = color;
		ctx.moveTo(this.x, this.y);
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.fill();
	}
}


var bullet = function(startx, starty, deltaX, deltaY, mag, theta) {
	this.x = startx;
	this.y = starty;
	this.radius = 2;
	this.destroy = 0;
	this.velocity = {theta: theta, mag: mag};
	this.deltaX = deltaX;
	this.deltaY = deltaY;
	this.createTime = new Date().getTime();
	this.draw = function() {
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.fill();
	}
}

var bullets = [];
var lastShot = 0;
var shoot = function() {
	if ((ship.destroy == 0) && (lastShot < msecs - 200   ) && (bullets.length < 5)) {
		lastShot = msecs;
		var deltaX = ship.velocity.mag*Math.sin(ship.velocity.theta) + 3*Math.sin(-ship.theta-1/2*Math.PI);
		var deltaY = ship.velocity.mag*Math.cos(ship.velocity.theta) + 3*Math.cos(-ship.theta-1/2*Math.PI);
		var mag = Math.sqrt(Math.pow(deltaX,2)+Math.pow(deltaY,2));
		var theta = Math.atan2(deltaX, deltaY);
		var shot = new bullet(ship.x, ship.y, deltaX, deltaY, mag, theta);
		bullets.push(shot);
		//setTimeout("bullets.shift()", space.width*10/mag);
	}
}

var msecs = new Date().getTime();
var update = function() {
	var time = new Date().getTime();
	framerate = 1000/(time-msecs);
	msecs = time;
	ctx.clearRect(0,0,space.width, space.height);

	if (ship.trigger == 1) {
		shoot();
	}

	if (ship.rocket == 1) {
		var x = ship.velocity.mag*Math.sin(ship.velocity.theta) + 0.05*Math.sin(-ship.theta-1/2*Math.PI);
		var y = ship.velocity.mag*Math.cos(ship.velocity.theta) + 0.05*Math.cos(-ship.theta-1/2*Math.PI);
		ship.velocity.mag = Math.sqrt((x*x)+(y*y));
		ship.velocity.theta = Math.atan2(x, y);
	}
	if (ship.brake)
		ship.velocity.mag -= (100/framerate)*0.04*ship.velocity.mag;

	if (ship.velocity.mag < 0)
		ship.velocity.mag = 0;
	if (ship.velocity.mag > 3)
		ship.velocity.mag = 3;
	
	if (ship.rotate != 0) {
		ship.theta += ship.rotate * (100/framerate) * 0.04;
	}
	//ship.velocity[1] = -ship.theta-1/2*Math.PI;
	ship.x = (ship.x + (100/framerate)*ship.velocity.mag*Math.sin(ship.velocity.theta)) % space.width;
	ship.x = (ship.x < 0) ? space.width-ship.x : ship.x;
	ship.y = (ship.y + (100/framerate)*ship.velocity.mag*Math.cos(ship.velocity.theta)) % space.height;
	ship.y = (ship.y < 0) ? space.height-ship.y : ship.y;

	for (var i = 0, length = bullets.length; i<length; i++) {
		var shot = bullets[i]; 
		shot.x = (shot.x + (100/framerate)*shot.deltaX) % space.width;
		shot.x = (shot.x < 0) ? space.width-shot.x : shot.x;
		shot.y = (shot.y + (100/framerate)*shot.deltaY) % space.height;
		shot.y = (shot.y < 0) ? space.height-shot.y : shot.y;
		shot.draw();
	}

	for (var i = 0, length = asteroids.length; i<length; i++) {
		var rock = asteroids[i];
		rock.x = (rock.x + rock.deltaX*(100/framerate)) % space.width;
		rock.x = (rock.x < 0) ? space.width-rock.x : rock.x;
		rock.y = (rock.y + rock.deltaY*(100/framerate)) % space.height;
		rock.y = (rock.y < 0) ? space.height-rock.y : rock.y;
		rock.draw();
	}

	for (var j = 0; j < asteroids.length; j++) {
		var rock = asteroids[j];
		for (var i = 0; i < bullets.length; i++) {
			var shot = bullets[i];
			if (rock && shot) {
				if (Math.sqrt(Math.pow(rock.x - shot.x, 2) +
					Math.pow(rock.y - shot.y, 2)) <= rock.radius+shot.radius) {
					rock.destroy = 1;
					shot.destroy = 1;
					ship.score++;
					scoredisplay.value = ship.score;
					if (rock.radius > 9) {
						for (var k = 0; k < 3; k++) {
							var fragment = new asteroid(rock.radius/2);
							fragment.x = rock.x + rock.radius - (Math.random()*rock.radius*2);
							fragment.y = rock.y + rock.radius - (Math.random()*rock.radius*2);
							asteroids.push(fragment);
						}
					}
				}
			} else {
				console.log(j,rock,i,shot,bullets.length);
			}
		}
		if (Math.abs(rock.y-ship.y) < rock.radius + 20 && 
			Math.abs(rock.x-ship.x) < rock.radius + 20) {
			for (var i = 0; i < ship.lastPoints.length; i++) {
				if (ship.destroy == 0 &&
					Math.sqrt(Math.pow(rock.y - ship.lastPoints[i][1], 2) + 
							Math.pow(rock.x - ship.lastPoints[i][0], 2))<rock.radius) {
					ship.destroy = 1;
					rock.destroy = 1;

					if (rock.radius > 9) {
						for (var k = 0; k < 3; k++) {
							var fragment = new asteroid(rock.radius/2);
							fragment.x = rock.x + rock.radius - (Math.random()*rock.radius*2);
							fragment.y = rock.y + rock.radius - (Math.random()*rock.radius*2);
							asteroids.push(fragment);
						}
					}
					setTimeout("createShip()", 4000);
				}
			}		
		}
	}
	ship.draw();
	
	asteroids = asteroids.filter(function(value) {
		return !value.destroy;
	});
	bullets = bullets.filter(function(value) {
		return !value.destroy 
				&& (value.createTime > (msecs - space.width*10/value.velocity.mag)) 
				&& (value.createTime > (msecs - 2000));
	});


	if (asteroids.length == 0) {
		for (var i = 0; i < 3; i++) {
			var rock = new asteroid(36);
			console.log(rock);
			asteroids.push(rock);
		}
	}

}

var init = function() {
	space = document.getElementById("space");
	scoredisplay = document.getElementById("scoredisplay");
	ctx = space.getContext('2d');
	document.onkeydown = keyListener; 
	document.onkeyup = keyListener;


	setInterval("update()", frameinterval);

}

var keyListener = function(evt) {
	var evt  = (evt) ? evt : ((event) ? event : null);
	if (evt.type == 'keydown') {
		switch (evt.keyCode) {
			case 37:
				ship.rotate = -1;
				break;
			case 39:
				ship.rotate = 1;
				break
			case 38:
				ship.rocket = 1;
				break;
			case 40:
				ship.brake = 1;
				break;
			case 190:
			case 32:
			case 90:
				ship.trigger = 1;
				shoot();
				break;
			case 67:
				for (var i = 0; i < asteroids.length; i++) {
					asteroids[i].deltaX = 0;
					asteroids[i].deltaY = 0;
				}
		}
	} else if (evt.type == 'keyup') {
		switch (evt.keyCode) {
			case 37:
				ship.rotate = 0;
				break;
			case 39:
				ship.rotate = 0;
				break
			case 38:
				ship.rocket = 0;
				break;
			case 40:
				ship.brake = 0;
				break;
			case 190:
			case 32:
			case 90:
				ship.trigger = 0;
				break;
		}
	}        
}