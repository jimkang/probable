function createProbable(opts) {
  var random = Math.random;

  if (opts && opts.random) {
    random = opts.random;
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
    var rangesAndOutcomes = rangesAndOutcomePairs;
    var length = rangesAndOutcomes[rangesAndOutcomes.length - 1][0][1]
      - rangesAndOutcomes[0][0][0] + 1;

    function curriedOutcomeAtIndex(index) {
      return outcomeAtIndex(rangesAndOutcomes, index);
    }

    function rollOnTable() {
      var outcome = curriedOutcomeAtIndex(roll(length));
      if (typeof outcome === 'function') {
        return outcome();
      }
      else {
        return outcome;
      }
    }

    function getRangesAndOutcomesArray() {
      return rangesAndOutcomes;
    }

    return {
      outcomeAtIndex: curriedOutcomeAtIndex,
      roll: rollOnTable,
      length: length,
      getRangesAndOutcomesArray: getRangesAndOutcomesArray
    };
  }

  // Looks up what outcome corresponds to the given index. Returns undefined 
  // if the index is not inside any range.
  function outcomeAtIndex(rangesAndOutcomes, index) {
    index = (+index);

    for (var i = 0; i < rangesAndOutcomes.length; ++i) {
      var rangeOutcomePair = rangesAndOutcomes[i];
      var range = rangeOutcomePair[0];
      if (index >= range[0] && index <= range[1]) {
        return rangeOutcomePair[1];
      }
    }
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

  //  [[0, 80], 'a'],
  //  [[81, 95], 'b'],
  //  [[96, 100], 'c']

  // Table defs will be objects like this:
  // {
  //   '0-24': 'Bulbasaur',
  //   '25-66': 'Squirtle',
  //   '67-99': 'Charmander'
  // }
  // The values can be other other objects, in which case those outcomes are
  // considered recursive rolls. e.g.
  //
  // {
  //   '0-39': {
  //     '0-24': 'Bulbasaur',
  //     '25-66': 'Squirtle',
  //     '67-99': 'Charmander'
  //   },
  //   '40-55': 'Human',
  //   '56-99': 'Rock'
  // }
  //
  // When 0-39 is rolled on the outer table, another roll is made on that inner
  // table.
  //
  // It will not detect cycles.

  function createTableFromDef(def) {
    var rangeOutcomePairs = rangeOutcomePairsFromDef(def);
    return createRangeTable(rangeOutcomePairs);
  }

  function rangeOutcomePairsFromDef(def) {
    var rangeOutcomePairs = [];
    for (var rangeString in def) {
      var range = rangeStringToRange(rangeString);
      var outcome = def[rangeString];
      if (typeof outcome === 'object') {
        if (Array.isArray(outcome)) {
          outcome = createCustomPickFromArray(outcome);
        }
        else {
          // Recurse.
          var subtable = createTableFromDef(outcome);
          if (typeof subtable.roll == 'function') {
            outcome = subtable.roll;
          }
        }
      }
      rangeOutcomePairs.push([range, outcome]);
    }
    return rangeOutcomePairs;    
  }

  function rangeStringToRange(s) {
    var bounds = s.split('-');
    if (bounds.length > 2) {
      return undefined;
    }
    if (bounds.length === 1) {
      return [+s, +s];
    }
    else {
      return [+bounds[0], +bounds[1]];
    }
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

  function createCustomPickFromArray(array, emptyArrayDefault) {
    return function pick() {
      return pickFromArray(array, emptyArrayDefault);
    };
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

  // From Underscore.js, except we are using the random function specified in 
  // our constructor instead of Math.random, necessarily.
  function shuffle(array) {
    var length = array.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = roll(index + 1);
      if (rand !== index) {
        shuffled[index] = shuffled[rand];
      }
      shuffled[rand] = array[index];
    }
    return shuffled;
  }

  function sample(array, sampleSize) {
    return shuffle(array).slice(0, sampleSize);
  }

  return {
    roll: roll,
    rollDie: rollDie,
    createRangeTable: createRangeTable,
    createRangeTableFromDict: createRangeTableFromDict,
    createTableFromDef: createTableFromDef,
    convertDictToRangesAndOutcomePairs: convertDictToRangesAndOutcomePairs,
    pickFromArray: pickFromArray,
    crossArrays: crossArrays,
    getCartesianProduct: getCartesianProduct,
    shuffle: shuffle,
    sample: sample
  };
}

var probable = createProbable();

if (typeof module === 'object') {
  module.exports = probable;
  module.exports.createProbable = createProbable;
}
