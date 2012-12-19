var Tile = {
  WHITE: 1,
  RED: 2,
  GREEN: 3,
  BLUE: 4,
  EMPTY: 0
};

var Board = function (puzzle) {
  this.puzzle = puzzle;
  this.state = JSON.parse(JSON.stringify(puzzle)); // deep copy

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

Board.prototype.isSolved = function () {
  var normalizedState = JSON.parse(JSON.stringify(this.state)); // deep copy

  var connections = [];

  for (var row = 0; row < normalizedState.length; row++) {
    for (var column = 0; column < normalizedState[row].length; column++) {
      connections[normalizedState[row][column]] = this.puzzle[row][column];
    }
  }

  for (var row = 0; row < normalizedState.length; row++) {
    for (var column = 0; column < normalizedState[row].length; column++) {
      if (normalizedState[row][column] > Tile.WHITE) {
        normalizedState[row][column] = connections[normalizedState[row][column]];
      }
    }
  }

  return JSON.stringify(normalizedState) == JSON.stringify(this.puzzle);
};

var TilePicker = function () {
  this.current = Tile.RED;
};

var View = function (board) {
  this.board = board;
  this.canvas = document.getElementsByTagName("body")[0];

  var html = '';
  for (var row = 0; row < this.board.state.length; row++) {
    for (var column = 0; column < this.board.state[row].length; column++) {
      var tile = this.board.state[row][column];
      var position = String.fromCharCode(row + 65) + (column + 1);

      if (tile == Tile.EMPTY) {
        html += '<div class="slot" data-position="' + position + '"></div>';
      }
      else {
        html += '<div class="tile color-' + tile + '" data-position="' + position + '"></div>';
      }
    }
  }

  html = '<div id="board">' + html + '</div>';

  this.canvas.innerHTML = html;
  this.element = document.getElementById('board');
};

View.prototype.update = function () {
  var tiles = this.element.getElementsByTagName('div');
  for (var i = 0; i < tiles.length; i++) {
    var tile = tiles[i];

    if (!tile.classList.contains('tile')) { continue; }

    var position = tile.attributes['data-position'].value;
    tile.setAttribute('class', 'tile color-' + this.board.getTile(position))
  }
}

/* Main */

function handleInteraction(e) {
  var element = e.toElement || e.target;

  if (element.classList.contains('tile')) {
    var position = element.attributes['data-position'].value;

    board.setTile(position, tilePicker.current)
    view.update();

    if (board.isSolved()) {
      alert('Win!');
    }
  }
}

/*
 0: no tile (slot)
 1: empty tile
>1: colored tile
*/
var puzzle = [
  [2, 2, 2, 0],
  [2, 0, 2, 0],
  [3, 3, 4, 4],
  [3, 0, 0, 4],
  [3, 3, 4, 4]
];

var board = new Board(puzzle);
var view = new View(board);
var tilePicker = new TilePicker();

tilePicker.current = Tile.RED;

view.element.addEventListener('click', handleInteraction);
view.element.addEventListener('touchstart', handleInteraction);