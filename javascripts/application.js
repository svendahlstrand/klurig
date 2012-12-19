var Tile = {
  WHITE: 1,
  RED: 2,
  GREEN: 3,
  BLUE: 4,
  EMPTY: 0
};

var Board = function (puzzle) {
  this.puzzle = puzzle;
  this.state = puzzle;

  // Reset board state to show blank tiles
  for (var row = 0; row < this.state.length; row++) {
    for (var column = 0; column < this.state[row].length; column++) {
      if (this.state[row][column] > Tile.EMPTY) {
        this.state[row][column] = Tile.WHITE;
      }
    }
  }
};

Board.prototype.getTile = function (position) {
  var row = position.charCodeAt(0) - 65;
  var column = position[1] - 1;

  return this.state[row][column];
};

Board.prototype.setTile = function (position, tile) {
  var row = position.charCodeAt(0) - 65;
  var column = position[1] - 1;

  this.state[row][column] = tile;
};

var View = function (board) {
  this.board = board;
  this.canvas = document.getElementsByTagName("body")[0];
};

View.prototype.initialize = function () {
  var html = '';
  for (var row = 0; row < this.board.state.length; row++) {
    for (var column = 0; column < this.board.state[row].length; column++) {
      var isTile = this.board.state[row][column];
      var position = String.fromCharCode(row + 65) + (column + 1);

      if (isTile) {
        html += '<div class="tile color-' + isTile + '" data-position="' + position + '"></div>';
      }
      else {
        html += '<div class="slot" data-position="' + position + '"></div>';
      }
    }
  }

  html = '<div id="board">' + html + '</div>';

  this.canvas.innerHTML = html;
}

View.prototype.update = function () {
  var tiles = this.canvas.getElementsByTagName('div');
  for (var i = 0; i < tiles.length; i++) {
    var tile = tiles[i];

    if (!tile.classList.contains('tile')) { continue; }

    var position = tile.attributes['data-position'].value;
    tile.setAttribute('class', 'tile color-' + this.board.getTile(position))
  }
}

/* Main */

/*
 0: no tile (slot)
 1: empty tile
>1: colored tile
*/

var puzzle = [
  [2, 2, 2],
  [3, 4, 0],
  [3, 4, 0],
  [3, 4, 0]
];

var board = new Board(puzzle);
var view = new View(board);

view.initialize();

function handleInteraction(e) {
  var element = e.toElement || e.target;

  if (element.classList.contains('tile')) {
    var position = element.attributes['data-position'].value;
    board.setTile(position, Tile.RED)
    view.update();
  }
}

document.addEventListener('click', handleInteraction);
document.addEventListener('touchstart', handleInteraction);