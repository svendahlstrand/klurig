var Tile = function () {};
Tile.WHITE = 1;
Tile.RED = 2;
Tile.GREEN = 3;
Tile.BLUE = 4;
Tile.EMPTY = 0;

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

Board.ROW_LABELS = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

Board.prototype.setUp = function (element) {
  var html = '';
  for (var row = 0; row < this.state.length; row++) {
    for (var column = 0; column < this.state[row].length; column++) {
      var isTile = this.state[row][column];
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

  element.innerHTML = html;
};

Board.prototype.update = function () {
  var tiles = document.getElementById('board').getElementsByTagName('div');
  for (var i = 0; i < tiles.length; i++) {
    var tile = tiles[i];

    if (!tile.classList.contains('tile')) { continue; }

    var position = tile.attributes['data-position'].value;
    tile.setAttribute('class', 'tile color-' + this.getTile(position))
  }
}

Board.prototype.getTile = function (position) {
  var row = Board.ROW_LABELS[position[0]];
  var column = position[1] - 1;

  return this.state[row][column];
};

Board.prototype.setTile = function (position, tile) {
  var row = Board.ROW_LABELS[position[0]];
  var column = position[1] - 1;

  this.state[row][column] = tile;
};

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
board.setUp(document.getElementsByTagName("body")[0]);

window.onmouseup = function (e) {
  var element = e.toElement;
  if (element.classList.contains('tile')) {
    var position = element.attributes['data-position'].value;
    board.setTile(position, Tile.RED)
    board.update();
  }
}