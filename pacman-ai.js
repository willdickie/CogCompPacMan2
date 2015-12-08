var PACAI =  (function (PacmanInternal) {
	var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
	
	function startAI() {
		startGame();
		console.log("A")
	}
	
	function startGame() {
		PacmanInternal.keyDown(virtualKey('N'));
	}
	
	function sendDirection(direction) {
		PacmanInternal.keyDown(virtualKeyRaw(direction));
	}
	
	function virtualKey(char) {
		var code = char.charCodeAt(0)
		return virtualKeyRaw(code);
	}
	
	function virtualKeyRaw(char) {
		return {keyCode:char};
	}
	
	// Convert a 2d array map format to all wall values being 0, rest 1
	function adaptMap(map,walls) {
		var outmap = [];
		for(var i=0;i<map.length;i++){
			var maprow = [];
			for(var j=0;j<map[i].length;j++){
				var wall = false;
				for (var k=0;k<walls.length;k++){
					if(map[i][j] == walls[k]) {
						wall = true;
						break;
					}
				}
				maprow.push(wall ? 0 : 1)
			}
			outmap.push(outmap);
		}
		return outmap;
	}
	
	function adjustPositionToBlockSize(pos) {
		return {
			x: Math.round(pos.x / 10),
			y: Math.round(pos.y / 10)
		}
	}
	
	window.onNewMap = function (ghostPos, userPos, ghosts) {
		// Adjust user position
		userPos = adjustPositionToBlockSize(userPos);
				
		// Collect position and vulnerability state of ghosts
		var ghostData = [];
		for(var i=0;i<ghosts.length;i++){
			var ghost = {}
			ghost.position = adjustPositionToBlockSize(ghostPos[i].new);
			ghost.vulnerable = ghosts[i].isVunerable();
			ghostData.push(ghost);
		}
		
		// Get relative positions between pacman and each ghost
		var relativeGhostPositions = [];
		for(var i=0;i<ghostData.length;i++){
			var relPos = {
				x: userPos.x - ghostData[i].position.x,
				y: userPos.y - ghostData[i].position.y,
				vulnerable: ghostData[i].vulnerable
			};
			relativeGhostPositions.push(relPos);
		}
		
		// Get distances between pacman and each ghost
		var graph = new Graph(adaptMap(Pacman.MAP,[Pacman.WALL,Pacman.BLOCK]));
		var ghostDistances = [];
		for(var i=0;i<ghostData.length;i++){
			var start = graph.grid[userPos.y][userPos.x];
			var end = graph.grid[ghostData[i].position.y][ghostData[i].position.x];
			var result = astar.search(graph, start, end);
			var dist = {
				distance: result.length,
				vulnerable: ghostData[i].vulnerable
			};
			ghostDistances.push(dist);
		}
	}
	
	startAI();
})