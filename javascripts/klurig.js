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
  this.observers = [];
  this.prepare(puzzle);
};

Board.prototype.getTile = function (position) {
  var row = position.charCodeAt(0) - 65;
  var column = position[1] - 1;

  return this.state[row][column];
};

Board.prototype.setTile = function (position) {
  var row = position.charCodeAt(0) - 65;
  var column = position[1] - 1;

  if (this.state[row][column] != Tile.EMPTY) {
    this.state[row][column] = this.currentTileColor;
    this.notifyObservers();
  }
};

Board.prototype.prepare = function (puzzle) {
  this.puzzle = puzzle;
  this.state = JSON.parse(JSON.stringify(puzzle)); // deep copy
  this.currentTileColor = Tile.RED;

  var colors = {};

  // Reset board state to show blank tiles
  for (var row = 0; row < this.state.length; row++) {
    for (var column = 0; column < this.state[row].length; column++) {
      if (this.state[row][column] > Tile.EMPTY) {
        colors[this.state[row][column]] = true;
        this.state[row][column] = Tile.WHITE;
      }
    }
  }

  this.colors = Object.keys(Tile).slice(0, Object.keys(colors).length);
  this.notifyObservers('preparedPuzzle');
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

Board.prototype.addObserver = function (observer, context) {
  this.observers.push({block: observer, context: context || null});
};

Board.prototype.notifyObservers = function () {
  for (var i = 0; i < this.observers.length; i++) {
    var observer = this.observers[i];
    observer.block.apply(observer.context, arguments);
  }
};

// Views
// -----

var BoardView = function (board, controller) {
  this.board = board;
  this.canvas = document.getElementById('board');

  this.renderInitial();

  // Handle user interaction.
  var handleInteraction = function (event) {
    controller.handleInteraction(event.target.attributes['data-position'].value);
  };
  this.canvas.addEventListener('click', handleInteraction);
  this.canvas.addEventListener('touchstart', handleInteraction);

  // Listen for updates on the model.
  this.board.addObserver(function (event) {
    if (event == 'preparedPuzzle') {
      this.renderInitial();
    }
    else {
      this.render();
    }
  }, this);
};

BoardView.prototype.renderInitial = function () {
  // Render the initial view.
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
};

BoardView.prototype.render = function () {
  var tiles = this.canvas.getElementsByTagName('div');
  for (var i = 0; i < tiles.length; i++) {
    var tile = tiles[i];

    if (!tile.classList.contains('tile')) { continue; }

    var position = tile.attributes['data-position'].value;
    tile.setAttribute('class', 'tile color-' + this.board.getTile(position));
  }

  if (this.board.isSolved()) {
    alert('Win!');
  }
};

var TileColorsView = function (board, controller) {
  this.board = board;
  this.canvas = document.getElementById('tile-colors');

  this.render();

  this.canvas.addEventListener('click', function (event) {
    if (event.target.hasAttribute('data-value')) {
      controller.changeTileColor(event.target.attributes['data-value'].value);
    }

    event.preventDefault();
  });

  this.board.addObserver(function (event) {
    if (event == 'preparedPuzzle') {
      this.render();
    }
  }, this);
};

TileColorsView.prototype.render = function () {
  var html = '';
  this.board.colors.forEach(function (color) {
    html += '<li><a href="#" data-value="' + color + '">' + color + '</a></li>';
  });
  this.canvas.innerHTML = html;
};

var PuzzlesView = function (puzzles, controller) {
  this.canvas = document.getElementById('puzzles');

  var html = '';
  for (var i = 0; i < puzzles.length; i++) {
    html += '<li><a href="#' + (i + 1) + '">Puzzle #' + (i + 1) + '</a></li>';
  }
  this.canvas.innerHTML = html;

  window.addEventListener('hashchange', function () {
    controller.prepareBoard(window.location.hash.match(/\d/g)[0] - 1);
  });
};

// Controller
// ----------

var GameController = function (puzzles, board) {
  this.puzzles = puzzles;
  this.board = board;
};

GameController.prototype.handleInteraction = function (position) {
  this.board.setTile(position);
};

GameController.prototype.changeTileColor = function (color) {
  this.board.currentTileColor = Tile[color];
};

GameController.prototype.prepareBoard = function (number) {
  this.board.prepare(this.puzzles[number]);
};

(function () {
  // Puzzles
  // -------

  var PUZZLES = [
    [
      [1, 1, 1, 0],
      [1, 0, 1, 0],
      [2, 2, 3, 3],
      [2, 0, 0, 3],
      [2, 2, 3, 3]
    ],
    [
      [1, 1, 1, 1],
      [2, 2, 2, 2]
    ]
  ];

  // Application
  // -----------

  var board = new Board(PUZZLES[0]);

  var gameController = new GameController(PUZZLES, board);

  new BoardView(board, gameController);
  new TileColorsView(board, gameController);
  new PuzzlesView(PUZZLES, gameController);
})();