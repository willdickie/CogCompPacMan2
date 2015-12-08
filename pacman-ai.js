var PACAI =  (function (Pacman) {
	var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
	
	function startAI() {
		startGame();
		console.log("A")
	}
	
	function startGame() {
		Pacman.keyDown(virtualKey('N'));
	}
	
	function sendDirection(direction) {
		Pacman.keyDown(virtualKeyRaw(direction));
	}
	
	function virtualKey(char) {
		var code = char.charCodeAt(0)
		return virtualKeyRaw(code);
	}
	
	function virtualKeyRaw(char) {
		return {keyCode:char};
	}
	startAI();
})