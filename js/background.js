chrome.extension.onMessage.addListener(
  	function(request, sender, sendResponse) {
  		if(request.action=="get_setting")
	  	{	
	  		sendResponse(
	  			get_options()
	  		);
	  	}
	}

);