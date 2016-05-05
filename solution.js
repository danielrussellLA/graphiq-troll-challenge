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
	var stairs = {
		'1': null,
		'2': null,
		'3': null,
		'4': null,
		'5': null,
		'6': null,
		'7': null
	}
	var foundTower = false;
	var atBottomOfTower = false;
	var towerJustDiscovered = true;
	var stairStatusCompleted = false;
	var rePosition = [];
	var board = new Array();
	
	// make a copy of the board to record the visited cells' contents to use in findblock mode
	var mappedCells = buildBoard(16);

	var blockCount = 0;


/************************* APP ****************************************/ 
	this.turn = function(cell){
		// record current cell and its surrounding cells on mappedCells. 
		// this will be important during block finding stage

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
					// clear board again so troll will re-start his smartSearch and not to search for blocks around the tower					
					board = buildBoard(16);
					moveHistory.length = 0;
					currentState = state.findBlock;
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
				// towerJustDiscovered = false;
		    recordCell(cell);
		    return getStairStatus(cell);
				// give every cell a number in mappedCells to help with A* search calculations
				// orderMappedCells(mappedCells);
			}
			if(stairStatusCompleted && !atBottomOfTower){
				console.log('trying togo baco to bottom of tower')
				 moveToBottomOfTower(cell);
				 return moveHere(rePosition.shift()) || 'drop';
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
	var calledOnce = 0;
	function getStairStatus(cell){
		console.log('climbingStairs');
		console.log('climbStairsDirections', climbStairsDirections);
		if(climbStairsDirections.length){
			// if(counter === 0){
			// 	board(xPos)
			// }
			var nextMove = moveHere(climbStairsDirections.shift());
			return nextMove;
		}

		if(calledOnce > 0){
			console.log('reassigning stairStatusCompleted');
			atBottomOfTower = false;
			towerJustDiscovered = false;
			stairStatusCompleted = true;
			return 'drop';
		}

		if(cell.up.type === GOLD){
			climbStairsDirections.push('left');
			climbStairsDirections.push('up');
			climbStairsDirections.push('up');
			climbStairsDirections.push('right');
			climbStairsDirections.push('right');
			climbStairsDirections.push('down');
			calledOnce++;
			return 'pickup';
		}

		// climbStairsDirections.push('up');
		// climbStairsDirections.push('left');
		// climbStairsDirections.push('left');
		// climbStairsDirections.push('down');
		// climbStairsDirections.push('down');
		// climbStairsDirections.push('right');
		// return 'drop';
	}


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
		var boardLength = board.length;
		// board[xPos][yPos] = cell;
		// bottom
		if(xPos === towerX && yPos === properIndex(towerY + 1, boardLength)){
			stairs['1'] = cell;
			board[xPos][yPos] = cell;
		}
		// bottom-left
		if(xPos === properIndex(towerX - 1, boardLength) && yPos === properIndex(towerY + 1, boardLength)){
			stairs['2'] = cell;
			board[xPos][yPos] = cell;
		}
		// left
		if(xPos === properIndex(towerX - 1, boardLength) && yPos === towerY){
			stairs['3'] = cell;
			board[xPos][yPos] = cell;
		}
		// up-left
		if(xPos === properIndex(towerX - 1, boardLength) && yPos === properIndex(towerY - 1, boardLength)){
			stairs['4'] = cell;
			board[xPos][yPos] = cell;
		}
		// up
		if(xPos === towerX && yPos === properIndex(towerY - 1, boardLength)){
			stairs['5'] = cell;
			board[xPos][yPos] = cell;
		}
		// up-right
		if(xPos === properIndex(towerX + 1, boardLength) && yPos === properIndex(towerY - 1, boardLength)){
			stairs['6'] = cell;
			board[xPos][yPos] = cell;
		}
		if(xPos === properIndex(towerX + 1, boardLength) && yPos === towerY){
			stairs['7'] = cell;
			board[xPos][yPos] = cell;
			towerJustDiscovered = false;
			// currentState = state.findBlock;
		}
		// board[towerX][towerY] = true; // tower
		// board[towerX][properIndex(towerY + 1, boardLength)] = true; // 1 down
		// board[properIndex(towerX - 1, boardLength)][properIndex(towerY + 1, boardLength)] = true; // 2 down-left
		// board[properIndex(towerX - 1, boardLength)][towerY] = true; // 3 left
		// board[properIndex(towerX - 1, boardLength)][properIndex(towerY - 1, boardLength)] = true; // 4 up-left
		// board[towerX][properIndex(towerY - 1, boardLength)] = true; // 5 up
		// board[properIndex(towerX + 1, boardLength)][properIndex(towerY - 1, boardLength)] = true; // 6 up-right
		// board[properIndex(towerX + 1, boardLength)][towerY] = true; // right 7;
		// current
		// if(!board[xPos][yPos]){
		// 	board[xPos][yPos] = cell;
		// 	if(board[xPos][yPos].type === BLOCK){
		// 		blockCount++;
		// 	}
		// }
		// // left
		// if(!board[properIndex(xPos - 1, boardLength)][yPos]){
		// 	board[properIndex(xPos - 1, boardLength)][yPos] = cell.left;
		// 	if(board[properIndex(xPos - 1, boardLength)][yPos].type === BLOCK){
		// 		blockCount++;
		// 	}
		// }
		// // up
		// if(!board[xPos][properIndex(yPos - 1), boardLength]){
		// 	board[xPos][properIndex(yPos - 1), boardLength] = cell.up;
		// 	if(board[xPos][properIndex(yPos - 1), boardLength].type === BLOCK){
		// 		blockCount++;
		// 	}
		// }
		// // right
		// if(!board[properIndex(xPos + 1, boardLength)][yPos]){
		// 	board[properIndex(xPos + 1, boardLength)][yPos] = cell.right;
		// 	if(board[properIndex(xPos + 1, boardLength)][yPos].type === BLOCK){
		// 		blockCount++;
		// 	}
		// }
		// // down
		// if(!board[xPos][properIndex(yPos + 1), boardLength]){
		// 	board[xPos][properIndex(yPos + 1), boardLength] = cell.down;
		// 	if(board[xPos][properIndex(yPos + 1), boardLength].type === BLOCK){
		// 		blockCount++;
		// 	}
		// }
		console.log('+++++ RECORD CELL: board', board);
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
