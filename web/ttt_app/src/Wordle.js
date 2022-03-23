// -*- mode: js-jsx;-*-

import React from 'react';
//import ReactDOM from 'react-dom';


const NUM_GUESSES = 6;
const WORD_LENGTH = 5;

function LetterSquare(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Row extends React.Component {
    constructor (props) {
	super(props);
    }

    render() {
	return (
	    <div className="wordleRow">
		<LetterSquare letterNum="0" val="" onClick={this.props.onClick} />
		<LetterSquare letterNum="1" value="" onClick={this.props.onClick}/>
		<LetterSquare letterNum="2" value="" onClick={this.props.onClick}/>
		<LetterSquare letterNum="3" value="" onClick={this.props.onClick}/>
		<LetterSquare letterNum="4" value="" onClick={this.props.onClick}/>
	    </div>
	)
    }
}

 class Wordle extends React.Component {
     constructor(props) {
	 super(props);
	 this.state = {
	     guesses: Array(NUM_GUESSES).fill(
		 Array(WORD_LENGTH).fill({
		     letter: null,
		     inWord: false,
		     correctPos: false,
		 })),
	     guessNumber: -1,
	 };
     }
/*
  handleClick(i) {


    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
			stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
	}
*/
 
     render() {
/*	 
		const history = this.state.history;
    const current = history[this.state.stepNumber];

    let status;

		const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
*/
    return (
	<div className="game">
	    <div className="game-board">
		{
		    this.state.guesses.map((guess) => {
			return <Row guess={guess}/>;
		    })
		}
	    </div>
	</div>
    );
  }
}

const _Wordle = Wordle;
export { _Wordle as Wordle };
