
// ================================================================
// Execution Instructions
//
/*
node solve.js \
  --mustHaveLetters='["c","r","a","e"]'  \
  --mustNotHaveLetters='["n"]' \
  --goodPositions='{"0":null, "1":null, "2":"a", "3":null, "4":"e"}' \
  --badPositions='{"0":["c"], "1":["r"], "2":[], "3":[], "4":[]}' \
  --uri="mongodb+srv://realmcluster.aamtz.mongodb.net"
*/

import  yargs from "yargs" // "yargs/yargs"
import { MongoClient } from "mongodb";
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv


const config = {
	uri : argv.uri || "mongodb://locahost:27017",
	db : argv.db || "dictionary",
	collection : argv.collection || "ospd",
	wordLength: argv.wordLenth || 5,
	resultLimit: argv.resultLimit || 20,
	mustHaveLetters : argv.mustHaveLetters ? JSON.parse(argv.mustHaveLetters) : [],
	mustNotHaveLetters : argv.mustNotHaveLetters ? JSON.parse(argv.mustNotHaveLetters) : [],
	badPositions : argv.badPositions ? JSON.parse(argv.badPositions) : {
		0 : [],
		1 : [],
		2 : [],
		3 : [],
		4 : []
	},
	goodPositions : argv.goodPositions ? JSON.parse(argv.goodPositions) : {
		0 : null,
		1 : null,
		2 : null,
		3 : null,
		4 : null
	}
}

console.log(config)

async function connectToDatabase() {
	const c = new MongoClient(config.uri)
	await c.connect()
	return c
}
/*
const db = db.getSiblingDB(config.db)
const col = db.getCollection(config.collection)
*/

const enrichWordsStage =
  {
    '$addFields': {
      'length': {
        '$strLenCP': '$word'
      },
      'letters': {
        '$map': {
          'input': {
            '$range': [
              0, {
                '$strLenCP': '$word'
              }
            ]
          },
          'in': {
            '$substrCP': [
              '$word', '$$this', 1
            ]
          }
        }
      },
		}
	}

function buildMustHaveTest(configObj) {
	return configObj.mustHaveLetters.map(letter => {
		return {'$in': [letter, '$letters']}
	})
}

function buildMustNotHaveTest(configObj) {
	return configObj.mustNotHaveLetters.map(letter => {
		return {'$not' : {'$in': [letter, '$letters']}}
	})
}

function buildGoodPositionsTest(configObj) {
	var goodPosTests = []
	for (let pos = 0; pos < config.wordLength; pos++) {
		if (configObj.goodPositions[pos]) {
			goodPosTests.push({'$eq': [configObj.goodPositions[pos], {'$arrayElemAt': ['$letters', pos]}]})
		}
	}

	return goodPosTests
}


function buildBadPositionsTest(configObj) {
	var badPosTests = []
	for (let pos = 0; pos < config.wordLength; pos++) {
		configObj.badPositions[pos].map(letter => {
			badPosTests.push({'$not': {'$eq': [letter, {'$arrayElemAt': ['$letters', pos]}]}})
		})
	}

	return badPosTests
}

const conditions = [{'$eq': ['$length', config.wordLength]}]

const allConditions = conditions.concat(
	buildMustHaveTest(config), buildMustNotHaveTest(config), buildGoodPositionsTest(config), buildBadPositionsTest(config)
)

const matchStage = {
  '$match': {
    '$expr': {
      '$and': allConditions
      }
    }
}

const facetStage = {
	$facet: {
		count: [
			{
				$count: 'count'
			}
		],
		guesses: [
			{
				$project: {
					_id: 0,
					word: 1
				}
			},
			{
				$limit: config.resultLimit
			}
		]
	}
}

const cleanUpStage = {
	$addFields: {
		count : {
			$let : {
				vars : {countObj : {$arrayElemAt : ["$count", 0]}},
					in : "$$countObj.count"
			}
		},
		resultLimit : config.resultLimit,
		guesses: {
			$map: {
				input: '$guesses',
				'in': '$$this.word'
			}
		}
	}
}

const pipeline = [enrichWordsStage, matchStage, facetStage, cleanUpStage]

console.log(JSON.stringify(pipeline, null, 2));

async function run() {
	let client = await connectToDatabase()
	let db = client.db(config.db)
	let col = db.collection(config.collection)

	var result = await col.aggregate(pipeline).toArray()
	console.log(result[0])
	client.close()
}

run()


 
