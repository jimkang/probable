// These tests need to be run with the "--ui tdd" switch.
// They should be run after the server (app.js) has been started.

var assert = require('assert');
var probable = require('../probable');
var seedrandom = require('seedrandom');

// var _ = require('lodash');

var settings = {
  rangeTableAParams: [
    [[0, 80], 'a'],
    [[81, 95], 'b'],
    [[96, 100], 'c']
  ],
  rangeTableBParams: {
    success: 20,
    doover: 5,
    failure: 30
  }
};

var utils = {};

suite('roll', function rollSuite() {
  test('should roll results that are within 0 and 5.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.roll(6);
        assert.ok(result >= 0);
        assert.ok(result < 6);
      }
      testDone();
    }
  );

  var maxInt = 9007199254740992;
  test('should roll results that are within 0 and maxInt - 1.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.roll(maxInt);
        // console.log(result);
        assert.ok(result >= 0);
        assert.ok(result < maxInt);
      }
      testDone();
    }
  );

  test('should roll 0 when rolling a 0-sided die.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.roll(0);
        assert.ok(result === 0);
      }
      testDone();
    }
  );

  test('should roll 0 when rolling a 1-sided die.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.roll(1);
        assert.ok(result === 0);
      }
      testDone();
    }
  );

});

suite('rollDie', function rollDieSuite() {
  test('should roll results that are within 1 and 6, inclusive.',
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.rollDie(6);
        assert.ok(result >= 1);
        assert.ok(result <= 6);
      }
      testDone();
    }
  );

  var maxInt = 9007199254740992;
  test('should roll results that are within 1 and maxInt, inclusive.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.rollDie(maxInt);
        // console.log(result);
        assert.ok(result >= 1);
        assert.ok(result <= maxInt);
      }
      testDone();
    }
  );

  test('should roll 0 when rolling a 0-sided die.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.rollDie(0);
        assert.ok(result === 0);
      }
      testDone();
    }
  );

  test('should roll 1 when rolling a 1-sided die.', 
    function rollD6(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.rollDie(1);
        assert.ok(result === 1);
      }
      testDone();
    }
  );

});

suite('pickFromArray', function pickFromArraySuite() {
  test('should return the emptyArrayDefault when picking from an empty array.', 
    function pickFromEmpty(testDone) {
      assert.equal(probable.pickFromArray([], 'Empty'), 'Empty');
      testDone();
    }
  );

  test('should return the emptyArrayDefault when picking from a non-array.', 
    function pickFromNonArray(testDone) {
      assert.equal(probable.pickFromArray({}, 'Empty'), 'Empty');
      testDone();
    }
  );

  test('should return the emptyArrayDefault when picking from undefined', 
    function pickFromUndefined(testDone) {
      assert.equal(probable.pickFromArray(undefined, 'Empty'), 'Empty');
      testDone();
    }
  );

  test('should always return the same result when picking from a ' + 
    'single-element array', 
    function pickFromSingleElementArray(testDone) {
      for (var i = 0; i < 10; ++i) {
        assert.equal(probable.pickFromArray(['hay']), 'hay');
      }
      testDone();
    }
  );

  test('should always return an element in the array when picking from a ' + 
    'two-element array', 
    function pickFromTwoElementArray(testDone) {
      for (var i = 0; i < 100; ++i) {
        var result = probable.pickFromArray(['hay', 'guys']);
        assert.ok(result === 'hay' || result === 'guys');
      }
      testDone();
    }
  );

  test('should always return an element in the array when picking from a ' + 
    'multi-element array', 
    function pickFromBiggerArray(testDone) {
      var array = [];
      for (var j = 0; j < 1000; ++j) {
        array.push(probable.roll(10000));
      }
      for (var i = 0; i < 100; ++i) {
        var result = probable.pickFromArray(array);
        assert.ok(array.indexOf(result) > -1);
      }
      testDone();
    }
  );

});

