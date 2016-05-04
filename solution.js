function Stacker(){
	
/************************* VARS  ****************************************/ 
 // cell types 
	var
	EMPTY = 0,
	WALL = 1,
	BLOCK = 2,
	GOLD = 3;
// directions
	var move = ['right', 'up', 'left', 'down'];
	var opposite = {
		up: 'down',
		down: 'up',
		left: 'right',
		right: 'left'
	}
	// states
	var currentState = 0;
	var state = {
		towerSearch: 0,
		findBlock: 1,
		buildStairCase: 2,
		GAMEOVER: 3
	}
	// troll stats
	var xPos = 0;
	var yPos = 0;
	var firstMove = true;
	var hasBlock = false;
	var moveHistory = [];
	// board and tower stats
	var towerX = -1;
	var towerY = -1;
	var stairs = [0,0,0,0,0,0,0];
	var foundTower = false;
	var atBottomOfTower = false;
	var towerJustDiscovered = true;
	var rePosition = [];
	var board = new Array();
	
	// make a copy of the board to record the visited cells' contents to use in findblock mode
	var mappedCells = buildBoard(16);

	var blockCount = 0;


/************************* APP ****************************************/ 
	this.turn = function(cell){
		// record current cell and its surrounding cells on mappedCells. 
		// this will be important during block finding stage
		recordCell(cell);

		if(currentState === state.towerSearch){
			if(firstMove){
				firstMove = false;
				// make a board to easily find visited points
				board = buildBoard(16);
				return 'drop';
			}
			if(foundTower){
				console.log('found the tower...')
				if(!atBottomOfTower && currentState === state.towerSearch){
					moveToBottomOfTower(cell);
					// console.log(rePosition)
					return moveHere(rePosition.shift()) || 'drop';
				}
				if(atBottomOfTower){
					currentState = state.findBlock;
					moveHistory.length = 0;
					console.log('atBottomOfTower');
				}
				
			} else {
				return smartSearch(cell)
			}
			
		}

		if(currentState === state.findBlock){
			console.log('lets find a block...')
			console.log('block count : ', blockCount);
			if(towerJustDiscovered){
				towerJustDiscovered = false;
				// give every cell a number in mappedCells to help with A* search calculations
				orderMappedCells(mappedCells);
				// clear board to make it easier to search for blocks and so troll will not to search for blocks around the tower.
				board = buildBoard(16);
			}

			return smartSearch(cell);
		}
		
		if(currentState === state.buildStairCase){
			console.log('state.buildStairCase');
			console.log('THIS IS MY BOARD:', board);
			console.log('THIS IS MY MAPPEDCELLS', mappedCells);
			return buildStairCase(cell);
		}
		if(currentState === state.GAMEOVER){
			console.log('you won!');
			return;
		}
	}

/************************* MAIN ****************************************/ 
	function smartSearch(cell){
		console.log('board', board)

		if(currentState === state.towerSearch){
			if(isAdjacentCellTower(cell)){
				foundTower = true;
				return 'drop'
			}
		}

		if(currentState === state.findBlock){
			if(isCurrentCellBlock(cell) && hasBlock === false && !isAdjacentCellTower(cell)){
				hasBlock = true;
				return 'pickup';
			}
			if(hasBlock){
				if(isAdjacentCellTower(cell)){
					currentState = state.buildStairCase;
					// you have a block so pickup will do nothing. we just want to be able to fire buildStaircase.
					return 'pickup';
				}
				var stepBackToTower = moveHistory.pop();
				return stepBackToTower;
			}
		}
		

		// set walls as visited so we don't run into them a bunch of times.
		function checkWalls(){
			if(board[xPos][yPos] === false){
				var boardLength = board.length;
				board[xPos][yPos] = true;
				if(cell.left.type === WALL || cell.left.level - 1 > cell.level){
					board[properIndex(xPos - 1, boardLength)][yPos] = true;
				}
				if(cell.right.type === WALL || cell.right.level - 1 > cell.level){
					board[properIndex(xPos + 1, boardLength)][yPos] = true;
				}
				if(cell.up.type === WALL || cell.up.level - 1 > cell.level){
					board[xPos][properIndex(yPos - 1, boardLength)] = true;
				}
				if(cell.down.type === WALL || cell.down.type - 1 > cell.level){
					board[xPos][properIndex(yPos + 1, boardLength)] = true;
				}
			}
		}

		checkWalls();

		// choose next move
		for(var i = 0; i < move.length; i++){
			var nextMove = move[i];
			if(!isAdjacentCellVisited(nextMove)){
				moveHistory.push(opposite[nextMove]);
				return moveHere(nextMove);
			}
		}
		// if we're stuck, move to the previous position and update coordinates 
		// so we have access to what we previously visited
		var previousMove = moveHistory.pop();
		var randomMove = move[Math.random() * move.length >> 0]

		return moveHere(previousMove) || moveHere(randomMove);
	}

	function isCurrentCellBlock(cell){
		if(cell.type === BLOCK){
			return true
		}
		return false;
	}

	function buildStairCase(cell){
		return climbStairs(cell);
		console.log('building that staircase bro...')
	}

	var climbStairsDirections = [];
	var counter = 0;
	function climbStairs(cell){
		console.log('climbingStairs');
		console.log('climbStairsDirections', climbStairsDirections);
		if(climbStairsDirections.length){
			// if(counter === 0){
			// 	board(xPos)
			// }
			var nextMove = moveHere(climbStairsDirections.shift());

			return nextMove;
		}
		if(cell.up.type === GOLD){
			climbStairsDirections.push('left');
			climbStairsDirections.push('up');
			climbStairsDirections.push('up');
			climbStairsDirections.push('right');
			climbStairsDirections.push('right');
			climbStairsDirections.push('down');
			return 'pickup';
		}

		climbStairsDirections.push('up');
		climbStairsDirections.push('left');
		climbStairsDirections.push('left');
		climbStairsDirections.push('down');
		climbStairsDirections.push('down');
		climbStairsDirections.push('right');
		return 'drop';
	}

	// function searchForBlock(map) {
	// 	// perform A* search if there are cells on mappedCells
	// 	var mapLength = map.length;
	// 	var h = 0;
	// 	var g = 1;
	// 	var f = g + h;

	// 	var openList = [];
	// 	var closedList = [];

	// 	var directionsToNearestBlock = [];
	// 	console.log(xPos + ' ' + yPos)
	// 	function findNearestBlock(map, xPos, yPos, directions) {
	// 		console.log('in recursion!')
	// 		console.log('directions so far!', directions);
	// 		console.log('directionsToNearestBlock so far!', directionsToNearestBlock);

	// 		console.log('map', map)
	// 		if(map[xPos] && map[xPos][yPos].type === BLOCK && 
	// 			 board[xPos][yPos] === false){
	// 			if(directionsToNearestBlock.length === 0 || directions.length < directionsToNearestBlock.length){
	// 				directions.push('pickup');
	// 				directionsToNearestBlock = directions;
	// 				console.log('found a nearby block. directions are: ', directions);
	// 				return;
	// 			}
	// 		}

	// 		if(directionsToNearestBlock.length){
	// 			return;
	// 		}
	// 		// right
	// 		if(map[properIndex(xPos + 1, mapLength)] && map[properIndex(xPos + 1, mapLength)][yPos].type !== WALL && map[properIndex(xPos + 1, mapLength)][yPos].level <= map[xPos][yPos].level){
	// 			directions.push('right');
	// 			findNearestBlock(map, xPos + 1, yPos, directions);
	// 		}
	// 		// up
	// 		if(map[xPos][properIndex(yPos - 1, mapLength)] && map[xPos][properIndex(yPos - 1, mapLength)].type !== WALL && map[xPos][properIndex(yPos - 1, mapLength)].level <= map[xPos][yPos].level){
	// 			directions.push('up');
	// 			findNearestBlock(map, xPos, yPos - 1, directions);
	// 		}
	// 		// left
	// 	  if(map[properIndex(xPos - 1, mapLength)][yPos] && map[properIndex(xPos - 1, mapLength)][yPos].type !== WALL && map[properIndex(xPos - 1, mapLength)][yPos].level <= map[xPos][yPos].level){
	// 			directions.push('left');
	// 			findNearestBlock(map, xPos - 1, yPos, directions);
	// 		}
	// 	  // down
	// 		if(map[xPos][properIndex(yPos + 1, mapLength)] && map[xPos][properIndex(yPos + 1, mapLength)].type !== WALL && map[xPos][properIndex(yPos + 1, mapLength)].level <= map[xPos][yPos].level){
	// 			directions.push('down');
	// 			findNearestBlock(map, xPos, yPos + 1, directions);
	// 		}
	// 		// push surrounding cells into open List
	// 		// openList.push(mappedCells[xPos][properIndex(yPos - 1), mapLength]);
	// 	}
	// 	console.log('DIRECTIONS TO NEAREST BLOCK!', directionsToNearestBlock);
	// 	findNearestBlock(map, xPos, yPos, []);
	// 	// perform DPS if there are no more cells in sight on mappedCells
	// 	return directionsToNearestBlock;
	// }

	// function manHattanHeuristic(pos0, pos1){
 //      var d1 = Math.abs(pos1.x - pos0.x);
 //      var d2 = Math.abs(pos1.y - pos0.y);
 //      return d1 + d2;
	// }






/************************* HELPERS ****************************************/ 
	function moveHere(nextMove){
		var boardLength = board.length
		if(nextMove === 'left'){
			xPos = properIndex(xPos - 1, boardLength);
			return 'left'
		}
		if(nextMove === 'up'){
			yPos = properIndex(yPos - 1, boardLength)
			return 'up'
		}
		if(nextMove === 'right'){
			xPos = properIndex(xPos + 1, boardLength);
			return 'right';
		}
		if(nextMove === 'down'){
			yPos =  properIndex(yPos + 1, boardLength);
			return 'down';
		}
		console.log('ERROR: unexpected input:' + nextMove);
	}

	function isAdjacentCellVisited(nextMove) {
		console.log('checking adjacent')
		console.log('nextMove', nextMove)
		var boardLength = board.length
		if(nextMove === 'left'){
				return board[properIndex(xPos - 1, boardLength)][yPos];
		}
		if(nextMove === 'up'){
				return board[xPos][properIndex(yPos - 1, boardLength)];
		}
		if(nextMove === 'right'){
				return board[properIndex(xPos + 1, boardLength)][yPos];
		}
		if(nextMove === 'down'){
				return board[xPos][properIndex(yPos + 1, boardLength)];				
		}
	}

	function isAdjacentCellTower(cell){
		var boardLength = board.length
		if(cell.left.type === GOLD){
			console.log('found tower...')
			towerX = properIndex(xPos - 1, boardLength);
			towerY = yPos;
			foundTower = true;
			return true;
		}
		if(cell.up.type === GOLD){
			console.log('found tower...')
			towerX = xPos;
			towerY = properIndex(yPos - 1, boardLength);
			foundTower = true;
			return true;
		}
		if(cell.right.type === GOLD){
			console.log('found tower...')
			towerX = properIndex(xPos + 1, boardLength);
			towerY = yPos;
			foundTower = true;
			return true;
		}
		if(cell.down.type === GOLD){
			console.log('found tower...')
			towerX = xPos;
			towerY = properIndex(yPos + 1, boardLength);
			foundTower = true;
			return true;
		}
		return false;
	}

	function moveToBottomOfTower(cell) {
		console.log('moving to bottom')
		if(cell.left.type === GOLD){
			rePosition.push('up');
			rePosition.push('left');
		}
		if(cell.up.type === GOLD){
			atBottomOfTower = true;
		}
		if(cell.right.type === GOLD){
			rePosition.push('down');
			rePosition.push('right');
		}
		if(cell.down.type === GOLD){
			rePosition.push('left');
			rePosition.push('down');
		}
		console.log('rePosition', rePosition);
		// console.log('found tower!');
	}

	function recordCell(cell){
		var mapLength = mappedCells.length;
		// current
		if(!mappedCells[xPos][yPos]){
			mappedCells[xPos][yPos] = cell;
			if(mappedCells[xPos][yPos].type === BLOCK){
				blockCount++;
			}
		}
		// left
		if(!mappedCells[properIndex(xPos - 1, mapLength)][yPos]){
			mappedCells[properIndex(xPos - 1, mapLength)][yPos] = cell.left;
			if(mappedCells[properIndex(xPos - 1, mapLength)][yPos].type === BLOCK){
				blockCount++;
			}
		}
		// up
		if(!mappedCells[xPos][properIndex(yPos - 1), mapLength]){
			mappedCells[xPos][properIndex(yPos - 1), mapLength] = cell.up;
			if(mappedCells[xPos][properIndex(yPos - 1), mapLength].type === BLOCK){
				blockCount++;
			}
		}
		// right
		if(!mappedCells[properIndex(xPos + 1, mapLength)][yPos]){
			mappedCells[properIndex(xPos + 1, mapLength)][yPos] = cell.right;
			if(mappedCells[properIndex(xPos + 1, mapLength)][yPos].type === BLOCK){
				blockCount++;
			}
		}
		// down
		if(!mappedCells[xPos][properIndex(yPos + 1), mapLength]){
			mappedCells[xPos][properIndex(yPos + 1), mapLength] = cell.down;
			if(mappedCells[xPos][properIndex(yPos + 1), mapLength].type === BLOCK){
				blockCount++;
			}
		}

		console.log('mappedCells', mappedCells)
	}

	function buildBoard(size) {
		var grid = new Array(size);
		for(var i = 0; i < size; i++) {
			grid[i] = new Array(size);
			for(var j = 0; j < size; j++){
				grid[i][j] = false;
			}
		}
		// mark the tower and stairs as visited so troll will not search for blocks there.
		if(foundTower) {
			var gridLength = grid.length;
			grid[towerX][towerY] = true; // tower
			grid[towerX][properIndex(towerY + 1, gridLength)] = true; // 1 down
			grid[properIndex(towerX - 1, gridLength)][properIndex(towerY + 1, gridLength)] = true; // 2 down-left
			grid[properIndex(towerX - 1, gridLength)][towerY] = true; // 3 left
			grid[properIndex(towerX - 1, gridLength)][properIndex(towerY - 1, gridLength)] = true; // 4 up-left
			grid[towerX][properIndex(towerY - 1, gridLength)] = true; // 5 up
			grid[properIndex(towerX + 1, gridLength)][properIndex(towerY - 1, gridLength)] = true; // 6 left-down
			grid[properIndex(towerX + 1, gridLength)][towerY] = true; // right 7;
		}
		return grid;
	}


	function orderMappedCells(map){
		var order = 1;
		var orderedMap = new Array();
		var mapLength = map.length;
		for(var i = 0; i < mapLength; i++){
			orderedMap.push([]);
			for(var j = 0; j < map[i].length; j++){
				if(map[i][j] === false){
					var newCell = { order: order }
					orderedMap[i][j] = newCell;
				} else {
					map[i][j].order = order;
					orderedMap[i][j] = map[i][j];
				}
					order++;
			}
		}
		console.log('orderedMap = ', orderedMap);
		return orderedMap;
	}

	function foundBlockCoordinates(map){
		// should output an object with distanceToNearestBlock
		var blockCoords = [];
		var x = 0;
		var y = 0;

		for(var i = 0; i < map.length; i++){
			for(var j = 0; j < map[i].length; j++){
				if(map[i][j].type === BLOCK){
					x = j;
					y = i;
					blockCoords.push({x: x, y: y });					
				}
			}
		}
		return blockCoords;
	}

  //  to account for negative indexes, we perofrm this action to translate the current index
	function properIndex(idx, boardLength){
		return (idx + boardLength) % boardLength;
	}


};



	// valid moves:
	// pickup
	// drop
	// up
	// down
	// left
	// right
