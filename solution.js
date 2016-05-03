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
	var move = ['right', 'up', 'left', 'down'];
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
	var atBottomOfTower = false;
	var rePosition = [];
	var board = new Array();


	

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
				if(!atBottomOfTower && currentState === state.towerSearch){
					moveToBottomOfTower(cell);
					console.log(rePosition)
					return moveHere(rePosition.shift()) || 'drop';
				}
				if(atBottomOfTower){
					currentState = state.findBlock;
					console.log('atBottomOfTower');
				}
				
			} else {
				// mapCells(cell);
				return searchFor(cell, GOLD)
			}
		}
		if(currentState === state.findBlock){
			console.log('lets find a block...')
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
			if(isAdjacentCellTower(cell)){
				foundTower = true;
				return 'drop'
			}
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
		for(var i = 0; i < move.length; i++){
			var index = i
			var nextMove = move[index];
			if(!isAdjacentCellVisited(nextMove)){
				moveHistory.push(opposite[nextMove]);
				return moveHere(nextMove);
			}
		}
		// if we're stuck, move to the previous position and update coordinates so we have access to what we previously visited
		var previousMove = moveHistory.pop();
		// if there are no more moves in our history (which happens rarely) then just pick a random move so we arent stuck
		// var random = Math.random() * move.length >> 0;

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
