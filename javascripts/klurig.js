// Models
// ------

var Tile = {
  RED: 1,
  GREEN: 2,
  BLUE: 3,
  WHITE: 9,
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
      if (normalizedState[row][column] == Tile.WHITE) { return false; }
      connections[normalizedState[row][column]] = this.puzzle[row][column];
    }
  }

  for (var row = 0; row < normalizedState.length; row++) {
    for (var column = 0; column < normalizedState[row].length; column++) {
      normalizedState[row][column] = connections[normalizedState[row][column]];
    }
  }

  return JSON.stringify(normalizedState) == JSON.stringify(this.puzzle);
};

var TilePicker = function () {
  this.current = Tile.RED;
};

// Views
// -----

var BoardView = function (board, controller) {
  this.board = board;
  this.canvas = document.getElementById('board');

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

  this.canvas.innerHTML = html;

  this.canvas.addEventListener('click', controller.handleInteraction);
  this.canvas.addEventListener('touchstart', controller.handleInteraction);
};

BoardView.prototype.render = function () {
  var tiles = this.canvas.getElementsByTagName('div');
  for (var i = 0; i < tiles.length; i++) {
    var tile = tiles[i];

    if (!tile.classList.contains('tile')) { continue; }

    var position = tile.attributes['data-position'].value;
    tile.setAttribute('class', 'tile color-' + this.board.getTile(position));
  }
};

var TilePickerView = function (controller) {
  this.canvas = document.getElementById('tile-picker');

  this.canvas.addEventListener('click', controller.changeTilePicker);
};

// Controller
// ----------

var GameController = function (board, tilePicker) {
  this.board = board;
  this.tilePicker = tilePicker;
};

GameController.prototype.handleInteraction = function (e) {
  var element = e.target;

  if (element.classList.contains('tile')) {
    var position = element.attributes['data-position'].value;

    board.setTile(position, tilePicker.current);
    boardView.render();

    if (board.isSolved()) {
      alert('Win!');
    }
  }
};

GameController.prototype.changeTilePicker = function (e) {
  tilePicker.current = Tile[e.target.attributes['data-value'].value];

  e.preventDefault();
};

// Puzzle
// ------
// * 0: no tile (slot)
// * >1: colored tile
// * 9: empty tile

var puzzle = [
  [1, 1, 1, 0],
  [1, 0, 1, 0],
  [2, 2, 3, 3],
  [2, 0, 0, 3],
  [2, 2, 3, 3]
];

// Application
// -----------

var board = new Board(puzzle);
var tilePicker = new TilePicker();

var gameController = new GameController(board, tilePicker);

var boardView = new BoardView(board, gameController);
var tilePickerView = new TilePickerView(gameController);