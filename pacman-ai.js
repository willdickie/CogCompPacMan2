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

	function selectSuper(scores, weights) {
		var tempArray = scores;
		tempArray.sort(sortFunction);
		var super1 = tempArray[0];
		var super2 = tempArray[1];
		var newGen = createNewGeneration(super1,super2);
		reRun(newGen);
	}
	function sortFunction(a, b) {
	    if (a[0] === b[0]) {
	        return 0;
	    }
	    else {
	        return (a[0] < b[0]) ? -1 : 1;
	    }
	}
	function createNewGeneration(super1, super2){
		
		var newGeneration = [];
		newGeneration.append(super1);
		newGeneration.append(super2);
		for(int i = 0; i<5;i++){
			newGeneration.append(createMutation(super1));
		}
		for(int i = 0; i<5;i++){
			newGeneration.append(createMutation(super1))

		}
		return newGeneration;
	}
	function createMutation(super){
		var mutationRate = 4.2;
		var rand = Math.random()*100;
		var temp[];
		temp[0] = 0;
		temp[1] = []
		for(int i = 0; i < 3;i++){
				if(rand < mutationRate){
					temp[1][i] = super[1][i] + super[1][i] * (Math.random() * (.1- -.1) + -.1);
				}else{
					temp[1][i] = suer[1][i]
				}
		}
		return temp;
	}
	window.onNewMap = function (map, userPos, ghosts) {		
		for(var i=0;i<ghosts.length;i++){
			console.log(ghosts[i].isVunerable());
		}
		console.log(map, userPos, ghosts);
	}
	
	startAI();
})