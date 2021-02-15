function main() {
	//Retrieve canvas element
	var canvas = document.getElementById('webgl');

	//Render context
	var gl = getWebGLContext(canvas);
	if(!gl) {
		console.log("Failed to render this context");
		return false;
	}

	//Set clear color
	gl.clearColor(0.0,0.0,0.0,1.0);

	//Clear Canvas
	gl.clear(gl.COLOR_BUFFER_BIT);
}