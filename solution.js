function Stacker(){

  /************************* MAIN VARIABLES  ****************************************/
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
  };
  // states
  var currentState = 0;
  var state = {
    towerSearch: 0,
    findBlock: 1,
    buildStairCase: 2,
    GAMEOVER: 3
  };
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
  };
  var foundTower = false;
  var atBottomOfTower = false;
  var towerJustDiscovered = true;
  var stairStatusCompleted = false;
  var rePosition = [];
  var board = [];
  /************************* APP ****************************************/

  this.turn = function(cell){

    // SEARCH FOR TOWER
    if(currentState === state.towerSearch){
      if(firstMove){
        firstMove = false;
        // make a board to easily find visited points
        board = buildBoard(16);
        return 'drop';
      }
      if(foundTower){
        if(!atBottomOfTower && currentState === state.towerSearch){
          moveToBottomOfTower(cell);
          return moveHere(rePosition.shift()) || 'drop';
        }
        if(atBottomOfTower){
          // clear board again so troll will re-start his smartSearch and not to search for blocks around the tower
          board = buildBoard(16);
          moveHistory.length = 0;
          currentState = state.findBlock;
        }
      } else {
        return smartSearch(cell);
      }
    }

    // SEARCH FOR NEAREST BLOCK
    if(currentState === state.findBlock){
      if(towerJustDiscovered){
        recordCell(cell);
        return getStairStatus(cell);
      }
      if(stairStatusCompleted && !atBottomOfTower){
        moveToBottomOfTower(cell);
        return moveHere(rePosition.shift()) || 'drop';
      }
      return smartSearch(cell);
    }

    // BUILD STAIRCASE
    if(currentState === state.buildStairCase){
      recordCell(cell);
      return buildStairCase(cell);
    }

    // GAME OVER
    if(currentState === state.GAMEOVER){
      console.log('you won!');
      return;
    }
  };

  /************************* MAIN ****************************************/
  function smartSearch(cell){

    if(currentState === state.towerSearch){
      if(isAdjacentCellTower(cell)){
        foundTower = true;
        return 'drop';
      }
    }

    if(currentState === state.findBlock){
      if(isCurrentCellBlock(cell) && hasBlock === false && !isAdjacentCellTower(cell)){
        hasBlock = true;
        finishedDescendingStairs = false;
        return 'pickup';
      }
      if(hasBlock){
        if(isAdjacentCellTower(cell)){
          currentState = state.buildStairCase;
          // you have a block so pickup will do nothing. we just want to be able to fire buildStaircase.
          return 'pickup';
        }
        var stepBackToTower = moveHistory.pop();
        return moveHere(stepBackToTower);
      }
      if(isAdjacentCellBlock(cell) !== false && hasBlock === false){
        var moveToBlock = isAdjacentCellBlock(cell);
        if(!isAdjacentCellVisited(moveToBlock)){
          moveHistory.push(opposite[moveToBlock]);
          return moveHere(moveToBlock);
        }
      }
    }

    // set walls as visited so troll doesn't run into them a bunch of times.
    avoidWalls(cell);

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
    var randomMove = move[Math.random() * move.length >> 0];
    return moveHere(previousMove) || moveHere(randomMove);
  }

  function isCurrentCellBlock(cell){
    if(cell.type === BLOCK){
      return true;
    }
    return false;
  }

  function isAdjacentCellBlock(cell){
    if(cell.left.type === BLOCK && board[positiveIdx(xPos - 1, board.length)][yPos].stairCaseCell !== true){
      return 'left';
    }
    if(cell.up.type === BLOCK && board[xPos][positiveIdx(yPos - 1, board.length)].stairCaseCell !== true){
      return 'up';
    }
    if(cell.right.type === BLOCK && board[positiveIdx(xPos + 1, board.length)][yPos].stairCaseCell !== true){
      return 'right';
    }
    if(cell.down.type === BLOCK && board[xPos][positiveIdx(yPos + 1, board.length)].stairCaseCell !== true){
      return 'down';
    }
    return false;
  }

  var directionsToBuildStairs = [];
  var justPlacedABlock = false;
  function buildStairCase(cell){
    if(stairs['7'].level === 7){
      currentState = state.GAMEOVER;
      return moveHere('left');
    }

    if(directionsToBuildStairs.length){
      if(directionsToBuildStairs[0] === 'drop'){
        return directionsToBuildStairs.shift();
      }
      return moveHere(directionsToBuildStairs.shift());
    }


    if(determineWhichCellToAddTo(stairs) === 7 && !justPlacedABlock){
      directionsToBuildStairs.push('left');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('right');
      directionsToBuildStairs.push('right');
      directionsToBuildStairs.push('down');
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }
    if(determineWhichCellToAddTo(stairs) === 6 && !justPlacedABlock){
      directionsToBuildStairs.push('left');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('right');
      directionsToBuildStairs.push('right');
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }
    if(determineWhichCellToAddTo(stairs) === 5 && !justPlacedABlock){
      directionsToBuildStairs.push('left');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('right');
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }
    if(determineWhichCellToAddTo(stairs) === 4 && !justPlacedABlock){
      directionsToBuildStairs.push('left');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }
    if(determineWhichCellToAddTo(stairs) === 3 && !justPlacedABlock){
      directionsToBuildStairs.push('left');
      directionsToBuildStairs.push('up');
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }
    if(determineWhichCellToAddTo(stairs) === 2 && !justPlacedABlock){
      directionsToBuildStairs.push('left');
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }
    if(determineWhichCellToAddTo(stairs) === 1 && !justPlacedABlock){
      directionsToBuildStairs.push('drop');
      justPlacedABlock = true;
      return 'pickup';
    }


    if(!isAtBottomOfTower(cell)) {
      recordCell(cell);
      return descendStairsFrom(xPos, yPos);
    }
    if(isAtBottomOfTower(cell)) {
      justPlacedABlock = false;
      finishedDescendingStairs = true;
      board = buildBoard(16);
      hasBlock = false;
      currentState = state.findBlock;
      return 'drop';
    }

  }

  /************************* HELPERS ****************************************/

  function moveHere(nextMove){
    var boardLength = board.length;
    if(nextMove === 'left'){
      xPos = positiveIdx(xPos - 1, boardLength);
      return 'left';
    }
    if(nextMove === 'up'){
      yPos = positiveIdx(yPos - 1, boardLength);
      return 'up';
    }
    if(nextMove === 'right'){
      xPos = positiveIdx(xPos + 1, boardLength);
      return 'right';
    }
    if(nextMove === 'down'){
      yPos =  positiveIdx(yPos + 1, boardLength);
      return 'down';
    }
  }

  function avoidWalls(cell){
    if(board[xPos][yPos] === false){
      var boardLength = board.length;
      board[xPos][yPos] = true;
      if(cell.left.type === WALL || cell.left.level - 1 > cell.level){
        board[positiveIdx(xPos - 1, boardLength)][yPos] = true;
      }
      if(cell.right.type === WALL || cell.right.level - 1 > cell.level){
        board[positiveIdx(xPos + 1, boardLength)][yPos] = true;
      }
      if(cell.up.type === WALL || cell.up.level - 1 > cell.level){
        board[xPos][positiveIdx(yPos - 1, boardLength)] = true;
      }
      if(cell.down.type === WALL || cell.down.type - 1 > cell.level){
        board[xPos][positiveIdx(yPos + 1, boardLength)] = true;
      }
    }
  }


  function isAdjacentCellVisited(nextMove) {
    var boardLength = board.length;
    if(nextMove === 'left'){
      return board[positiveIdx(xPos - 1, boardLength)][yPos];
    }
    if(nextMove === 'up'){
      return board[xPos][positiveIdx(yPos - 1, boardLength)];
    }
    if(nextMove === 'right'){
      return board[positiveIdx(xPos + 1, boardLength)][yPos];
    }
    if(nextMove === 'down'){
      return board[xPos][positiveIdx(yPos + 1, boardLength)];
    }
  }

  function isAdjacentCellTower(cell){
    var boardLength = board.length;
    if(cell.left.type === GOLD){
      towerX = positiveIdx(xPos - 1, boardLength);
      towerY = yPos;
      foundTower = true;
      return true;
    }
    if(cell.up.type === GOLD){
      towerX = xPos;
      towerY = positiveIdx(yPos - 1, boardLength);
      foundTower = true;
      return true;
    }
    if(cell.right.type === GOLD){
      towerX = positiveIdx(xPos + 1, boardLength);
      towerY = yPos;
      foundTower = true;
      return true;
    }
    if(cell.down.type === GOLD){
      towerX = xPos;
      towerY = positiveIdx(yPos + 1, boardLength);
      foundTower = true;
      return true;
    }
    return false;
  }

  function determineWhichCellToAddTo(stairs){
    var levels = [];

    for(var key in stairs){
      levels.push(stairs[key].level);
    }

    if(levels[levels.length - 1] === 0){
      return levels.length;
    }

    for(var i = levels.length - 1; i >= 0; i--){
      for(var j = levels.length - 1; j >= 0; j--){
        // if not all equal
        if(levels[i] !== levels[j]){
          // and if the current number is less than its index + 1
          if(levels[j] < j + 1){
            // add one to the block that needs it next
            return j + 1;
          }
        }
      }
    }
    // else return the 7th cell
    return levels.length;
  }

  function moveToBottomOfTower(cell) {
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
  }

  function isAtBottomOfTower(cell){
    if(cell.up.type === GOLD){
      return true;
    }
    return false;
  }

  function descendStairsFrom(stair) {
    var boardLength = board.length;
    // board[xPos][yPos] = cell;
    // bottom
    if(xPos === towerX && yPos === positiveIdx(towerY + 1, boardLength)){
      return 'drop';
    }
    // bottom-left
    if(xPos === positiveIdx(towerX - 1, boardLength) && yPos === positiveIdx(towerY + 1, boardLength)){
      return moveHere('right');
    }
    // left
    if(xPos === positiveIdx(towerX - 1, boardLength) && yPos === towerY){
      return moveHere('down');
    }
    // up-left
    if(xPos === positiveIdx(towerX - 1, boardLength) && yPos === positiveIdx(towerY - 1, boardLength)){
      return moveHere('down');
    }
    // up
    if(xPos === towerX && yPos === positiveIdx(towerY - 1, boardLength)){
      return moveHere('left');
    }
    // up-right
    if(xPos === positiveIdx(towerX + 1, boardLength) && yPos === positiveIdx(towerY - 1, boardLength)){
      return moveHere('left');
    }
    // right
    if(xPos === positiveIdx(towerX + 1, boardLength) && yPos === towerY){
      return moveHere('up');
    }
  }

  var climbStairsDirections = [];
  var calledOnce = 0;
  function getStairStatus(cell){
    if(climbStairsDirections.length){
      var nextMove = moveHere(climbStairsDirections.shift());
      return nextMove;
    }
    if(calledOnce > 0){
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
      return 'drop';
    }
  }

  // record cells around the tower to prevent troll from visiting them again during block search
  function recordCell(cell){
    var boardLength = board.length;
    // bottom
    if(xPos === towerX && yPos === positiveIdx(towerY + 1, boardLength)){
      stairs['1'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
    }
    // bottom-left
    if(xPos === positiveIdx(towerX - 1, boardLength) && yPos === positiveIdx(towerY + 1, boardLength)){
      stairs['2'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
    }
    // left
    if(xPos === positiveIdx(towerX - 1, boardLength) && yPos === towerY){
      stairs['3'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
    }
    // up-left
    if(xPos === positiveIdx(towerX - 1, boardLength) && yPos === positiveIdx(towerY - 1, boardLength)){
      stairs['4'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
    }
    // up
    if(xPos === towerX && yPos === positiveIdx(towerY - 1, boardLength)){
      stairs['5'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
    }
    // up-right
    if(xPos === positiveIdx(towerX + 1, boardLength) && yPos === positiveIdx(towerY - 1, boardLength)){
      stairs['6'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
    }
    // right
    if(xPos === positiveIdx(towerX + 1, boardLength) && yPos === towerY){
      stairs['7'] = cell;
      board[xPos][yPos] = cell;
      board[xPos][yPos].stairCaseCell = true;
      towerJustDiscovered = false;
    }
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
      grid[towerX][positiveIdx(towerY + 1, gridLength)] = stairs['1'] || true; // 1 down
      grid[positiveIdx(towerX - 1, gridLength)][positiveIdx(towerY + 1, gridLength)] = stairs['2'] || true; // 2 down-left
      grid[positiveIdx(towerX - 1, gridLength)][towerY] = stairs['3'] || true; // 3 left
      grid[positiveIdx(towerX - 1, gridLength)][positiveIdx(towerY - 1, gridLength)] = stairs['4'] || true; // 4 up-left
      grid[towerX][positiveIdx(towerY - 1, gridLength)] = stairs['5'] || true; // 5 up
      grid[positiveIdx(towerX + 1, gridLength)][positiveIdx(towerY - 1, gridLength)] = stairs['6'] || true; // 6 up-right
      grid[positiveIdx(towerX + 1, gridLength)][towerY] = stairs['7'] || true; // right 7;
    }
    return grid;
  }

  //  to account for negative indexes, we perofrm this action to translate the index to a positiveIdx integer
  function positiveIdx(idx, boardLength){
    return (idx + boardLength) % boardLength;
  }

}