suite('createRangeTable', function createRangeTableSuite() {
  test('should create a rangeTable', function createRangeTableTest(testDone) {
    var table = probable.createRangeTable(settings.rangeTableAParams);
    assert.equal(typeof table, 'object');
    assert.equal(table.length, 101);

    for (var i = 0; i <= 100; ++i) {
      var outcome = table.outcomeAtIndex(i);
      var expectedValue = 'a';
      if (i > 80 && i < 96) {
        expectedValue = 'b';
      }
      else if (i >= 96) {
        expectedValue = 'c';
      }
      assert.equal(expectedValue, outcome);
    }

    for (var j = 0; j <= 100; ++j) {
      var outcome = table.roll();
      assert.ok(outcome === 'a' || outcome === 'b' || outcome === 'c');
      // TODO: Make sure the outcome distribution is reasonable.
    }

    assert.equal(table.length, 101);

    testDone();
  });
});


suite('createRangeTableFromDict', function createRangeTableFromDictSuite() {
  test('should create a rangeTable from a dict', 
    function createRangeTableFromDictTest(testDone) {
      var table = probable.createRangeTableFromDict(settings.rangeTableBParams);
      assert.equal(typeof table, 'object');
      assert.equal(table.length, 55);

      for (var i = 0; i < 55; ++i) {
        var outcome = table.outcomeAtIndex(i);
        var expectedValue = 'failure';
        if (i > 29 && i < 50) {
          expectedValue = 'success';
        }
        else if (i >= 50) {
          expectedValue = 'doover';
        }
        assert.equal(expectedValue, outcome);
      }

      for (var j = 0; j <= 100; ++j) {
        var outcome = table.roll();
        assert.ok(outcome === 'failure' || outcome === 'success' || 
          outcome === 'doover');
        // TODO: Make sure the outcome distribution is reasonable.
      }

      testDone();
    }
  );
});

suite('Custom probable', function customRandomSuite() {
  test('should use custom random fn', function customRandomTest(testDone) {
    var altprob = probable.createProbable({
      random: function notSoRandom() {
        return 0.5;
      }
    });

    for (var i = 0; i> 100; ++i) {
      assert.equal(altprob.roll(3), 1);
    }

    var table = altprob.createRangeTable(settings.rangeTableAParams);      

    for (var j = 0; j <= 100; ++j) {
      var outcome = table.roll();
      assert.equal(outcome, 'a');
    }

    testDone();
  });
});


suite('convertDictToRangesAndOutcomePairs', function convertSuite() {
  test('should return an array of arrays, sorted by size', 
    function convertTest() {
      var pairs = probable.convertDictToRangesAndOutcomePairs(
        {
          second: 25,
          first: 50,
          fourth: 10,
          third: 20
        }
      );

      assert.deepEqual(pairs,
        [
          [[0, 49], 'first'],
          [[50, 74], 'second'],
          [[75, 94], 'third'],
          [[95, 104], 'fourth']
        ]
      );
    }
  );
});

