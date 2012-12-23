// Models
// ------

// ### Tile

var Tile = {
  RED: 1,
  GREEN: 2,
  BLUE: 3,
  YELLOW: 4,
  WHITE: 9,
  EMPTY: 0
};

// ### Board

var Board = function () {
  this.observers = [];
};

Board.prototype = {
  getTile: function (position) {
    var row = position.charCodeAt(0) - 65;
    var column = position[1] - 1;

    return this.state[row][column];
  },

  setTile: function (position) {
    var row = position.charCodeAt(0) - 65;
    var column = position[1] - 1;

    if (this.state[row][column] != Tile.EMPTY) {
      this.state[row][column] = this.currentTileColor;
      this.notifyObservers();
    }
  },

  prepare: function (puzzle) {
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
  },

  isSolved: function () {
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
  },

  addObserver: function (observer, context) {
    this.observers.push({block: observer, context: context || null});
  },

  notifyObservers: function () {
    for (var i = 0; i < this.observers.length; i++) {
      var observer = this.observers[i];
      observer.block.apply(observer.context, arguments);
    }
  }
};

// Views
// -----

// ### Board

var BoardView = function (board, controller) {
  this.board = board;
  this.canvas = document.getElementById('board');

  // Handle user interaction.
  var handleInteraction = function (event) {
    var touch = event.touches && event.touches[0];
    var target;

    if (touch) {
      target = document.elementFromPoint(touch.pageX, touch.pageY);
    }
    else {
      target = event.target;
    }

    if (target.hasAttribute('data-position')) {
      controller.handleInteraction(target.attributes['data-position'].value);
    }
  };
  this.canvas.addEventListener('click', handleInteraction);
  this.canvas.addEventListener('touchstart', handleInteraction);
  this.canvas.addEventListener('touchmove', handleInteraction);

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

BoardView.prototype = {
  renderInitial: function () {
    // Render the initial view.
    var html = '';
    for (var row = 0; row < this.board.state.length; row++) {
      for (var column = 0; column < this.board.state[row].length; column++) {
        var tile = this.board.state[row][column];
        var position = String.fromCharCode(row + 65) + (column + 1);
        var classValue = column === 0 ? 'first ' : '';

        if (tile == Tile.EMPTY) {
          classValue += 'slot';
        }
        else {
          classValue += 'tile color-' + tile;
        }

        html += '<div class="' + classValue + '" data-position="' + position + '"></div>';
      }
    }
    this.canvas.innerHTML = html;
  },

  render: function () {
    var tiles = this.canvas.getElementsByTagName('div');
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];

      if (!tile.classList.contains('tile')) { continue; }

      var position = tile.attributes['data-position'].value;
      tile.setAttribute('class', tile.getAttribute('class').replace(/color-\d+/, 'color-' + this.board.getTile(position)));
    }

    if (this.board.isSolved()) {
      alert('Win!');
    }
  }
};

// ### Tile colors

var TileColorsView = function (board, controller) {
  this.board = board;
  this.canvas = document.getElementById('tile-colors');

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

TileColorsView.prototype = {
  render: function () {
    var html = '';
    this.board.colors.forEach(function (color) {
      html += '<li><a href="#" data-value="' + color + '">' + color + '</a></li>';
    });
    this.canvas.innerHTML = html;
  }
};

// ### Puzzles

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

GameController.prototype = {
  handleInteraction: function (position) {
    this.board.setTile(position);
  },

  changeTileColor: function (color) {
    this.board.currentTileColor = Tile[color];
  },

  prepareBoard:  function (number) {
    this.board.prepare(this.puzzles[number]);
  }
};

// Application
// -----------

(function () {
  var board = new Board();

  var gameController = new GameController(PUZZLES, board);

  new BoardView(board, gameController);
  new TileColorsView(board, gameController);
  new PuzzlesView(PUZZLES, gameController);

  gameController.prepareBoard(0);
})();