// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.4, 0.0, 1.0);\n' +
  '}\n';

function main() {
	//Retrieve canvas element
	var canvas = document.getElementById('webgl');

	//Render context
	var gl = getWebGLContext(canvas);
	if(!gl) {
		console.log("Failed to render this context");
		return false;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Write the positions of vertices to a vertex shader
	var n = initVertexBuffer(gl);
	if (n < 0) {
	  console.log('Failed to set the positions of the vertices');
	  return;
	}

	//Set clear color
	gl.clearColor(0.0,0.0,0.0,1.0);

	//Clear Canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Draw the rectangle
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function initVertexBuffer(gl) {
    // Create a buffer object
    var vertexBuffer = gl.createBuffer(),
        vertices = [],
        vertCount = 2;
    for (var i=0.0; i<=360; i+=1) {
      // degrees to radians
      var j = i * Math.PI / 180;
      // X Y Z
      var vert1 = [
        Math.sin(j)*0.5,
        Math.cos(j)*0.5,
      ];
      var vert2 = [
        0,
        0,
      ];
      vertices = vertices.concat(vert1);
      vertices = vertices.concat(vert2);
    }
    var n = vertices.length / vertCount;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	  }
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Position, vertCount, gl.FLOAT, false, 0, 0);

    return n;
  }