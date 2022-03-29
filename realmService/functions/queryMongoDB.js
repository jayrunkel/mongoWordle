exports = async function(searchCriteria){
  /*
    Accessing application's values:
    var x = context.values.get("value_name");

    Accessing a mongodb service:
    var collection = context.services.get("mongodb-atlas").db("dbname").collection("coll_name");
    collection.findOne({ owner_id: context.user.id }).then((doc) => {
      // do something with doc
    });

    To call other named functions:
    var result = context.functions.execute("function_name", arg1, arg2);

    Try running in the console below.
  */

const config = {
	db : "dictionary",
	collection : "ospd",
	wordLength: 5,
	resultLimit: searchCriteria.resultLimit ? searchCriteria.resultLimit: 20,
	mustHaveLetters : searchCriteria.mustHaveLetters ? searchCriteria.mustHaveLetters : [],
	mustNotHaveLetters : searchCriteria.mustNotHaveLetters ? searchCriteria.mustNotHaveLetters : [],
	badPositions : searchCriteria.badPositions ? searchCriteria.badPositions : {
		0 : [],
		1 : [],
		2 : [],
		3 : [],
		4 : []
	},
	goodPositions : searchCriteria.goodPositions ? searchCriteria.goodPositions : {
		0 : null,
		1 : null,
		2 : null,
		3 : null,
		4 : null
	}
};

	console.log("config: ", config);

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

	const pipeline = [enrichWordsStage, matchStage, facetStage, cleanUpStage];

  console.log("config: ", JSON.stringify(config));
	console.log("pipeline: ", pipeline);

 

  
//  const docs = await context.services.get("mongodb-atlas").db("dictionary").collection("ospd").find({word: {$regex : regex}}).limit(20).toArray();
		var result = await context.services.get("mongodb-atlas").db("dictionary").collection("ospd").aggregate(pipeline).toArray()
    console.log("result: ", JSON.stringify(result));
//    const words = docs.map(doc => doc.word);
  
  return result;
};
