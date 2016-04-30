function Stacker(){
	var queue = [];
	var previouslyVisitedRelation = [];
	var distanceFromOrigin = 0;
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
			// assign all squares a distance from your starting point.
			// if
			var directions = ['left', 'up', 'right', 'down'];
			// cell.distanceFromOrigin = distanceFromOrigin;
			// cell.left.distanceFromOrigin = distanceFromOrigin + 1;
			// cell.right.distanceFromOrigin = distanceFromOrigin + 1;
			// cell.up.distanceFromOrigin = distanceFromOrigin + 1;
			// cell.down.distanceFromOrigin = distanceFromOrigin + 1;
			// distanceFromOrigin += 1;
			return findTower(cell, previouslyVisitedRelation.pop());
		}
		else {
			// find nearest blocks and assign an inceasing number to every block around the towner
			// pickup block and put it in a spiral pattern around the tower.
		}

	}

	function findTower(cell, previouslyVisited){
		var nextMoveDecided = false;
		var actions = ['left', 'up', 'right', 'down'];
		console.log('cell looks like: ', cell);
		if(cell.left.type === GOLD || cell.up.type === GOLD || cell.right.type === GOLD || cell.down.type === GOLD){
			console.log('found the tower!')
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

		while(!validPathFound){
			if(cell[actions[n]].type === WALL || cell[actions[n]] === cell[oppositeDirection[previouslyVisited]]){
				actions.splice(n, 1);
				possibilities -= 1;
				n = Math.random(possibilities) * possibilities >> 0;
			} else {
				validPathFound = true;
			}
		}
		previouslyVisitedRelation.push(actions[n]);
		return actions[n]
	};




// More wizardry here

};



	// Pick an action randomly
	// pickup
	// drop
	// up
	// down
	// left
	// right
