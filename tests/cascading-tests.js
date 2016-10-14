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

var easyCreateTestCases = [
  {
    createFnName: 'createTableFromDef',
    getOuterTableDef: function getOuterTableDef() {
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
      return {
        '0-20': 'a',
        '21-95': subtableDef,
        '96-100': 'c'
      };
    },
    resultsForSeeds: {
      'cascading createTableFromDef': 'a',
      'createTableFromDef': 'Elf',
      'c': 'Squirtle'
    }
  },

  {
    createFnName: 'createTableFromSizes',
    getOuterTableDef: function getOuterTableDef() {
      var subSubtableDef = [
        [25, 'Bulbasaur'],
        [42, 'Squirtle'],
        [33, 'Charmander']
      ];
      var subtableDef = [
        [40, subSubtableDef],
        [
          15,
          [
            'Human',
            'Dwarf',
            'Elf',
            'Illithid'
          ]
        ],
        [44, 'Rock']
      ];
      return [
        [21, 'a'],
        [75, subtableDef],
        [5, 'c']
      ];
    },
    resultsForSeeds: {
      'cascading createTableFromDef': 'a',
      'createTableFromDef': 'Elf',
      'c': 'Squirtle'
    }
  }
];

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


easyCreateTestCases.forEach(runEasyCreateTest);

function runEasyCreateTest(testCase) {
  test('cascading ' + testCase.createFnName, easyCreateTest);

  function easyCreateTest(t) {
    t.plan(3);

    for (var seed in testCase.resultsForSeeds) {
      var probable = createProbable({
        random: seedrandom(seed)
      });

      var outerTable = probable[testCase.createFnName](testCase.getOuterTableDef());

      t.equal(
        outerTable.roll(),
        testCase.resultsForSeeds[seed],
        'Rolls on subtables as it encounters them.'
      );
    }
  }
}

