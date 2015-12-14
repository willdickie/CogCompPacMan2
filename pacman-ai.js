var PACAI =  (function (PacmanInternal) {
	var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
	var SCORERWEIGHTS = {
		"goForGhost": 0,
		"goForPellet": 0,
		"goForPPellet": 0.5,
		"runFromGhost": 0.5
	};

	var PILL_TOP_LEFT = {x: 1,y: 2};
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
		return {
			keyCode:char,
			preventDefault:function(){},
			stopPropagation:function(){}
		};
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
				maprow.push(wall ? 0 : 1);
			}
			outmap.push(maprow);
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

	function getWeight (scorerName,proxGhost,ghostDanger,proxPellet,proxPowerPellet) {
		var weightConv = {
			"goForGhost": function(w,pG,gD,pP,pPP) {
				if (gD) return 0;
				else {
					return w*(1/pG);
				}
			},
			"goForPellet": function(w,pG,gD,pP,pPP) {
				return w*(1/pP);
			},
			"goForPPellet": function(w,pG,gD,pP,pPP) {
				return w*(1/pPP);
			},
			"runFromGhost": function(w,pG,gD,pP,pPP) {
				if (!gD) return 0;
				else {
					return w*(1/pG);
				}
			}
		}

		if (!scorerName in weightConv)
			return 0;
		return weightConv[scorerName](
			SCORERWEIGHTS[scorerName],
			proxGhost,
			ghostDanger,
			proxPellet,
			proxPowerPellet)
	}
	function relativeDirection(startPos,nextPos) {
		if(startPos.x < nextPos.y) return "rightMove";
		else if(startPos.x > nextPos.y) return "leftMove";
		else if(startPos.y < nextPos.x) return "downMove";
		else return "upMove";
	}
	function doScorer (scorerName,aStarMap,currentPos,validDirections,nearestGhost,nearestPellet,nearestPPellet) {
		var scorers = {
			"goForGhost": function() {
				var path = astar.search(
					aStarMap,
					aStarMap.grid[currentPos.y][currentPos.x],
					aStarMap.grid[nearestGhost.y][nearestGhost.x]);
				var nextStep = relativeDirection(currentPos,path[0]);
				return nextStep;
			},
			"goForPellet": function() {
				var path = astar.search(
					aStarMap,
					aStarMap.grid[currentPos.y][currentPos.x],
					aStarMap.grid[nearestPellet.y][nearestPellet.x]);
				var nextStep = relativeDirection(currentPos,path[0]);		
				return nextStep;
			},
			"goForPPellet": function() {
				var path = astar.search(
					aStarMap,
					aStarMap.grid[currentPos.y][currentPos.x],
					aStarMap.grid[nearestPPellet.y][nearestPPellet.x]);
				var nextStep = relativeDirection(currentPos,path[0]);
				return nextStep;
			},
			"runFromGhost": function() {
				var path = astar.search(
					aStarMap,
					aStarMap.grid[currentPos.y][currentPos.x],
					aStarMap.grid[nearestGhost.y][nearestGhost.x]);
				var nextStep = relativeDirection(currentPos,path[0]);
				var opposite = "";
				if(nextStep == "upMove") opposite = "downMove";
				if(nextStep == "downMove") opposite = "upMove";
				if(nextStep == "leftMove") opposite = "rightMove";
				if(nextStep == "rightMove") opposite = "leftMove";

				if (validDirections[opposite]) {
					return opposite;
				}else if ("upMove" != nextStep && validDirections["upMove"]){
					return "upMove";
				}
				else if ("rightMove" != nextStep && validDirections["rightMove"]) {
					return "rightMove";
				}else if ("downMove" != nextStep && validDirections["downMove"]) {
					return "downMove";
				}else if ("rightMove" != nextStep && validDirections["rightMove"]) {
					return "rightMove";
				}else return nextStep;
			}
		}
		return scorers[scorerName]();
	}
	lastPosition = {x:0,y:0};
	window.onNewMap = function (ghostPos, userPos, ghosts) {
		// Adjust user position
		userPos = adjustPositionToBlockSize(userPos);

		// Only run on full steps
		if(lastPosition.x != userPos.x || lastPosition.y != userPos.y) {
			lastPosition = userPos;
		} else {
			return;
		}
				
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
		var nearestGhost = 0;
		var shortestGhostDistance = 99999999999999;
		for(var i=0;i<ghostData.length;i++){
			var start = graph.grid[userPos.y][userPos.x];
			var end = graph.grid[ghostData[i].position.y][ghostData[i].position.x];
			var result = astar.search(graph, start, end);
			var dist = {
				distance: result.length,
				vulnerable: ghostData[i].vulnerable
			};
			if (dist.distance < shortestGhostDistance) {
				shortestGhostDistance = dist.distance;
				nearestGhost = i;
			}
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
					//console.log(pellet);
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
			if( distToPell <= minPellDist.minVal ){
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

		// Perform scorers fuzzily. Loop until we make a decision
		while(true) {
			var scorers = ["goForGhost","goForPellet","goForPPellet","runFromGhost"];
			for(var i=0;i<scorers.length;i++) {
				if(shouldDo(getWeight(
					scorers[i],
					shortestGhostDistance,
					!ghostData[nearestGhost].vulnerable,
					minPellDist.minVal,
					minPillDist.minVal
				))) {
					var direction = doScorer(
						scorers[i], 
						graph, 
						userPos, 
						surroundings,
						ghostData[nearestGhost].position,
						minPellDist,
						minPillDist);
					if (direction == "upMove") {
						sendDirection(UP);
					}else if (direction == "downMove") {
						sendDirection(DOWN);
					}else if (direction == "rightMove") {
						sendDirection(RIGHT);
					}else if (direction == "leftMove") {
						sendDirection(LEFT);
					}
					return direction;
				}
			}
		}
	}
	
	startAI();
})