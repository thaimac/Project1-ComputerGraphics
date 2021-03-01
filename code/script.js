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
	var bacteria = [];

	//Create main canvas
	var canvas = document.getElementById('webgl');
	//Render context for main canvas
	var gl = canvas.getContext('webgl');
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
      //Losing condition
      if(this.radius > 0.3) {
        console.log("YOU LOSE");
        this.alive = false;
        bacteria.splice(this,1);
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

  // Create and push new Bacteria objects into bacArr, then spawn each Bacteria
	for(var i = 0; i<totalBacteria; i++){
		bacteria.push(new Bacteria());
		bacteria[i].spawn();
	}

  //Function that carries out the gameplay
	function play() {
			for (let i in bacteria) {
					bacteria[i].update();
				}
		//create main game circle in centre of canvas
		drawCircle(gl, 0,0,0.8,[0.05, 0.1, 0.05, 0.5], fragColor);
		requestAnimationFrame(play);
	}

  //Start game
	play();
}