class Player {
  constructor(name, token) {
    this.name = name;
    this.token = token;
  }
}

class ComputerPlayer extends Player {
  constructor(name, token) {
    super(name, token);
  }

  /**
   * TO-DO: gets computer player's move based on current board
   * @param {*} board 
   * @returns Array of x,y coordinates
   */
  getMove(board) {
    let x = 0;
    let y = 0;
    return [x,y];
  }
}

class TicTacToe {
  constructor(player1, player2) {
    this.board = new Array(3).fill(null).map((el) => new Array(3).fill(null));
    this.player1 = player1;
    this.player2 = player2;
    this.currentPlayer = this.player1;
  }

  reset() {
    this.board = new Array(3).fill(null).map((el) => new Array(3).fill(null));
    this.currentPlayer = this.player1;
  }

  play(coor) {
    const [x, y] = coor;
    if (this.board[x][y] === null) {
      this.board[x][y] = this.currentPlayer;
      return this.currentPlayer;
    } else {
      throw new Error("This spot is already taken!");
    }
  }

  nextPlayer() {
    this.currentPlayer === this.player1
      ? (this.currentPlayer = this.player2)
      : (this.currentPlayer = this.player1);
  }

  checkWinner() {
    const checkThreeInARow = (a, b, c) => {
      if (a && a === b && b === c) {
        return a;
      }
    };

    const size = this.board.length;

    // check columns
    for (let c = 0; c < size; c++) {
      const columnValues = [];
      for (let r = 0; r < size; r++) {
        let value = this.board[r][c];
        if (value) {
          columnValues.push(value);
        }
      }
      if (columnValues.length === size) {
        let columnResult = checkThreeInARow(...columnValues);
        if (columnResult) {
          return columnResult;
        }
      }
    }

    // check diagonals
    const mainDiagonal = [];
    const counterDiagonal = [];
    for (let i = 0; i < size; i++) {
      // check rows
      let rowResult = checkThreeInARow(...this.board[i]);
      if (rowResult) {
        return rowResult;
      }

      mainDiagonal.push(this.board[i][i]);
      counterDiagonal.push(this.board[i][size - i - 1]);
    }
    let mainDiagonalResult = checkThreeInARow(...mainDiagonal);
    if (mainDiagonalResult) {
      return mainDiagonalResult;
    }
    let counterDiagonalResult = checkThreeInARow(...counterDiagonal);
    if (counterDiagonalResult) {
      return counterDiagonalResult;
    }

    return null;
  }

  isTie() {
    const size = this.board.length;
    const winner = this.checkWinner();
    let filledCount = 0;

    for (let c = 0; c < size; c++) {
      for (let r = 0; r < size; r++) {
        let value = this.board[r][c];
        if (value) {
          filledCount++;
        }
      }
    }

    if (!winner && filledCount === 9) {
      return true;
    }
    return false;
  }
}

const PLAYER1AVATAR = "X";
const PLAYER2AVATAR = "O";

const onStart = (e) => {
  const startButton = e.target;
  const isTwoPlayer = startButton.id === "two-player";

  const cells = document.querySelectorAll(".cell");
  const resetButton = document.querySelector("#reset");

  // initialize players
  let player1Name;
  let player2Name;
  let player1;
  let player2;
  if (isTwoPlayer) {
    player1Name = document.querySelector("#player-1-name").value;
    player2Name = document.querySelector("#player-2-name").value;
    player1 = new Player(player1Name, PLAYER1AVATAR);
    player2 = new Player(player2Name, PLAYER2AVATAR);
  } else {
    player1Name = "Player";
    player2Name = "Computer";
    player1 = new Player(player1Name, PLAYER1AVATAR);
    player2 = new ComputerPlayer(player2Name, PLAYER2AVATAR);
  }

  // initialize game
  const game = new TicTacToe(player1, player2);

  // update heading
  const statusHeading = document.querySelector("h2");
  const startHeading = `${player1.name} plays first`;
  statusHeading.innerText = startHeading;

  // remove form elements and replace with inputted names
  const player1Text = document.createElement("p");
  player1Text.innerText = `Player 1: \n${player1Name}`;
  const player2Text = document.createElement("p");
  player2Text.innerText = `Player 2: \n${player2Name}`;

  const player1Element = document.querySelector("#player-1-input");
  const player2Element = document.querySelector("#player-2-input");

  player1Element.replaceChildren(player1Text);
  player2Element.replaceChildren(player2Text);
  document.querySelector("#start-buttons").remove();

  // add event listeners for tic-tac-toe spaces and reset button
  const onClick = createOnClick({ game, cells, statusHeading });
  cells.forEach((cell) => cell.addEventListener("click", onClick));
  resetButton.addEventListener("click", () => {
    onReset({ game, cells, statusHeading, startHeading, onClick });
  });
};

const makeMove = ({ x, y, game, cells, statusHeading, onClick }) => {
  const currentPlayer = game.play([x, y]);
  const selectedCell = [...cells].find((cell) => parseInt(cell.dataset.x) ===  x && parseInt(cell.dataset.y) === y);
  selectedCell.innerText = currentPlayer.token;

  const winner = game.checkWinner();
  const isTie = game.isTie();
  const gameOver = winner || isTie;

  if (winner) {
    statusHeading.innerText = `${winner.name} wins. Game Over!`;
  } else if (isTie) {
    statusHeading.innerText = "It's a tie!";
  } else {
    game.nextPlayer();
    statusHeading.innerText = `${game.currentPlayer.name}'s turn`;
  }

  if (gameOver) {
    cells.forEach((cell) => cell.removeEventListener("click", onClick));
  }
}


const createOnClick = ({ game, cells, statusHeading }) => {
  return function onClick(e) {
    try {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);

      makeMove({ x, y, game, cells, statusHeading, onClick });

      if (game.currentPlayer instanceof ComputerPlayer) {
        const [compX , compY] = game.currentPlayer.getMove(game.board);
        makeMove({ x: compX, y: compY, game, cells, statusHeading, onClick });
      }

    } catch (error) {
      statusHeading.innerText = error.message;
    }
  };
};

const onReset = ({ game, cells, statusHeading, startHeading, onClick }) => {
  game.reset();
  statusHeading.innerText = startHeading;
  cells.forEach((cell) => (cell.innerText = null));
  cells.forEach((cell) => {
    cell.removeEventListener("click", onClick);
    cell.addEventListener("click", onClick);
  });
};

const playWithPlayerButton = document.querySelector("#two-player");
const playWithComputerButton = document.querySelector("#computer");

playWithPlayerButton.addEventListener("click", onStart);
playWithComputerButton.addEventListener("click", onStart)
