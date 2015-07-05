var test = require('tape');

var createProbable = require('../probable').createProbable;
var seedrandom = require('seedrandom');

test('Sample from a small array', function small(t) {
  t.plan(1);

  var probable = createProbable({
    random: seedrandom('small')
  });

  var time = process.hrtime();
  var sampled = probable.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3);
  var diff = process.hrtime(time);
  console.log('small array sample took %d ns.', diff[0] * 1e9 + diff[1]);
  
  t.deepEqual(sampled, [2, 4, 8], 'Returns correct sample results.');
});

test('Sample from a large array', function large(t) {
  t.plan(5);

  var probable = createProbable({
    random: seedrandom('large')
  });

  // 50 million. large array sample took 12624367367 ns.
  var arraySize = 50000000;
  var sampleSize = arraySize/4;
  var largeArray = [];
  for (var i = 0; i < arraySize; ++i) {
    largeArray.push(i);
  }

  var time = process.hrtime();
  var sampled = probable.sample(largeArray, sampleSize);
  var diff = process.hrtime(time);
  console.log('large array sample took %d ns.', diff[0] * 1e9 + diff[1]);
  
  t.equal(sampled.length, sampleSize, 'Returns correct sample size.');
  t.equal(
    sampled[0], 33311677, 'Sample is correct at spot 0.'
  );
  t.equal(
    sampled[~~(sampleSize/3)],
    14059810,
    'Sample is correct at spot sampleSize/3.'
  );
  t.equal(
    sampled[~~(sampleSize/3 * 2)],
    1594945,
    'Sample is correct at spot sampleSize/3 * 2.'
  );
  t.equal(
    sampled[sampleSize - 1], 39277954, 'Sample is correct at sampleSize - 1.'
  );
});
