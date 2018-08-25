test:
	./node_modules/.bin/mocha --ui tdd tests/probabletests.js
	node tests/cascading-tests.js

lint:
	./node_modules/.bin/eslint .

pushall:
	git push origin master && npm publish
