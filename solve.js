const db = db.getSiblingDB("dictionary")
const col = db.getCollection("words")

const config = {
	wordLength: 5,
	resultLimit: 20,
	mustHaveLetters : ["c", "n", "i"],
	mustNotHaveLetters : ["r", "a", "e", "m"],
	badPositions : {
		0 : [],
		1 : ["r", "u"],
		2 : ["a", "m"],
		3 : ["n"],
		4 : ["e", "n"]
	},
	goodPositions : {
		0 : "c",
		1 : null,
		2 : null,
		3 : "i",
		4 : null
	}
}

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
	for (pos = 0; pos < config.wordLength; pos++) {
		if (configObj.goodPositions[pos]) {
			goodPosTests.push({'$eq': [configObj.goodPositions[pos], {'$arrayElemAt': ['$letters', pos]}]})
		}
	}

	return goodPosTests
}


function buildBadPositionsTest(configObj) {
	var badPosTests = []
	for (pos = 0; pos < config.wordLength; pos++) {
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

const limitStage = {$limit : config.resultLimit}

const pipeline = [enrichWordsStage, matchStage, limitStage]

printjson(pipeline)

var result = col.aggregate(pipeline).toArray()

printjson(result)
