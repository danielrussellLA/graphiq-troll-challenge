function Stacker(){
	

	var
	EMPTY = 0,
	WALL = 1,
	BLOCK = 2,
	GOLD = 3;


	// setup states
	var currentState = 0;
	var state = {
		towerSearch: 0,
		findBlock: 1,
		returnToBottomOfTower: 2,
		buildStairCase: 3,
		GAMEOVER: 4
	}
	// troll stats
	var xPos = 0;
	var yPos = 0;
	var firstMove = true;
	var hasBlock = false;
	var moveHistory = [];
	// directions
	var move = ['left', 'up', 'right', 'down'];
	var opposite = {
		up: 'down',
		down: 'up',
		left: 'right',
		right: 'left'
	}
	// board and tower stats
	var towerX = -1;
	var towerY = -1;
	var foundTower = false;
	var board = new Array();


	var rePosition = [];
	

// Replace this with your own wizardry
	this.turn = function(cell){
		if(currentState === state.towerSearch){
			if(firstMove){
				firstMove = false;
				buildBoard(16);
				return 'drop';
			}
			if(foundTower){
				console.log('found the tower...')
				return;
			} else {
				// mapCells(cell);
				isAdjacentCellTower(cell);
				return searchFor(cell, GOLD)
			}
		}
		if(currentState === state.findBlock){

		}
		if(currentState === state.returnToBottomOfTower){

		}
		if(currentState === state.buildStairCase){

		}
		if(currentState === state.GAMEOVER){
			console.log('you won!');
			return;
		}
	}

	function searchFor(cell, target){
		console.log('board', board)

		if(currentState === state.towerSearch){
			// board = buildBoard(16);
			// moveHistory = new Array();
		}

		// set walls as visited so we don't run into them a bunch of times.
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

		// decide where to go next
		var random = Math.random() * move.length >> 0;
		for(var i = 0; i < move.length; i++){
			var index = i
			var nextMove = move[index];
			if(!adjacentCellVisited(nextMove)){
				moveHistory.push(opposite[nextMove]);
				return moveHere(nextMove);
			}
		}
		// if we're stuck, move to the previous position and update coordinates so we have access to what we previously visited
		var previousMove = moveHistory.pop()
		return moveHere(previousMove);
	}

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


	function adjacentCellVisited(nextMove) {
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


	function buildBoard(size) {
		board = new Array(size);
		for(var i = 0; i < size; i++) {
			board[i] = new Array(size);
			for(var j = 0; j < size; j++){
				board[i][j] = false;
			}
		}
		// mark the tower and stairs as visited so troll will not search for blocks there.
		if(foundTower) {
			var boardLength = board.length;
			board[towerX][towerY] = true; // tower
			board[towerX][properIndex(towerY + 1, boardLength)] = true; // 1 down
			board[properIndex(towerX - 1, boardLength)][properIndex(towerY + 1, boardLength)] = true; // 2 down-left
			board[properIndex(towerX - 1, boardLength)][towerY] = true; // 3 left
			board[properIndex(towerX - 1, boardLength)][properIndex(towerY - 1, boardLength)] = true; // 4 up-left
			board[towerX][properIndex(towerY - 1, boardLength)] = true; // 5 up
			board[properIndex(towerX + 1, boardLength)][properIndex(towerY - 1, boardLength)] = true; // 6 left-down
			board[properIndex(towerX + 1, boardLength)][towerY] = true; // right 7;
		}

	}

	function returnToBlockBelowTower(){

	}

	function buildStaircase(){

	}


	function mapCells(cell){
		var up = cell.up,
		left = cell.left,
		right = cell.right,
		down = cell.down

		if(board[xPos] === undefined){
			board[xPos] = new Array();
			board[xPos][yPos] = cell;
			board[xPos][yPos].visited = true;
		} else if(board[xPos][yPos] && board[xPos][yPos].visited) {
			// board[xPos][yPos] = cell;
			console.log('let us add another visited!')
			// board[xPos][yPos].visited += 1;
		} else {
			board[xPos][yPos] = cell;
			board[xPos][yPos].visited = true;
		}
		console.log('board[xPos][yPos]',board[xPos][yPos]);

		if(board[xPos - 1] === undefined) {
			board[xPos - 1] = new Array();
			board[xPos - 1][yPos] = up;
			board[xPos - 1][yPos].type === WALL ? board[xPos - 1][yPos].visited = true : board[xPos - 1][yPos].visited = false;
		} 
		else if(board[xPos - 1][yPos] === undefined) {
			board[xPos - 1][yPos] = up;
			board[xPos - 1][yPos].type === WALL ? board[xPos - 1][yPos].visited = true: board[xPos - 1][yPos].visited = false;
		}

		if(board[xPos][yPos - 1] === undefined) {
			board[xPos][yPos - 1] = left; 
			board[xPos][yPos - 1].type === WALL ? board[xPos][yPos - 1].visited = true : board[xPos][yPos - 1].visited = false;
		} 
		// else {
		// 	board[xPos][yPos - 1] = left; 
		// }

		if(board[xPos][yPos + 1] === undefined){
			board[xPos][yPos + 1] = right;
			board[xPos][yPos + 1].type === WALL ? board[xPos][yPos + 1].visited = true : board[xPos][yPos + 1].visited = false;

		} 
		// else {
		// 	board[xPos][yPos + 1] = right;
		// }

		if(board[xPos + 1] === undefined){
			board[xPos + 1] = new Array();
			board[xPos + 1][yPos] = down;
			board[xPos + 1][yPos].type === WALL ? board[xPos + 1][yPos].visited = true : board[xPos + 1][yPos].visited = false;

		} 
		else if(board[xPos + 1][yPos] === undefined){
			board[xPos + 1][yPos] = down;
			board[xPos + 1][yPos].type === WALL ? board[xPos + 1][yPos].visited = true : board[xPos + 1][yPos].visited = false;
		}
		
		// if(board[xPos][yPos].visited){
		// 		console.log('plus one!!!!!!!!')
		// 		board[xPos][yPos].visited += 1;
		// 	} else {
		// 		console.log('initiating visited!')
		// 		board[xPos][yPos].visited = 1;
		// 	}

		console.log('board is: ', board);
	}



	function validMoves(cell){
		var moves = [];
		// var numberOfVisits = {
		// 	left: board[xPos][yPos - 1].visited,
		// 	up: board[xPos - 1][yPos].visited,
		// 	right: board[xPos][yPos + 1].visited,
		// 	down: board[xPos + 1][yPos].visited
		// };

		for(var key in cell){
			if(key === 'left' ||
				 key === 'up'   ||
				 key === 'right'||
				 key === 'down'){
				if(cell[key].type !== WALL){
					// up
					//  
					if(!board[xPos - 1][yPos].visited && moves.indexOf(key) === -1){
						moves.push(key);
						
					}
					// left
					else if(!board[xPos][yPos - 1].visited && moves.indexOf(key) === -1){
						moves.push(key);
						
					}
					// right
					else if(!board[xPos][yPos + 1].visited && moves.indexOf(key) === -1){
						moves.push(key);
						
					}
					// down
					else {
						moves.push(key);
						
					}

				}
			}
		}


		console.log('UP IS: ', board[xPos - 1][yPos]);
		console.log('LEFT IS: ', board[xPos][yPos - 1]);
		console.log('RIGHT IS: ', board[xPos][yPos + 1]);
		console.log('DOWN IS: ', board[xPos + 1][yPos]);


		console.log('moves', moves)
		return moves;
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
		if(cell.left.type === GOLD){
			rePosition.push('down');
			rePosition.push('left');
		}
		if(cell.up.type === GOLD){
			rePosition = [];
		}
		if(cell.right.type === GOLD){
			rePosition.push('down');
			rePosition.push('right');
		}
		if(cell.down.type === GOLD){
			rePosition.push('left');
			rePosition.push('down');
			rePosition.push('down');
			rePosition.push('right');
		}
		// console.log('rePosition', rePosition);
		// console.log('found tower!');
	}


	// Helper Functions:
	function stuck(cell){
		// console.log('im stuck!!!!!!');
		if(cell.up.type === WALL && cell.left.type === WALL && cell.right.type === WALL){
			return [true, 'down'];
		}
		if(cell.left.type === WALL && cell.down.type === WALL && cell.right.type === WALL){
			return [true, 'up'];
		}
		if(cell.up.type === WALL && cell.left.type === WALL && cell.down.type === WALL){
			return [true, 'right'];
		}
		if(cell.up.type === WALL && cell.right.type === WALL && cell.down.type === WALL){
			return [true, 'left'];
		}
		return [false, null]
	}

  //  to account for negative indexes, we perofrm this action to translate the current index
	function properIndex(idx, boardLength){
		return (idx + boardLength) % boardLength;
	}


};



	// Pick an action randomly
	// pickup
	// drop
	// up
	// down
	// left
	// right
