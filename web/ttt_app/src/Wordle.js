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

		const previousGuesses = curGuessNum > 0 ? this.state.guesses.slice(0, curGuessNum) : [];
		const previousLetters = curLetNum > 0 ? this.state.guesses[curGuessNum].slice(0, curLetNum) : [];
		const curGuessLetter = {
			letter: event.key,
			inWord: false,
			correctPos: false,
		}
		
		const curGuessLetters = previousLetters.concat([curGuessLetter]);
				
		this.setState({
			guesses : previousGuesses.concat([curGuessLetters]),
			letterNumber : curLetNum === WORD_LENGTH - 1 ? 0 : curLetNum + 1,
			guessNumber : curLetNum === WORD_LENGTH - 1 ? curGuessNum + 1 : curGuessNum, 
			lastKey: event.key,
		});
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
			<div className="wordleGame" tabIndex="-1" onKeyDown={(e) => this.keyHandler(e)}>
				<div><label>{this.state.lastKey}</label></div>
				<div className="game-board">
					{
						this.state.guesses.map((guess, guessNum) => {
							return <Row key={guessNum} letters={guess} handleClick={(l) => this.handleClick(guessNum, l)} />;
											 })
					}
				</div>
			</div>
    );
  }
}

const _Wordle = Wordle;
export { _Wordle as Wordle };
