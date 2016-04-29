function Stacker(){
	var queue = [];
	var visited = [];
  // switches
	var foundTower = false;


// cell types
	var
	EMPTY = 0,
	WALL = 1,
	BLOCK = 2,
	GOLD = 3;

	this.findTower = function(cell){
		// breadth first search to the tower
		if(cell.left.type === GOLD || cell.right.type === GOLD || cell.up.type === GOLD || cell.down.type === GOLD){
			console.log('yo found the gold dawg');
			foundTower = true;
		}
		return 'right'
		console.log(cell);
	};

// Replace this with your own wizardry
this.turn = function(cell){
	if(!foundTower){
		//breadth first search to find the tower
		// this.findTower(cell);
		console.log(cell);
	}
	else {
		// find nearest blocks and assign an inceasing number to every block around the towner
		// pickup block and put it in a spiral pattern around the tower.
	}


}

// More wizardry here

};



	// Pick an action randomly
	// var n = Math.random() * 6 >> 0;
	// if (n == 0) return "left";
	// if (n == 1) return "up";
	// if (n == 2) return "right";
	// if (n == 3) return "down";
	// if (n == 4) return "pickup";
	// if (n == 5) return "drop";
