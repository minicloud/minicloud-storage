SRC = lib/*.js

include node_modules/make-lint/index.mk

BIN = iojs

ifeq ($(findstring io.js, $(shell which node)),)
	BIN = node
endif

ifeq (node, $(BIN))
	FLAGS = --harmony-generators
endif

REQUIRED = --require should --require should-http --require co-mocha

TESTS = test/large-file-upload \
 		test/simple-file-upload \
        test/status \
        test/unit
		
test:
	@NODE_ENV=test $(BIN)  \
		./node_modules/.bin/_mocha \
		$(REQUIRED) \
		$(TESTS) \
		--bail 
test-cov:
	@NODE_ENV=test  $(BIN) $(FLAGS) \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		$(REQUIRED) \
		$(TESTS) \
		--bail	 
test-travis:
	@NODE_ENV=test ORM_PROTOCOL=mysql $(BIN) $(FLAGS) \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		$(REQUIRED) \
		$(TESTS) \
		--bail  
bench:
	@$(MAKE) -C benchmarks

.PHONY: test bench
