KeyHandler = function()
{
	this.lastKeyTime = new Date();	
	this.lastLetterTime = new Date();
}

KeyHandler.prototype = 
{
    handleKeyDown:function(e)
    {
   		this.handleKey(e);
    },
    
    handleKeyPress:function(e)
    {
    	if (false)
    	{
    		this.handleKey(e);
    	}
    },
    
    handleKey:function(e)
    {	
    	var keynum;
		var keychar;
		var numcheck;

		keyHandler.lastKeyTime = new Date();

		if(window.event) // IE
		{
			keynum = window.event.keyCode
		}
		else if(e.which) // Netscape/Firefox/Opera
		{
			keynum = e.which
		}
		
		if (dialogs.showingVideo)
		{
			dialogs.hideDialog();
		}
		
		switch (keynum)
		{
			case 8: board.handleBackspace(); break;
			case 9: board.handleTab(); break;
			case 13: board.handleEnter(); break;
			case 63234:
			case 37: board.handleArrowPressed("left"); break;
			case 63232:
			case 38: board.handleArrowPressed("up"); break;
			case 63235:
			case 39: board.handleArrowPressed("right"); break;
			case 63233:
			case 40: board.handleArrowPressed("down"); break;
			case 46: board.handleDelete(); break;
			default:
				keychar = String.fromCharCode(keynum).toUpperCase();				
				
				if (keychar == " ")
				{
					board.handleSpace();
				}
				if ((keychar >= "A") && (keychar <= "Z"))
				{ 		
					board.handleLetterTyped(keychar);
				}
				keyHandler.lastLetterTime = new Date();
				break;			
		}
    },
    
    wasLastLetterPressSecsAgo:function(secs)
    {
    	var now = new Date();
    	
    	return (now.getTime() - this.lastLetterTime.getTime())/1000 > secs;
    }
}
keyHandler = new KeyHandler();
