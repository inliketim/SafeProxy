/*
The MIT License (MIT)

Copyright (c) 2015 Tim Rozycki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

SafeProxy = {};

SafeProxy.safe = function(funcToProxy){
	var result = function(){
		try{
			funcToProxy.apply(undefined, arguments);
		}
		catch(err){
			handler = function(){
				throw err;
			};
			setTimeout(handler, 1);
		};
	};
	return result;
};

SafeProxy.safeParameters = function(funcToProxy){
	var result = function(){
		safeArguments = [];
		if(arguments && arguments.length){
			for(index=0; index < arguments.length; ++index){
				unsafeArg = arguments[index];
				if(typeof(unsafeArg)==="function"){
					safeArguments.push(SafeProxy.safe(unsafeArg))
				}
				else{
					safeArguments.push(unsafeArg);
				}
			};
		}
		//TODO: write a test that fails when we pass undefined rather than this, as the first argument to apply().
		// For example, wrapping jQuery's .on() method will cause errors.
		//Get a full understanding of what's happening here and make the right fix if just passing "this" is not always correct.
		funcToProxy.apply(this, safeArguments);
	};
	return result;
}