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
	}
	return result;
};