var PACAI =  (function (PacmanInternal) {
	var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
	var PILL_TOP_LEFT = {
		x: 1,
		y: 2
	};
	var PILL_TOP_RIGHT = {
		x: 17,
		y: 2
	};
	var PILL_BOT_LEFT = {
		x: 1,
		y: 16
	};
	var PILL_BOT_RIGHT = {
		x: 17,
		y: 16
	};
	var PILLS = [PILL_TOP_LEFT, PILL_TOP_RIGHT, PILL_BOT_LEFT, PILL_BOT_RIGHT];
	
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
	function shouldDo (weight) {
		return Math.random() < weight;
	}

	function getWeight (scorerName, proxGhost,ghostDanger,proxPowerPellet,moveArray) {
		
		// body...
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

		// Get relative positions between Pacman and each power pill
		var pacMap = Pacman.map.getCurrentMap();
		var pillPositions = [];
		for(var i=0; i<PILLS.length; i++){
			if( pacMap[PILLS[i].y][PILLS[i].x] == Pacman.PILL ){
				var posPill = {
					x: userPos.x - PILLS[i].x,
					y: userPos.y - PILLS[i].y
				};
				pillPositions.push(posPill);
			}
		}

		// Get distances between Pacman and each power pill
		var pillDistances = [];
		var minPillDist = {
			x: 1000000,
			y: 1000000,
			minVal: 1000000
		};
		for(var i=0; i<PILLS.length; i++){
			if( pacMap[PILLS[i].y][PILLS[i].x] == Pacman.PILL ){
				var startUser = graph.grid[userPos.y][userPos.x];
				var endPill = graph.grid[PILLS[i].y][PILLS[i].x];
				var distResult = astar.search(graph, startUser, endPill);
				var distToPill = distResult.length;
				pillDistances.push(distToPill);
				if( distToPill <= minPillDist.minVal )
				{
					minPillDist.minVal = distToPill;
					minPillDist.x = PILLS[i].x;
					minPillDist.y = PILLS[i].y;
				}
			}
		}

		// Get x and y coordinates of each pellet
		var pelletCoords = [];
		for(var i=0; i < pacMap.length; i++){
			for(var j=0; j < pacMap[i].length; j++){
				if(pacMap[i][j] == Pacman.BISCUIT){
					var pellet = {
						x: j,
						y: i
					};
					pelletCoords.push(pellet);
				}
			}
		}

		//Get relative positions between Pacman and each pellet
		var pelletPositions = [];
		for(var i=0; i<pelletCoords.length; i++){
			var posPellet = {
				x: userPos.x - pelletCoords[i].x,
				y: userPos.y - pelletCoords[i].y
			};
			pelletPositions.push(posPellet);
		}

		//Get distances between Pacman and each pellet
		var pelletDistances = [];
		var minPellDist = {
			x: 1000000,
			y: 1000000,
			minVal: 1000000
		};
		for(var i=0; i<pelletCoords.length; i++){
			var startUser2 = graph.grid[userPos.y][userPos.x];
			var endPellet = graph.grid[pelletCoords[i].y][pelletCoords[i].x];
			var distPellResult = astar.search(graph, startUser2, endPellet);
			var distToPell = distPellResult.length;
			pelletDistances.push(distToPell);
			if( distToPell <= minPellDist.min ){
				minPellDist.minVal = distToPell;
				minPellDist.x = pelletCoords[i].x;
				minPellDist.y = pelletCoords[i].y;
			}
		}

		//Get surrounding squares
		// 0 means square cannot be moved to
		// 1 means square can be moved to
		var surroundings = {
			leftMove:0,
			rightMove:0,
			downMove:0,
			upMove:0
		};
		if(userPos.x-1 >= 0 && (pacMap[userPos.y][userPos.x-1] != Pacman.WALL 
			&& pacMap[userPos.y][userPos.x-1] != Pacman.BLOCK)){
			surroundings.leftMove = 1;
		}
		if(userPos.x+1 < pacMap[0].length && (pacMap[userPos.y][userPos.x+1] != Pacman.WALL 
			&& pacMap[userPos.y][userPos.x+1] != Pacman.BLOCK) ){
			surroundings.rightMove = 1;
		}
		if(userPos.y-1 >= 0 && (pacMap[userPos.y-1][userPos.x] != Pacman.WALL 
			&& pacMap[userPos.y-1][userPos.x] != Pacman.BLOCK)){
			surroundings.upMove = 1;
		}
		if(userPos.y+1 < pacMap.length && (pacMap[userPos.y+1][userPos.x] != Pacman.WALL 
			&& pacMap[userPos.y+1][userPos.x] != Pacman.BLOCK)){
			surroundings.downMove = 1;
		}
	}
	
	startAI();
})