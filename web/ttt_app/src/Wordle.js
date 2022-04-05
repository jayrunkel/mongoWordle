// -*- mode: js-jsx;-*-

import React from 'react';
import './index.css';
//import ReactDOM from 'react-dom';
import * as Realm from "realm-web";

//const NUM_GUESSES = 6;
const WORD_LENGTH = 5;
const MAX_NUMBER_RESULTS = 100;
const RESULTS_PER_COLUMN = 20;

class LetterSquare extends React.Component {


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

class SuggestedWord extends React.Component {
	constructor(props) {
		super(props)
	}

	highlightWord(w) {
		w.target.style.background = 'green';
	}

	unHighlightWord(w) {
		w.target.style.background = 'white';
	}

	render() {

		return (
			<ul key={this.props.idx}
					onClick={() => this.props.handleClick()}
					onMouseOver={this.highlightWord}
					onMouseLeave={this.unHighlightWord}
			>{this.props.word}</ul>
		)
	}
}

class SuggestedColumn extends React.Component {
  constructor(props) {
    super(props);

	}

	render() {

		return (
			<ul key={this.props.idx}>{
				this.props.wordList.map((word, idx) => {
					return <SuggestedWord key={idx}
																idx={idx}
																word={word}
																handleClick={() => this.props.handleClick(word)}
								 />;
				})
			}
			</ul>
		)
	}
}

// The wordle puzzle is represented by three of the Wordle classes
// state fields:
// - guesses
// - guessNumber
// - letterNumber
//
// guesses is an array of arrays. Each of the inner arrays represents
// a row in to wordle puzzle. The inner array elements have the
// following structure:
//   {
//			letter: null,
//			inWord: false,
//			correctPos: false,
//		}
//
// guessNumber is an index into the row array in the guesses array. It represents the
// index of the row that has the next empty square
//
// letterNumber is an index into the row array identified by
// guessNumber. It is the index of the next cell in the row array that
// is open (doesn't have a letter).
//
// In this way, the coordingates (guessNumber, letterNumber) point to
// the next open cell.
//
// Note: there is a lot of convoluted logic in the code below to
// perform array surgery when cell are modified. The code would
// probably be more readible if some sort of grid class was
// used/written. 

class Wordle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			user: this.props.user,
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
			suggestedWords : [],
			totalMatches: 0,
			matchesShown: 0,
			searching: false,
    };

		this.gameBoardRef = React.createRef();
  }

	async queryMongoDB() {
		this.setState({searching: true});

		let queryObj = {
			"resultLimit": MAX_NUMBER_RESULTS,
			"mustHaveLetters" : [],
			"mustNotHaveLetters" : [],
			"badPositions" : {
				"0" : [],
				"1" : [],
				"2" : [],
				"3" : [],
				"4" : []
			},
			"goodPositions" : {
				"0" : null,
				"1" : null,
				"2" : null,
				"3" : null,
				"4" : null
			}
		}

		this.state.guesses.forEach(guess => {
			guess.forEach((cell, pos) => {
				const lowLetter = cell.letter.toLowerCase();
				if (cell.correctPos || cell.inWord) queryObj.mustHaveLetters.push(lowLetter);
				if (cell.correctPos) queryObj.goodPositions[pos] = lowLetter;
				if (cell.inWord && !cell.correctPos) queryObj.badPositions[pos].push(lowLetter);
				if (!cell.correctPos && !cell.inWord && !queryObj.mustHaveLetters.includes(lowLetter)) queryObj.mustNotHaveLetters.push(lowLetter);
			});
		});

//		console.log("Query obj", queryObj);

	  const result = await this.state.user.functions.queryMongoDB(queryObj);
	  const resultCount = result[0].count ? result[0].count : 0;
	    
//		console.log("MongoDB Search Results: ", result[0]);

		this.setState({
		    suggestedWords: result[0].guesses,
		    totalMatches : resultCount,
		    matchesShown : Math.min(result[0].resultLimit, result[0].count ? result[0].count : 0),
		    searching: false,
		    guesses : (resultCount > 0 && this.state.letterNumber === 0 && this.state.guesses.length === this.state.guessNumber) ? this.state.guesses.concat([[]]) : this.state.guesses,
		});

	//	console.log("clicking on gameBoard in query function");
		//this.gameBoardRef.current.click();

	}

	//On mount, set the focus to the game board so the user can just start typing
  componentDidMount() {
		//this.gameBoard.focus();
		/*
		var gameBoard = document.querySelector('div[class="gameBoard"]');
//		console.log("Executing mouse click on mounting game board: ", gameBoard);
		this.simulateMouseClick(gameBoard);
		*/
		//this.gameBoardRef.current.click();
		this.gameBoardRef.current.focus();
  }

		//On update, set the focus to the game board so the user can just start typing
  componentDidUpdate() {
		//this.gameBoard.focus();
		/*
		var gameBoard = document.querySelector('div[class="gameBoard"]');
//		console.log("Executing mouse click on updating game board: ", gameBoard);
		this.simulateMouseClick(gameBoard);
		*/
//		console.log("clicking on gameBoard");
		this.gameBoardRef.current.focus();
		//this.gameBoardRef.current.click();
  }

	/*
  simulateMouseClick(element) {
		const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
		mouseClickEvents.forEach(mouseEventType => element.dispatchEvent(
	    new MouseEvent(mouseEventType, {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
	    })
		));
  }
	*/

	
  keyHandler(event) {
		const curGuessNum = this.state.guessNumber;
		const curLetNum = this.state.letterNumber;
		let previousGuesses;
		let previousLetters;
		//		console.log("Start: curGuessNum: ", curGuessNum, "curLetNum: ", curLetNum);

		// User pressed a letter
		if (event.key.length === 1 && (/[a-zA-Z]/).test(event.key)) {
//	    console.log("event.key: ", event.key);
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

//				console.log("processing request");
				this.setState({
					guesses : previousGuesses.concat([previousLetters]),
					letterNumber : curLetNum === 0 ? WORD_LENGTH - 1 : curLetNum - 1,
					guessNumber : curLetNum === 0 ? curGuessNum - 1 : curGuessNum, 
					lastKey: "Backspace"
				});
//				console.log("END: curGuessNum: ", this.state.guessNumber, "curLetNum: ", this.state.letterNumber);
	    }
	    event.preventDefault();
		} else if (event.key === "Enter") {
			this.queryMongoDB()
		}
  }

  handleClick(clkGuessNum, clkLetterNum) {
//		console.log("clkGuessNum: ", clkGuessNum, " clkLetterNum: ", clkLetterNum);
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

	handleGuessClick(word) {
		const curGuessNum = this.state.guessNumber;
		const curLetNum = this.state.letterNumber;
		
		console.log("Selected word was: ", word);

		const previousGuesses = curGuessNum > 0 ? this.state.guesses.slice(0, curGuessNum) : [];

		let newGuessRow = [];
		for (let i=0; i < word.length; i++) {
			newGuessRow.push({
				letter: word.substr(i, 1).toUpperCase(),
				inWord: false,
				correctPos: false
			});
		}

		this.setState({
			guesses : previousGuesses.concat([newGuessRow]),
			guessNumber : curGuessNum + 1,
			letterNumber: 0,
		});
	}

	generateColumns() {
		const numColumns = Math.ceil(this.state.matchesShown / RESULTS_PER_COLUMN)

		let columns = []

		for (let i=0; i < numColumns; i++) {
			columns.push(<SuggestedColumn
										 key={i}
										 idx={i}
										 wordList={this.state.suggestedWords.slice(i * RESULTS_PER_COLUMN, i * RESULTS_PER_COLUMN + RESULTS_PER_COLUMN)}
										 handleClick={(w) => this.handleGuessClick(w)}
									 />);
		}
		
	  return columns;
	}
 
  render() {
		return (
	  <div className="all"  tabIndex="-1" onKeyDown={(e) => this.keyHandler(e)}>
	    <div className="wordleGame">
				<div className="gameBoard" tabIndex="-1" ref={this.gameBoardRef}>
		      {
						this.state.guesses.map((guess, guessNum) => {
							return <Row key={guessNum} letters={guess} handleClick={(l) => this.handleClick(guessNum, l)} />;
						})
		      }
				</div>
				<div className="instructions">
					<h2>Instructions</h2>
					<ul>
						<li>Recreate the state of your wordle puzzle. Just start typing.</li>
						<li>If you navigate away from the app, click near the grid to continue typing. When editing is possible, The grid will be surrounded in a blue border.</li>
						<li>Typing a letter from a to z will enter that letter in the next cell</li>
						<li>New rows will be added as you type</li>
						<li>Delete or backspace will remove the letter from the last cell</li>
						<li>If you mouse click on a cell, the color of the cell will cycle from white - orange - green to specify that the letter is not in the word, the letter is in the wrong position, the letter is in the correct position</li>
						<li>To get a list of possible guesses for the next row of your wordle puzzle, click "Get Suggestions"</li>
					</ul>
				</div>
	    </div>
	    <div className="guessSection">
				<div>
					{this.state.searching ? <i>searching...</i> : <button onClick={async () => await this.queryMongoDB()}>Get Suggestions</button>}
				</div>
				<div className="matchData"><label>Total Matches:</label>{this.state.totalMatches}</div>
				<div><label>Matches Shown:</label>{this.state.matchesShown}</div>
				<div className="matchList">
					{
						this.generateColumns()
					}
				</div>
	    </div>
	  </div>
    );
  }
}

const _Wordle = Wordle;
export { _Wordle as Wordle };
