/*
Because raising an exception is desired/tested behavior for some of the tests, we need to prevent normal error handling for that specific error.
*/
failedFunctionExceptionRaised = false
originalWindowErrorHandler = window.onerror
window.onerror = function(msg, url, line, col, error){
	if(msg=="failed function" || msg=="uncaught exception: failed function"){
		failedFunctionExceptionRaised = true;
	}
	else{
		originalWindowErrorHandler(msg, url, line, col, error);
	}
};
		
failingFunction = function(input){
	throw "failed function";
};

functionWith5Args = function(arg1, arg2, arg3, arg4, arg5){
	if(arg1 && arg2 && arg3 && arg4 && arg5){
		functionWith5Args.callCount++;
		functionWith5Args.lastCallHadAllArguments=true;
	};
};

functionWith5Args.initTestSupportValues = function(){
	functionWith5Args.callCount = 0;
	functionWith5Args.lastCallHadAllArguments = false;	
}

QUnit.test("Without SafeProxy, code stops executing after calling a failing function", function(assert){
	try{
		var lastLineExecuted = false;
		badResult = failingFunction("some input");
		lastLineExecuted = true;
	}
	catch(err){
	}		
	assert.ok(!lastLineExecuted);
});

QUnit.test("With SafeProxy, code continues executing after calling a failing function", function(assert){
	var safeFunction = SafeProxy.safe(failingFunction);
	badResult = safeFunction("some input");
	assert.ok(1=="1","Passed!");
});


QUnit.test("Safe function passes all arguments to the original function", function(assert){
	functionWith5Args.initTestSupportValues()
	var safe5 = SafeProxy.safe(functionWith5Args);
	safe5('1','2',3,'4',5);
	assert.equal(functionWith5Args.callCount, 1);
	assert.ok(functionWith5Args.lastCallHadAllArguments);
});

QUnit.test("Safe function does not copy any properties or methods of the original function", function(assert){
	functionWith5Args.initTestSupportValues()
	var safe5 = SafeProxy.safe(functionWith5Args);
	assert.ok(functionWith5Args.callCount!=undefined);
	assert.ok(safe5.callCount==undefined);
});


QUnit.test("Safe call to a failing function will raise the original exception", function(assert){
	failedFunctionExceptionRaised = false;
	var safeFunction = SafeProxy.safe(failingFunction);
	badResult = safeFunction("some input");
	testForException = function(){
		if(!failedFunctionExceptionRaised){
			throw "test failed for 'Safe call to a failing function will raise the original exception'";
		}
	};
	setTimeout(testForException,5);
	//we cannot make a useful qUnit assert here. By design, the safe proxy will let qUnit finish before re-raising the exception.
	assert.ok(true, "this test will throw an exception outside of the normal qUnit structure if it fails.");
});

QUnit.test("SafeProxy.safeParameters replaces each function in a method's parameters with a safe version of the same function", function(assert){
	//ARRANGE:
	originalMethod = this.spy();
	var func1 = function(){};
	var func2 = function(){};
	var stubbedSafeFunction1 = function(){};
	var stubbedSafeFunction2 = function(){};
	this.stub(SafeProxy, "safe")
	SafeProxy.safe.withArgs(func1).returns(stubbedSafeFunction1);
	SafeProxy.safe.withArgs(func2).returns(stubbedSafeFunction2);
	//ACT:
	methodWithSafeParams = SafeProxy.safeParameters(originalMethod);
	methodWithSafeParams("a",func1, func2);
	//ASSERT:
	args = originalMethod.args[0];
	assert.equal(args[0],"a","Calls the original method with the same value for each non-function parameter");
	assert.equal(args[1], stubbedSafeFunction1,"Calls the original method with a safe version of each function parameter");
	assert.equal(args[2], stubbedSafeFunction2,"Calls the original method with a safe version of each function parameter");
});


