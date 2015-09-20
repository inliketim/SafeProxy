/*
Because raising an exception is desired/tested behavior for some of the tests, we need to prevent normal error handling for that specific error.
*/
var failedFunctionExceptionRaised = false;
var originalWindowErrorHandler = window.onerror;
window.onerror = function(msg, url, line, col, error){
  "use strict";
  if(msg==="failed function" || msg==="uncaught exception: failed function"){
    failedFunctionExceptionRaised = true;
  }
  else{
    originalWindowErrorHandler(msg, url, line, col, error);
  }
};
		
var failingFunction = function(){
  "use strict";
  throw "failed function";
};

var functionWith5Args = function(arg1, arg2, arg3, arg4, arg5){
  "use strict";
  if(arg1 && arg2 && arg3 && arg4 && arg5){
    functionWith5Args.callCount +=1;
    functionWith5Args.lastCallHadAllArguments=true;
  }
};

functionWith5Args.initTestSupportValues = function(){
  "use strict";
  functionWith5Args.callCount = 0;
  functionWith5Args.lastCallHadAllArguments = false;	
};

QUnit.test("Without SafeProxy, code stops executing after calling a failing function", function(assert){
  "use strict";
  var lastLineExecuted = false;
  try{
    failingFunction("some input");
    lastLineExecuted = true;
  }
  catch(ex){}		
  assert.ok(!lastLineExecuted);
});

QUnit.test("With SafeProxy, code continues executing after calling a failing function", function(assert){
  "use strict";
  var safeFunction = SafeProxy.safe(failingFunction);
  safeFunction("some input");
  assert.ok(true,"Executed a line after failing function.");
});


QUnit.test("Safe function passes all arguments to the original function", function(assert){
  "use strict";
  functionWith5Args.initTestSupportValues();
  var safe5 = SafeProxy.safe(functionWith5Args);
  safe5('1','2',3,'4',5);
  assert.equal(functionWith5Args.callCount, 1);
  assert.ok(functionWith5Args.lastCallHadAllArguments);
});

QUnit.test("Safe function does not copy any properties or methods of the original function", function(assert){
  "use strict";
  functionWith5Args.initTestSupportValues();
  var safe5 = SafeProxy.safe(functionWith5Args);
  assert.ok(functionWith5Args.callCount!==undefined);
  assert.ok(safe5.callCount===undefined);
});


QUnit.test("Safe call to a failing function will raise the original exception", function(assert){
  "use strict";
  failedFunctionExceptionRaised = false;
  var safeFunction = SafeProxy.safe(failingFunction);
  safeFunction("some input");
  var testForException = function(){
    if(!failedFunctionExceptionRaised){
      throw "test failed for 'Safe call to a failing function will raise the original exception'";
    }
  };
  setTimeout(testForException,5);
  //we cannot make a useful qUnit assert here. By design, the safe proxy will let qUnit finish before re-raising the exception.
  assert.ok(true, "this test will throw an exception outside of the normal qUnit structure if it fails.");
});



QUnit.test("Calling a SafeProxy.safe method on something that is not a function will throw a SafeProxy.ArgumentError", function(assert){
  "use strict";
  var someObject = {};
  try{
    var safeMethod = SafeProxy.safe(someObject);
  }
  catch (ex){
    assert.ok(ex instanceof SafeProxy.ArgumentError);
    assert.ok(ex instanceof Error);
  }
});

QUnit.test("Value of 'this' inside a function will be the same whether the function is called directly or through the SafeProxy.safe version", function(assert){
  "use strict";
  var lastThis = null;
  var rememberThis = function(){
    lastThis = this;
  };
  var safeRememberThis = SafeProxy.safe(rememberThis);
  var fakeThis = new Object();
  rememberThis.apply(fakeThis,[]);
  var unsafeThis = lastThis;
  rememberThis.trackingCode += 1;
  safeRememberThis.apply(fakeThis,[]);
  var safeThis = lastThis;
  assert.equal(unsafeThis, safeThis);
});


