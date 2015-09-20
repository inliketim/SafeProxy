# SafeProxy
Make any javascript function "safe". Exceptions in the function will not prevent your other code from running. For example, when setting up event handlers, you may prefer other event handlers to run even when one fails.

```javascript
// A simple example use case for SafeProxy: 
//  - binding several event handlers to the same event
//  - you don't want one failing event handler to prevent other handlers from responding to that event.
// requires JQuery and SafeProxy scripts:
//http://code.jquery.com/jquery.min.js
//https://raw.githubusercontent.com/inliketim/SafeProxy/master/SafeProxy.js

    var failingEventHandler = function(){
      console.log("broken event handler called");
      throw("broken event handler failed");
    };
    var secondEventHandler = function(){
      console.log("second event handler called");
    };

    $(document).on("someEvent", SafeProxy.safe(failingEventHandler))
    $(document).on("someEvent", SafeProxy.safe(secondEventHandler));
    console.log("triggering event with SafeProxy.safe event handlers - the second event handler will be called even though the first one failed");
    $(document).trigger("someEvent");
    $(document).off("someEvent");
    
    $(document).on("someEvent", failingEventHandler)
    $(document).on("someEvent", secondEventHandler);
    console.log("triggering event with unsafe event handlers - the second event handler will not execute");
    $(document).trigger("someEvent");
    $(document).off("someEvent");
```