probable
========

probable is a set of utilities for selecting things at random, including setting up D&D-like random tables.

Here is an [example](http://jimkang.com/probable/examples/browser.html).

Usage
-----

In the browser:

    <script src="node_modules/probable/probable.js"></script>

In Node:

    var probable = require('probable');

From there, you just use the `probable` object.

`roll` is a function that basically rolls a die for you. It will randomly generate an integer between 0 and one less than the number of "sides" you specify. For example, `probable.roll(5)` will return 0, 1, 2, 3, 4, or 5.

`pickFromArray` will randomly pick an element of an array that you give it, giving each element equal weight.

`createRangeTable` will create an object for you that represents a table that maps ranges of numbers to outcomes. If you give it

    [
      [[0, 80], 'a'],
      [[81, 95], 'b'],
      [[96, 99], 'c']
    ]

&mdash; it will create a table in which indexes 0 through 80 map to an outcome of 'a', 81-95 map to an outcome of 'b', and 96-99 map to an outcome of 'c'. You can use its `outcomeAtIndex` to get the outcome for a particular index.

You can use the `roll` method to randomly select an index covered by the definition (in the example above, 0-99), then return the outcome corresponding to it.

`createRangeTableFromDict` is a wrapper for `createRangeTable` that may be more convenient in some cases. Instead of giving it explicit ranges, you just specify how much probabiity space you want each outcome to take up. The createRangeFromTable above would be created by createRangeTableFromDict if you gave it this dictionary:

    {
      a: 80,
      b: 15,
      c: 5
    }

The drawback of this method is that all of the outcomes must be strings.


Installation
------------

    npm install probable

Tests
-----

First, install mocha if you don't have it installed already:

    npm install -g mocha

Then:

    npm test

License
-------

ISC.
