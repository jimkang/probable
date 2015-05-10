var test = require('tape');

var createProbable = require('../probable').createProbable;
var seedrandom = require('seedrandom');
var Immutable = require('immutable');

var tableParams = Immutable.Map({
  subSubtable: [
    [[0, 24], 'Bulbasaur'],
    [[25, 66], 'Squirtle'],
    [[67, 99], 'Charmander']
  ],
  subtable: [
    [[0, 39], '__set_this_in_the_test__'],
    [[40, 55], 'Human'],
    [[56, 99], 'Rock']
  ],
  outerTable: [
    [[0, 20], 'a'],
    [[21, 95], '__set_this_in_the_test__'],
    [[96, 100], 'c']
  ]
});

test('cascading createRangeTable', function cascadingRangeTable(t) {
  t.plan(1);

  var probable = createProbable({
    random: seedrandom('cascadingRangeTable')
  });

  var subSubtable = probable.createRangeTable(tableParams.get('subSubtable'));

  var subtableParams = tableParams.get('subtable');
  subtableParams[0][1] = subSubtable.roll;
  var subtable = probable.createRangeTable(subtableParams);

  var outerTableParams = tableParams.get('outerTable');
  outerTableParams[1][1] = subtable.roll;
  var outerTable = probable.createRangeTable(outerTableParams);

  t.equal(
    outerTable.roll(), 'Bulbasaur', 'Rolls on subtables as it encounters them.'
  );
});

test('cascading createTableFromDef', function cascadingDefs(t) {
  t.plan(3);

  var subSubtableDef = {
    '0-24': 'Bulbasaur',
    '25-66': 'Squirtle',
    '67-99': 'Charmander'
  };

  var subtableDef = {
    '0-39': subSubtableDef,
    '40-55': [
      'Human',
      'Dwarf',
      'Elf',
      'Illithid'
    ],
    '56-99': 'Rock'
  };

  var outerTableDef = {
    '0-20': 'a',
    '21-95': subtableDef,
    '96-100': 'c'
  };

  var resultsForSeeds = {
    'cascading createTableFromDef': 'a',
    'createTableFromDef': 'Elf',
    'c': 'Squirtle'
  };

  for (seed in resultsForSeeds) {
    var probable = createProbable({
      random: seedrandom(seed)
    });

    var outerTable = probable.createTableFromDef(outerTableDef);

    t.equal(
      outerTable.roll(),
      resultsForSeeds[seed],
      'Rolls on subtables as it encounters them.'
    );
  }
});