suite('getCartesianProduct', function crossArraysSuite() {
  test('should combine every element in array A with every element in array B', 
    function crossArraysTest() {
      var a = ['a', 'b', 'c', 'd'];
      var b = [0, 1, 2];
      assert.deepEqual(probable.getCartesianProduct([a, b]),
        [
          ['a', 0],
          ['a', 1],
          ['a', 2],
          ['b', 0],
          ['b', 1],
          ['b', 2],
          ['c', 0],
          ['c', 1],
          ['c', 2],
          ['d', 0],
          ['d', 1],
          ['d', 2]
        ]
      );
    }
  );

  test('should gemerate an empty array if one of the params is an empty array', 
    function crossEmptyArrayTest() {
      var a = ['a', 'b', 'c', 'd'];
      var b = [];
      assert.deepEqual(probable.getCartesianProduct([a, b]), []);
    }
  );

  test('cross array with one-element array', 
    function crossOneElementArrayTest() {
      var a = ['a', 'b', 'c', 'd'];
      var b = [100];
      assert.deepEqual(probable.getCartesianProduct([a, b]),
        [
          ['a', 100],
          ['b', 100],
          ['c', 100],
          ['d', 100]
        ]
      );
    }
  );

  test('should get the Cartesian product of three arrays', 
    function threeArrayCartesianProductTest() {
      var product = probable.getCartesianProduct([
          [null, 'a', 'b'],
          ['omega', 'gamma'],
          [null, 1, 2]
        ]);

      assert.deepEqual(product,
        [
          [null, 'omega', null],
          [null, 'omega', 1],
          [null, 'omega', 2],
          [null, 'gamma', null],
          [null, 'gamma', 1],
          [null, 'gamma', 2],
          ['a', 'omega', null],
          ['a', 'omega', 1],
          ['a', 'omega', 2],
          ['a', 'gamma', null],
          ['a', 'gamma', 1],
          ['a', 'gamma', 2],
          ['b', 'omega', null],
          ['b', 'omega', 1],
          ['b', 'omega', 2],
          ['b', 'gamma', null],
          ['b', 'gamma', 1],
          ['b', 'gamma', 2]
        ]
      );
    }
  );

test('should get the Cartesian product of four arrays', 
    function fourArrayCartesianProductTest() {
      var product = probable.getCartesianProduct([
          [null, 'a', 'b'],
          ['omega', 'gamma'],
          [null, 1, 2],
          ['Bonus Cat', 'Dr. Wily']
        ]);

      assert.deepEqual(product,
        [
          [null, 'omega', null, 'Bonus Cat'],
          [null, 'omega', null, 'Dr. Wily'],
          [null, 'omega', 1, 'Bonus Cat'],
          [null, 'omega', 1, 'Dr. Wily'],
          [null, 'omega', 2, 'Bonus Cat'],
          [null, 'omega', 2, 'Dr. Wily'],
          [null, 'gamma', null, 'Bonus Cat'],
          [null, 'gamma', null, 'Dr. Wily'],
          [null, 'gamma', 1, 'Bonus Cat'],
          [null, 'gamma', 1, 'Dr. Wily'],
          [null, 'gamma', 2, 'Bonus Cat'],
          [null, 'gamma', 2, 'Dr. Wily'],

          ['a', 'omega', null, 'Bonus Cat'],
          ['a', 'omega', null, 'Dr. Wily'],
          ['a', 'omega', 1, 'Bonus Cat'],
          ['a', 'omega', 1, 'Dr. Wily'],
          ['a', 'omega', 2, 'Bonus Cat'],
          ['a', 'omega', 2, 'Dr. Wily'],
          ['a', 'gamma', null, 'Bonus Cat'],
          ['a', 'gamma', null, 'Dr. Wily'],
          ['a', 'gamma', 1, 'Bonus Cat'],
          ['a', 'gamma', 1, 'Dr. Wily'],
          ['a', 'gamma', 2, 'Bonus Cat'],
          ['a', 'gamma', 2, 'Dr. Wily'],

          ['b', 'omega', null, 'Bonus Cat'],
          ['b', 'omega', null, 'Dr. Wily'],
          ['b', 'omega', 1, 'Bonus Cat'],
          ['b', 'omega', 1, 'Dr. Wily'],
          ['b', 'omega', 2, 'Bonus Cat'],
          ['b', 'omega', 2, 'Dr. Wily'],
          ['b', 'gamma', null, 'Bonus Cat'],
          ['b', 'gamma', null, 'Dr. Wily'],
          ['b', 'gamma', 1, 'Bonus Cat'],
          ['b', 'gamma', 1, 'Dr. Wily'],
          ['b', 'gamma', 2, 'Bonus Cat'],
          ['b', 'gamma', 2, 'Dr. Wily']
        ]
      );
    }
  );  

});

suite('Shuffle', function shuffleSuite() {
  test('should shuffle', function shuffleTest(testDone) {
    var prob = probable.createProbable({
      random: seedrandom('shuffleupagus')
    });

    var shuffled = prob.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    assert.deepEqual(
      shuffled,
      [5, 1, 12, 10, 6, 7, 2, 8, 4, 3, 11, 9, 0]
    );

    testDone();
  });
});
