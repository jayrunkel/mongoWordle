let query = 
[{
  $addFields: {
    length: {$strLenCP: '$word'},
    letters: {
      $map: {
        input: {
          $range: [0, {$strLenCP: '$word'}]},
        'in': {$substrCP: ['$word', '$$this', 1]}}},
    letterPos: {
      $map: {
        input: {$range: [0, {$strLenCP: '$word'}]},
        'in': {
          letter: {$substrCP: ['$word', '$$this', 1]},
          position: '$$this'
        }
      }
    }
  }},
 {$match: {
   $expr: {
     $and: [{$eq: ['$length', 5]},
            {$in: ['c', '$letters']},
            {$in: ['r', '$letters']},
            {$in: ['a', '$letters']},
            {$in: ['e', '$letters']},
            {$not: {$in: ['n', '$letters']}},
            {$eq: ['a', {$arrayElemAt: ['$letters', 2]}]},
            {$eq: ['e', {$arrayElemAt: ['$letters', 4]}]}, 
            {$not: {$eq: ['c', {$arrayElemAt: ['$letters', 0]}]}},
            {$not: {$eq: ['r', {$arrayElemAt: ['$letters', 1]}]}},
           ]
   }
 }}
]

// Find all 5 letter words that:
// - contain the letters: c, r, a, e
// - doesn't contain the letter: n
// - has a as the 3 letter and e as the fifth letter
// - doesn't have a c as the first letter and an r as the second letter
