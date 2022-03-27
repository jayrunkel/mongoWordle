// -*- mode: js-jsx;-*-

import React from 'react';
//import ReactDOM from 'react-dom';
//import * as Realm from 'realm';
import * as Realm from "realm-web";
import './index.css';
const wordle = require('./Wordle');

const REALM_APP_ID = "wordleservice-lxqoh";
const app = new Realm.App({ id: REALM_APP_ID });


// Create a component that displays the given user's details
function UserDetail({ user }) {
  return (
    <div>
      <h1>Logged in with anonymous id: {user.id}</h1>
    </div>
  );
}

// Create a component that lets an anonymous user log in
function Login({ setUser }) {
  const loginAnonymous = async () => {
    const user = await app.logIn(Realm.Credentials.anonymous());
    setUser(user);
  };
  return <button onClick={loginAnonymous}>Log In</button>;
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}



class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      xIsNext: true,
			stepNumber: 0
    };
  }
	
  handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
//    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
			stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

	jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
	
	render() {
		const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

		const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
      );
    });
		
    return (
			<div className="game">
				<div className="game-board">
					<Board
							squares={current.squares}
							onClick={(i) => this.handleClick(i)}
						/>
					</div>
					<div className="game-info">
						<div>{status}</div>
						<ol>{moves}</ol>
					</div>
				</div>
    );
  }
}

// ========================================

/*
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
*/

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}



function App() {
	// Keep the logged in Realm user in local state. This lets the app re-render
  // whenever the current user changes (e.g. logs in or logs out).
  const [user, setUser] = React.useState(app.currentUser);

  // If a user is logged in, show their details.
  // Otherwise, show the login screen.
  return (
    <div className="App">
      <div className="App-header">
        {user ? <UserDetail user={user} /> : <Login setUser={setUser} />}
      </div>
	{user ? <div><wordle.Wordle /></div> : <div>Not Authorized</div>}
    </div>
  );
}

export default App;
