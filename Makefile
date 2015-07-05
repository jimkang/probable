test:
	mocha --ui tdd tests/probabletests.js
	node tests/cascading-tests.js

pushall:
	git push origin master && npm publish
