// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = FragColor;\n' +
  '}\n';

var main = function() {

	var currBacNum = 0;
	var totalBacteria = 5;
    var poisonedBacteria = 0;
	var bacteria = [];
    var points = 0;
    var particlesArray = [];
    var thresholdCount = 0;
    var continuous = false;
    var gameOver = false;

	//Create main canvas
	var canvas = document.getElementById('webgl');
	//Render context for main canvas
	var gl = canvas.getContext('webgl');
    
    // store canvas dimentions
    var gameWidth = canvas.width;
    var gameHeight = canvas.height;
    
    
	if(!gl) {
		console.log("Failed to render this context");
		return false;
	}

  //Create buffer to bind vertex data to
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  //Initialize shaders and handle error
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
  }

  var coordinates = gl.getAttribLocation(gl.program, "a_Position");
  var fragColor = gl.getUniformLocation(gl.program, "FragColor");

  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(coordinates);

  //function used to draw main disk and all bacteria that will grow on it 
  function drawCircle(gl,x,y,r,color, fragColor) {
    var points = [];
    for (var i=0.0; i<=360; i+=1) {
      var y1 = r*Math.sin(i)+y;
			var x1 = r*Math.cos(i)+x;

			var y2 = r*Math.sin(i+1)+y;
			var x2 = r*Math.cos(i+1)+x;

			points.push(x);
			points.push(y);
			points.push(0);

			points.push(x1);
			points.push(y1);
			points.push(0);

			points.push(x2);
			points.push(y2);
			points.push(0);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    gl.uniform4f(fragColor, color[0], color[1], color[2], color[3]);
    gl.clearColor(0, 1, 0, 0.9);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 360*3);
  }
    
    

  //Function to randomly choose quadrant that bacteria spawns in
	function selectQuadrant(n){
    n = Math.random() >= 0.5 ? n*(-1) : n;
		return n;
	}

  //Class to hold data about each individual bacteria
	class Bacteria {

    //spawns bacteria
		spawn() {
			this.randomCoordinates();
            this.x = this.randomX*Math.sin(this.angle);
			this.y = this.randomY*Math.cos(this.angle);
			this.radius = 0.04;
			this.color = [Math.random(), Math.random(), Math.random(), 1];
			this.alive = true;
			currBacNum++;
		}

		update() {
            
        //once a bacterium reaches 0.3 radius it has passed threshold, mark it
        if(this.radius > 0.3) {
            //this.alive = false;
            //bacteria.splice(this,1);
            thresholdCount++;
        }
			
            //Increase the size of each bacteria by 'radius' at each tick. Adjust to modify difficulty
			this.radius += 0.0003;
			//Grow bacteria
            drawCircle(gl, this.x, this.y, this.radius, this.color, fragColor);
		}

		//Function that randomly selects the coordinates of a spawning bacteria
		randomCoordinates() {
			this.angle = Math.random();
			this.randomX = selectQuadrant(0.8);
			this.randomY = selectQuadrant(0.8);
		}
	}
    
    // class for creating explosion particles
    class explosionParticles{
        // create the particle with specified x and y parameters
        spawnParticle(startX, startY){
            this.x = startX;
            this.y = startY;
            this.radius = 0.005
        }
        
        update(){
            // increase particle size to appear as an explosion
            this.radius += 0.0005;
            drawCircle(gl, this.x, this.y, this.radius, [0, 0, 0, 1], fragColor);
            
            // once particle reaches threshold remove them
            if(this.radius > 0.01) {
                particlesArray.splice(this,1);
            }
            
        }

    }

  // Create and push new Bacteria objects into bacteria array, then spawn each Bacteria
	for(var i = 0; i<totalBacteria; i++){
		bacteria.push(new Bacteria());
		bacteria[i].spawn();
	}

  //Function that carries out the gameplay
	function play() {
        
        // set the game mode
        document.getElementById("gameMode").addEventListener("click", function() {
            // change to continuous spawns
            if(continuous == false && gameOver == false){
                continuous = true;
                // change button text
                document.getElementById("gameMode").innerHTML = "Continuous";
                
                
                
                // spawn up to max bacteria after game mode change
                while (currBacNum < totalBacteria){
                    // create new bacteria
                    bacteria.push(new Bacteria());
                    bacteria[currBacNum].spawn();
                }
            }
        });
        
        // set text values for points and bacteria posioned
        document.getElementById('pointsText').innerHTML = "Points: " + points;
        document.getElementById('bactRemoved').innerHTML = "Bacteria Poisoned: " + poisonedBacteria;
        
        // update bacteria each frame
        for (let i in bacteria) {
                bacteria[i].update();
        }
        
        // game over, two have reached threshold
        if(thresholdCount >= 2){
            // remove remaining bacteria
            for (let b in bacteria){
                bacteria.splice(b,1);
                currBacNum--;
            }
            
            document.getElementById('pointsText').innerHTML = "Final Score: " + points;
            document.getElementById('bactRemoved').innerHTML = "Game Over!";
            
            // game has ended
            gameOver = true;
        }
        
        // if the player wins set final text
        if (poisonedBacteria == totalBacteria && continuous == false){
            document.getElementById('pointsText').innerHTML = "Final Score: " + points;
            document.getElementById('bactRemoved').innerHTML = "You Win!";
        }
        
        // update particles each frame
        for (let p in particlesArray) {
            particlesArray[p].update();
        }
        
		//create main game circle in centre of canvas
		drawCircle(gl, 0,0,0.8,[0.05, 0.1, 0.05, 0.5], fragColor);
		requestAnimationFrame(play);
	}
    
    
    // mouse event listener
    canvas.onmousedown = function(ev){ mouseClick(ev, canvas); };
    
    function mouseClick(ev, gl, canvas){
        
        var mouseX = ev.clientX;
        var mouseY = ev.clientY;
        
        var bactClicked = 0;
        var rect = ev.target.getBoundingClientRect() ;

        // convert mouse click to canvas x and y values
        mouseX = ((mouseX - rect.left) - gameWidth/2)/(gameWidth/2);
        mouseY = (gameHeight/2 - (mouseY - rect.top))/(gameHeight/2);
                                                     
        for (let z in bacteria){
            //calculate distance between mouse and bacteria using diatance formula
            //square root of: difference in x^2 + difference in y^2
            var xSquared = (bacteria[z].x - mouseX)*(bacteria[z].x - mouseX);
            var ySquared = (bacteria[z].y - mouseY)*(bacteria[z].y - mouseY);
            var pointDistance = Math.sqrt(xSquared + ySquared);
            
            
            
            // if the distance minus the current radius size is less than 0
            // click falls within the bacteria
            if ((pointDistance - bacteria[z].radius) <= 0){
                
                // create an explosion
                explosionParticleLocation(mouseX, mouseY);
                
                // tracker to see if bacteria is clicked
                bactClicked = -1;
                
                // call points function
                gamePoints(bacteria[z].radius);
                
                // increment counter
                poisonedBacteria++;
                
                // kill bacteria
                bacteria[z].alive = false;
                // remove from array
                bacteria.splice(z,1);
                
                currBacNum--;
                
                // use this for continuous spawn of new bacteria
                if (continuous == true){
                    // create new bacteria
                    bacteria.push(new Bacteria());
                    bacteria[totalBacteria - 1].spawn();
                }
                
                
            }
        }
        
        // in this case a bacteria was not clicked so deduct points
        if(bactClicked != -1){
            points = points - 100;
        }
    }

    // calculate points
    function gamePoints(bacteriaSize){
        // calculate points recieved for each click, base is 120 but will recieve less for larger bacteria
        points = points + (120 - Math.floor(bacteriaSize * 300));
    }
    
    function explosionParticleLocation(locationX, locationY){
            // create 5 particles for explosion
            particlesArray.push(new explosionParticles());
            particlesArray.push(new explosionParticles());
            particlesArray.push(new explosionParticles());
            particlesArray.push(new explosionParticles());
            particlesArray.push(new explosionParticles());
            
            // set the location of all particles
            particlesArray[0].spawnParticle(locationX + 0.03, locationY);
            particlesArray[1].spawnParticle(locationX - 0.03, locationY);
            particlesArray[2].spawnParticle(locationX, locationY + 0.03);
            particlesArray[3].spawnParticle(locationX, locationY - 0.03);
            particlesArray[3].spawnParticle(locationX, locationY);
    }
    
    
    
  //Start game
	play();
}
