var probable = (function probableScope() {

var random = Math.random;

function setRandom(randomFn) {
  random = randomFn;
}

// Rolls a die.
// ~~ is faster than Math.floor but doesn't work as a floor with very high 
// numbers.
function roll(sides) {
  return Math.floor(random() * sides);
}

// This is like `roll`, but it is 1-based, like traditional dice.
function rollDie(sides) {
  if (sides === 0) {
    return 0;
  }
  else {
    return roll(sides) + 1;
  }
}

// Makes a table that maps probability ranges to outcomes.
// 
// rangesAndOutcomePairs should look like this:
// [
//  [[0, 80], 'a'],
//  [[81, 95], 'b'],
//  [[96, 100], 'c']
// ]
// 
function createRangeTable(rangesAndOutcomePairs) {
  var rangeTable = {
    rangesAndOutcomes: rangesAndOutcomePairs,
    length: 0
  };

  rangeTable.length = 
    rangeTable.rangesAndOutcomes[rangeTable.rangesAndOutcomes.length - 1][0][1] - 
      rangeTable.rangesAndOutcomes[0][0][0] + 1;

  rangeTable.outcomeAtIndex = outcomeAtIndexFromTable.bind(rangeTable);
  rangeTable.roll = randomOutcomeFromTable.bind(rangeTable);

  return rangeTable;
}

// Selects an outcome at random that respects the probability ranges defined 
// in the table.
function randomOutcomeFromTable() {
  return this.outcomeAtIndex(probable.roll(this.length));
}

// Looks up what outcome corresponds to the given index.
function outcomeAtIndexFromTable(index) {
  var outcome;
  index = (+index);
  function checkRange(rangeOutcomePair) {
    var range = rangeOutcomePair[0];
    if (index >= range[0] && index <= range[1]) {
      outcome = rangeOutcomePair[1];
      return false;
    }
  }

  this.rangesAndOutcomes.forEach(checkRange);
  return outcome;
}

// A shorthand way to create a range table object. Given a hash of outcomes 
// and the *size* of the probability range that they occupy, this function 
// generates the ranges for createRangeTable.
// It's handy, but if you're doing this a lot, keep in mind that it's much 
// slower than createRangeTable.

function createRangeTableFromDict(outcomesAndLikelihoods) {
  return createRangeTable(
    convertDictToRangesAndOutcomePairs(outcomesAndLikelihoods)
  );
}

// outcomesAndLikelihoods format: 
// {
//   failure: 30,
//   success: 20,
//   doover: 5
// }
//
// Returns an array in this kind of format:
// [
//  [[0, 29], 'failure'],
//  [[30, 49], 'success'],
//  [[50, 54], 'doover']
// ]

function convertDictToRangesAndOutcomePairs(outcomesAndLikelihoods) {
  var rangesAndOutcomes = [];
  var endOfLastUsedRange = -1;

  var loArray = convertOLPairDictToLOArray(outcomesAndLikelihoods);
  loArray = loArray.sort(compareLikelihoodSizeInPairsDesc);

  loArray.forEach(function addRangeOutcomePair(loPair) {
    var likelihood = loPair[0];
    var outcome = loPair[1];
    var start = endOfLastUsedRange + 1;
    var endOfNewRange = start + likelihood - 1;
    rangesAndOutcomes.push([[start, endOfNewRange], outcome]);

    endOfLastUsedRange = endOfNewRange;
  });

  return rangesAndOutcomes;
}

function convertOLPairDictToLOArray(outcomesAndLikelihoods) {
  var loArray = [];

  for (var key in outcomesAndLikelihoods) {
    var probability = outcomesAndLikelihoods[key];
    loArray.push([probability, key]);
  }

  return loArray;
}

function compareLikelihoodSizeInPairsDesc(pairA, pairB) {
  return pairA[0] > pairB[0] ? -1 : 1;
}

// Picks randomly from an array.
function pickFromArray(array, emptyArrayDefault) {
  if (!array || typeof array.length !== 'number' || array.length < 1) {
    return emptyArrayDefault;
  }
  else {
    return array[roll(array.length)];
  }
}

// Combines every element in A with every element in B.
function crossArrays(arrayA, arrayB) {
  var combos = [];
  arrayA.forEach(function combineElementWithArrayB(aElement) {
    arrayB.forEach(function combineBElementWithAElement(bElement) {
      if (Array.isArray(aElement) || Array.isArray(bElement)) {
        combos.push(aElement.concat(bElement));
      }
      else {
        combos.push([aElement, bElement]);
      }
    });
  });
  return combos;
}

function getCartesianProduct(arrays) {
  return arrays.slice(1).reduce(crossArrays, arrays[0]);
}

return {
  roll: roll,
  rollDie: rollDie,
  createRangeTable: createRangeTable,
  createRangeTableFromDict: createRangeTableFromDict,
  convertDictToRangesAndOutcomePairs: convertDictToRangesAndOutcomePairs,
  pickFromArray: pickFromArray,
  crossArrays: crossArrays,
  getCartesianProduct: getCartesianProduct,
  setRandom: setRandom
};

}());

if (typeof module === 'object') {
  module.exports = probable;
}
