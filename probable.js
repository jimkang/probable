var probable = (function probableScope() {

// Rolls a die.
// ~~ is faster than Math.floor but doesn't work as a floor with very high 
// numbers.
function roll(sides) {
  return Math.floor(Math.random() * sides);
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
// 
// outcomesAndLikelihoods format: 
// {
//   failure: 30,
//   success: 20,
//   doover: 5
// }
function createRangeTableFromDict(outcomesAndLikelihoods) {
  var endOfLastUsedRange = -1;
  var rangesAndOutcomes = [];

  for (var key in outcomesAndLikelihoods) {
    var probability = outcomesAndLikelihoods[key];
    var start = endOfLastUsedRange + 1;
    var endOfNewRange = start + probability - 1;
    rangesAndOutcomes.push([[start, endOfNewRange], key]);

    endOfLastUsedRange = endOfNewRange;
  }
  return createRangeTable(rangesAndOutcomes);
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
  pickFromArray: pickFromArray,
  crossArrays: crossArrays,
  getCartesianProduct: getCartesianProduct
};

}());

if (typeof module === 'object') {
  module.exports = probable;
}
