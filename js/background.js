chrome.extension.onMessage.addListener(
  	function(request, sender, sendResponse) {
  		if(request.greeting=="query")
	  	{	
	  		sendResponse({
	  			grade_term: get_option('grade_term'),
	  			class_term: get_option('grade_term'),
	  			script_function: get_option('script_function')
	  		});
	  	}
	}

);