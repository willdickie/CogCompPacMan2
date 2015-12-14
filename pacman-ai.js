var PACAI =  (function (Pacman) {
	var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
	
	function startAI() {
		startGame();
		tempS = [[10,[1,1,1]],[5,[2,2,2]]];
		selectSuper(tempS);
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

	function selectSuper(scores) {
		var tempArray = scores;
		tempArray.sort(sortFunction);
		var super1 = tempArray[0];
		var super2 = tempArray[1];
		var newGen = createNewGeneration(super1,super2);
		//reRun(newGen);
	}
	function sortFunction(a, b) {
	    if (a[0] === b[0]) {
	        return 0;
	    }
	    else {
	        return (a[0] > b[0]) ? -1 : 1;
	    }
	}
	function createNewGeneration(super1, super2){
		
		var newGeneration = [];
		newGeneration.push(super1);
		newGeneration.push(super2);
		for(j = 0; j<5;j++){
			newGeneration.push(createMutation(super1));
			console.log(j);
		}
		for(k = 0; k<5;k++){
			newGeneration.push(createMutation(super1));
			console.log(k);
		}
		return newGeneration;
	}
	function createMutation(tempSuper){
		console.log(tempSuper);
		var mutationRate = 4.2;
		var rand = Math.random()*100;
		var temp = [];
		temp.push([0,[]]);
		for(i = 0; i < 3;i++){
				if(rand < mutationRate){
					temp[0][i] = tempSuper[0][i] + tempSuper[0][i] * (Math.random() * (.1- -.1) + -.1);
				}else{
					temp[0][i] = tempSuper[0][i];
				}
		}
		console.log(temp);
		return temp;
	}
	window.onNewMap = function (map, userPos, ghosts) {		
		for(var i=0;i<ghosts.length;i++){
			console.log(ghosts[i].isVunerable());
		}
		//console.log(map, userPos, ghosts);
	}
	
	startAI();
})