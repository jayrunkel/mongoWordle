// -*- mode: js-jsx;-*-

import React from 'react';
import './index.css';
//import ReactDOM from 'react-dom';


const NUM_GUESSES = 6;
const WORD_LENGTH = 5;

class LetterSquare extends React.Component {

/*
	handleClick() {
		if (this.state.color === "white") {
			this.setState({color: "orange"});
		} else if (this.state.color === "orange") {
			this.setState({color: "green"});
		} else {
			this.setState({color: "white"});
		}
	}
*/

	mapMatchToCSS() {
		let css;

		if (this.props.value.correctPos) {
			css = "square greenBgrd";
		} else if (this.props.value.inWord) {
			css = "square orangeBgrd";
		} else {
			css = "square";
		}

		return css;
	}
	
	render() {
		return (
			<button className={this.mapMatchToCSS()} onClick={() => this.props.handleClick()}>
				{this.props.value.letter}
			</button>
		);
	}
}

class Row extends React.Component {

	displayValue(letPos) {
		const numLetters = this.props.letters.length;

		return letPos >= numLetters ? {letter: "", inWord: false, correctPos: false} : this.props.letters[letPos];
	}
	
  render() {
		let letterSqRows = [];

		for (let i = 0; i < WORD_LENGTH; i++) {
			letterSqRows.push(<LetterSquare key={i} letterNum={i} value={this.displayValue(i)} handleClick={() => this.props.handleClick(i)}/>);
		}
		
		return (
	    <div className="wordleRow">{ letterSqRows }</div>
		)
  }
}

class Wordle extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
	    guesses: [[]], 
/* guesses is an array of arrays where each element an object like:			
			{
					letter: null,
					inWord: false,
					correctPos: false,
				}
*/
	    guessNumber: 0,
			letterNumber: 0,
			lastKey: null,
		};
	}
	
    keyHandler(event) {
	const curGuessNum = this.state.guessNumber;
	const curLetNum = this.state.letterNumber;
	let previousGuesses;
	let previousLetters;
	console.log("Start: curGuessNum: ", curGuessNum, "curLetNum: ", curLetNum);
	if (event.key.length === 1 && (/[a-zA-Z]/).test(event.key)) {
	    console.log("event.key: ", event.key);
	    const letter = event.key.toUpperCase();

	    previousGuesses = curGuessNum > 0 ? this.state.guesses.slice(0, curGuessNum) : [];
	    previousLetters = curLetNum > 0 ? this.state.guesses[curGuessNum].slice(0, curLetNum) : [];
	    const curGuessLetter = {
		letter: letter,
		inWord: false,
		correctPos: false,
	    }
		
	    const curGuessLetters = previousLetters.concat([curGuessLetter]);
				
	    this.setState({
		guesses : previousGuesses.concat([curGuessLetters]),
		letterNumber : curLetNum === WORD_LENGTH - 1 ? 0 : curLetNum + 1,
		guessNumber : curLetNum === WORD_LENGTH - 1 ? curGuessNum + 1 : curGuessNum, 
		lastKey: letter,
	    });
	} else if (event.key === "Delete" || event.key === "Backspace") {
	    if (curGuessNum > 0 || curLetNum > 0) {

		if (curGuessNum === 0) {
		    previousGuesses = [];
		} else if (curGuessNum === 1) {
		    previousGuesses = curLetNum === 0 ? []: this.state.guesses.slice(0, curGuessNum)
		} else {
		    previousGuesses = curLetNum === 0 ? this.state.guesses.slice(0, curGuessNum - 1) : this.state.guesses.slice(0, curGuessNum);
		}

		previousLetters = curLetNum > 0 ? this.state.guesses[curGuessNum].slice(0, curLetNum - 1) : this.state.guesses[curGuessNum - 1].slice(0, WORD_LENGTH - 1);

		console.log("processing request");
		this.setState({
		    guesses : previousGuesses.concat([previousLetters]),
		    letterNumber : curLetNum === 0 ? WORD_LENGTH - 1 : curLetNum - 1,
		    guessNumber : curLetNum === 0 ? curGuessNum - 1 : curGuessNum, 
		    lastKey: "Backspace"
		});
		console.log("END: curGuessNum: ", this.state.guessNumber, "curLetNum: ", this.state.letterNumber);
	    }
	    event.preventDefault();
	}
    }

  handleClick(clkGuessNum, clkLetterNum) {
		console.log("clkGuessNum: ", clkGuessNum, " clkLetterNum: ", clkLetterNum);
		if (clkGuessNum < this.state.guessNumber || (clkGuessNum === this.state.guessNumber && clkLetterNum < this.state.letterNumber)) {
			let curBoxDef = this.state.guesses[clkGuessNum][clkLetterNum];
			let newBoxDef = {
				letter: curBoxDef.letter,
				inWord : !curBoxDef.correctPos,
				correctPos: (curBoxDef.inWord && !curBoxDef.correctPos) ? true : false,
			}

			const previousGuesses = clkGuessNum > 0 ? this.state.guesses.slice(0, clkGuessNum) : [];
			const previousLetters = clkLetterNum > 0 ? this.state.guesses[clkGuessNum].slice(0, clkLetterNum) : [];
			const followingGuesses = clkGuessNum >= this.state.guessNumber ? [] : this.state.guesses.slice(clkGuessNum + 1);
			const followingLetters = ((clkGuessNum === this.state.guessNumber) && clkLetterNum >= this.state.letterNumber) ? [] : this.state.guesses[clkGuessNum].slice(clkLetterNum + 1);

			const newLetters = previousLetters.concat([newBoxDef], followingLetters);
			
			this.setState({
				guesses: previousGuesses.concat([newLetters], followingGuesses)
			});

		}
 
	}

 
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
	  <div className="all"  tabIndex="-1" onKeyDown={(e) => this.keyHandler(e)}>
	      <div className="wordleGame">
		  <div className="game-board">
		      {
			  this.state.guesses.map((guess, guessNum) => {
			      return <Row key={guessNum} letters={guess} handleClick={(l) => this.handleClick(guessNum, l)} />;
			  })
		      }
		  </div>
	      </div>
	      <div className="guessSection">
		  <label>Total Matches: 9999</label>
		  <label>Matches Shown: 99</label>
		  <div className="matchList">
		      <ul>
			  <li>chaos</li>
			  <li>chest</li>
			  <li>chart</li>
		      </ul>
		  </div>
	      </div>
	  </div>
    );
  }
}

const _Wordle = Wordle;
export { _Wordle as Wordle };
