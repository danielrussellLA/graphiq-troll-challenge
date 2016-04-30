function Stacker(){
	var queue = [];
	var previouslyVisitedRelation = [];
	// var distanceFromOrigin = 0;
  // switches
	var foundTower = false;
	var hasBlock = false;
  // cell types
	var
	EMPTY = 0,
	WALL = 1,
	BLOCK = 2,
	GOLD = 3;

	var oppositeDirection = {
		up: 'down',
		down: 'up',
		left: 'right',
		right: 'left'
	}


	this.findBlocks = function(){}
	this.returnToTower = function(){}
	this.stackBlocks = function(){}



// Replace this with your own wizardry
	this.turn = function(cell){
		if(!foundTower){
			var visitNext = findTower(cell, previouslyVisitedRelation.pop());
			return visitNext;
		}
		else {
			// find nearest blocks and assign an inceasing number to every block around the towner
			// pickup block and put it in a spiral pattern around the tower.
		}

	}

	function findTower(cell, previouslyVisited){

		var nextMoveDecided = false;
		var actions = ['left', 'up', 'right', 'down'];

		if(cell.left.type === GOLD || cell.up.type === GOLD || cell.right.type === GOLD || cell.down.type === GOLD){
			console.log('found the tower!');
			foundTower = true;
			return 'drop';
		}
		if(cell.type === BLOCK && !hasBlock){
			console.log('picking up block')
			hasBlock = true;
			return 'pickup';
		}
		var validPathFound = false;
		var possibilities = 4;
		var n = Math.random(possibilities) * possibilities >> 0;

		// console.log('previously visitied cell = ', cell[oppositeDirection[previouslyVisited]]);
		// console.log('previously visitied cell DIRECTION= ', oppositeDirection[previouslyVisited]);

		while(!validPathFound){
			if(stuck(cell)[0] === true){
				return stuck(cell)[1];
			}
			else if(cell[actions[n]].type === WALL || actions[n] === oppositeDirection[previouslyVisited]){
				actions.splice(n, 1);
				possibilities = actions.length;
				n = Math.random(possibilities) * possibilities >> 0;
			} else {
				validPathFound = true;
			}
		}
		previouslyVisitedRelation.push(actions[n]);
		return actions[n];
	};

	function stuck(cell){
		console.log('im stuck!!!!!!')
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
		return [false, null];
	}


// More wizardry here

};



	// Pick an action randomly
	// pickup
	// drop
	// up
	// down
	// left
	// right
