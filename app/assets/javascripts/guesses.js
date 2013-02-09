Guesses = function()
{
	this.list = new Array();
	
	this.conversations = new Array();
	this.completions = new Array();
	
	this.GUESSES_TIME = 15 * 1000;	
	this.SUBMIT_AFTER_TIME = 15 * 1000;

  setTimeout(this.submitGuessesTimer, this.GUESSES_TIME);	
  //API.getRecentClueCompletions(challengeID, this.onReceivedRecentClueCompletions);	
}

Guesses.prototype = 
{
	add:function(p, letter)
	{
		this.removeAt(p);
		
		var guess = new Object;
		guess.x = p.x;
		guess.y = p.y;
		guess.letter = letter;		
		guess.submitted = false;
		guess.correct = true; //TODO: not really but board needs
		guess.enteredTime = new Date();
		
		this.list.push(guess);
    
    this._displayGuesses();		
    
    if (true) {
      guesses.submitGuesses(true);								
    }
	},
	
	removeAt:function(absP)
	{
		//TODO: combine with other?
		for (var i = 0; i < this.list.length; i++)
		{
			var guess = this.list[i];
			
			if ((guess.x == absP.x) && (guess.y == absP.y))
			{
				this.list.splice(i, 1);
				this._displayGuesses();
				return;
			}
		}		
	},
  
  movesPerTurn: function()
  {
    return 0;
  },
   
  can_add:function()
  {
    if (this.movesPerTurn() <= 0)
    {
      return true;
    }
    
    var left = this.movesPerTurn() - this._countPending();
    return (left > 0);
  },
	
	_displayGuesses:function()
	{
		var el = $('pending_guesses');
		if (el)
		{
			var cnt = this._countPending();
			var html = cnt + " letter";
			if (cnt != 1) html += "s";
       
      if (this.movesPerTurn() != 0)
      {
        var left = this.movesPerTurn() - this._countPending();
        html += "<br/><em>" + left + " guesses left</em>";
      }
			
			el.innerHTML = html;
		}
	},
	
	_countPending:function()
	{
		return this._getPendingList().length;
	},
	
	_getPendingList:function()
	{
		var pending = new Array();
		for (var i = 0; i < this.list.length; i++)
		{
			if (this.list[i].submitted == false)
			{
				pending.push(this.list[i]);
			}
		}
		
		return pending;
	},
	
	_getToSubmitList:function()
	{
		var toSubmit = new Array();
		var now = new Date();
		
		for (var i = 0; i < this.list.length; i++)
		{
			var guess = this.list[i];
			var timeDiff = now.getTime() - guess.enteredTime.getTime();
			
			if ((guess.submitted == false) && (timeDiff > this.SUBMIT_AFTER_TIME))
			{
				toSubmit.push(this.list[i]);
			}
		}
		
		return toSubmit;
	},
	
	getGuess:function(absP)
	{
		for (var i = 0; i < this.list.length; i++)
		{	
			var guess = this.list[i];
			if ((guess.x == absP.x) && (guess.y == absP.y))			
			{				
				return guess;
			}
		}
		
		return null;
	},

	hasGuess:function(p)
	{
		return (this.getGuess(p) != null);
	},
	
	submitGuessesTimer:function()
	{
		var auto = $('autosubmit');
		if ((auto) && (auto.checked))
		{
			guesses.submitGuesses(false);
		}
    else
    {
        guesses.keepAlive();
    }

//		if ((keyHandler.wasLastLetterPressSecsAgo(15)) && (!dialogs.isDialogVisible()) && (canAsk))
//		{
//			if ((guesses.lastSubmittedGuesses) && (!isFramed))
//			{
//				data.showClueTagger();
//			}
//		}
	
		guesses.reDrawCompletions();
		
		setTimeout(guesses.submitGuessesTimer, guesses.GUESSES_TIME);
	},
	
	submitGuesses:function(force)
	{
		var toSubmitList;
		if (force)
		{
			toSubmitList = this._getPendingList();
		}
		else
		{
			toSubmitList = this._getToSubmitList();
		}
		
		if (toSubmitList.length > 0)
		{
      var that = this;
        var gs = '';
        for (var i = 0; i < toSubmitList.length; i++) {
          var g = toSubmitList[i];
          if (i > 0) { 
            gs += '-';
          }
          gs += g.x + "," + g.y + "," + g.letter;
        }
        var params = 'challenge_id=' + challengeID;
        if (sessionID) { params += "&s_id=" + sessionID; }
        params += '&guesses=' + gs;

        //new Ajax.Updater('puzzle_data', '/puzzle/guess?' + params, {asynchronous:true, evalScripts:true});
        
        $.ajax({
          url: '/puzzles/'+puzzleID + '/guess',
          dataType: 'json',
          data: {
            guesses: gs            
          },
          success: function(data) {
            that.onGotGuessesResponses(data);
          }          
        });
        
			this._markAllSubmitted(toSubmitList);
			
      var submit_btn = $('submit_guesses_button');
      if (submit_btn) {
			  submit_btn.innerHTML = "<img src='/images/loader.gif'>";
      }
			
			//urchinTracker('/endlesscrossword/ajax/submitGuesses');
		}
    else
    {
        this.keepAlive();
    }
	},
    
    keepAlive:function()
    {
      if (puzzleID == 1032) {
        return;
      }
        var params = "challenge_id=" + challengeID;
        if(sessionID) { params += "&s_id=" + sessionID; }
        new Ajax.Updater('keepalive', '/puzzle/keepalive?' + params, {asynchronous:true, evalScripts:true});
    },

	getHint:function()
	{
		var pos = board.absSelectedSpot;
		API.getHint(challengeID, pos.x, pos.y, board.currentDirection, this.onGotGuessesResponses);			
	},
		
	_markAllSubmitted:function(list)
	{
		for (var i = 0; i < list.length; i++)
		{
			list[i].submitted = true;
		}
	},
	
	//TODO: pass object to ourselves to DWR so don't get messy naming crap
	onGotGuessesResponses:function(results)
	{
    var submit_btn = $('submit_guesses_button');
    if (submit_btn) {
		  submit_btn.innerHTML = "<input type='button' class='inputsubmit' onClick='guesses.submitGuesses(true)' value='Submit'>";
    }
    
//    if (results.scores) {
//      scores = results.scores;
//      puzzle.showScores(results.scores);
//    } else {
//      puzzle.showScore(results.score);
//    }
		
		for (var i = 0; i < results.guesses.length; i++)
		{
			var guess = results.guesses[i];			
      console.log(guess);
			if (guess.correct)
			{        
				board.data.setLetter(new Point(guess.x, guess.y), guess.letter, guess.user_id);
				guesses.removeAt(new Point(guess.x, guess.y));
			}
			else
			{				
				var g = guesses.getGuess(new Point(guess.x, guess.y));
				g.correct = false;
			}
		}
		
		guesses._displayGuesses();
		board.reDraw();		    
    
		guesses.lastSubmittedGuesses = new Date();
	},
	
	onReceivedRecentClueCompletions:function(completions)
	{
		guesses.completions = completions;
		guesses.reDrawCompletions();
	},
	
	reDrawCompletions:function()
	{
		var html = guesses.getCompletionsHTML(this.completions);
		
		var el = document.getElementById('recent_completions')
		if (el)
		{
			el.innerHTML = html;
		}
	},
	
	reDrawConversations:function()
	{
		var html = guesses.getCompletionsHTML(this.conversations);
		
		document.getElementById('conversations_box').innerHTML = html;
	},
	
	onReverseAjaxReceiveCompletion:function(completion)
	{
		if (completion.puzzleID != puzzleID)
		{
			return;
		}
		guesses.addCompletion(completion);
		guesses.reDrawCompletions();
		
		board.reDraw();
	},
	
	onReverseAjaxReceiveShout:function(shout)
	{
		guesses.updatePuzzleCompletePercent(shout.puzzlePercentage);
		
		guesses.addCompletion(shout);
		guesses.reDrawCompletions();
		
		//guesses.conversations.unshift(shout);		
		//guesses.reDrawConversations();
	},
	
	onReverseAjaxReceiveLogin:function(login)
	{
		guesses.addCompletion(login);
		guesses.reDrawCompletions();
	},
	
	onReverseAjaxReceiveNewClue:function(newClue)
	{
		guesses.addCompletion(newClue);
		guesses.reDrawCompletions();
	},
	
	submitShout:function()
	{
		var el = document.getElementById('shout_text');
		var text = el.value;
		API.say(challengeID, board.absSelectedSpot.x, board.absSelectedSpot.y, board.currentDirection, text, this.onSubmittedShout);
		el.value = "";
	},
	
	onSubmittedShout:function()
	{
		//nothing to do
	},

	addCompletion:function(completion)
	{
		this.updatePuzzleCompletePercent(completion.puzzlePercentage);
		
		guesses.completions.unshift(completion);
		if (completion.type == "completion")
		{
			puzzle.updateClueSolver(completion.clue, completion.who);
			puzzle.updateClueSolution(completion.clue, completion.word);
		}		
	},
	
	updatePuzzleCompletePercent:function(perc)
	{
		var complete = $('percent_complete');
		if (complete)
		{
			complete.innerHTML = perc;
			
			if ((!complete.done) && (perc == "100"))
			{
				complete.done = true;
				dialogs.showPuzzleComplete();
			}
		}
	},
		
	getCompletionsHTML:function(completions)
	{
		if (completions.length == 0)
		{
			return "No clues have been solved recently.";
		}
		
		var len = completions.length;
		if (len > 7) //TODO: define somewhere
		{
			len = 7;
		}
		
		var html = "";		
		for (var i = 0; i < len; i++)
		{
			var obj = completions[i];
			
			var clas = "completion";
			if (i % 2 == 1)
			{
				clas += " alt";
			}
			
			html += "<div class='" + clas + "'>";			

			if (obj.type == "newclue")
			{
				html += this.getNewClueHTML(obj);
			}
			else if (obj.type == "completion")
			{
				html += this.getCompletionHTML(obj);
			}
			else if (obj.type == "completionbyother")
			{
				if (obj.who.id != myUserID)
				{
					html += this.getCompletionHTML(obj);
				}
			}
			else if (obj.type == "shout")
			{
				html += this.getShoutHTML(obj);
			}
			else if (obj.type == "login")
			{
				html += this.getLoginHTML(obj);
			}
			else if (obj.type == "puzzleCompleted")
			{
				html += this.getPuzzleCompletedHTML(obj);
			}
			
			html += "</div>";
		}
		
		return html;
	},
	
	getNewClueHTML:function(newClue)
	{
		var html = "<div>" + this.getUserHTML(newClue.who); 
		html += " added the clue <i>" + newClue.clue + "</i> for the word <strong>" + newClue.word + "</strong></div>";
		html += "<div style='float:right'>" + this.prettyTimeAgo(newClue.when) + "</div><div style='clear:both'></div>";
		
		return html;
	},
	
	getCompletionHTML:function(comp)
	{
		var html = "<div>" + this.getUserHTML(comp.who); 
		html += " solved ";
		if (comp.type == "completion")
		{
			html += this.getClueLinkHTML(comp.clue, "<strong>" + comp.word + "</strong>");
		}
		else
		{
			html += this.getClueLinkHTML(comp.clue);
		}
		html += "</div>";
		html += "<div style='float:right'>" + this.prettyTimeAgo(comp.when) + "</div><div style='clear:both'></div>";
		
		return html;
	},
	
	getClueDisplay:function(clue)
	{
		var dir = "across"; //TODO: can use something else here?
		if (clue.down)
		{
			dir + "down";
		}

		return clue.number + " " + dir;		
	},
	
	getShoutHTML:function(shout)
	{
		var dir = "across"; //TODO: can use something else here?
		if (shout.clue.down)
		{
			dir + "down";
		}
		
		var html = "<div>" + this.getUserHTML(shout.who); 
		html += " said \"" + shout.text + "\"";
		html += " from " + this.getClueLinkHTML(shout.clue) + "</div>";
		html += "<div style='float:right'>" + this.prettyTimeAgo(shout.when) + "</div><div style='clear:both'></div>";
		
		return html;
	},
	
	getLoginHTML:function(login)
	{
		var html = "<div>" + this.getUserHTML(login.who);
		html += " is now working on <a href='Puzzle.action?id=" + login.puzzleID + "'>" + login.puzzleName + "</a>";
		html += "</div>";
		html += "<div style='float:right'>" + this.prettyTimeAgo(login.when) + "</div><div style='clear:both'></div>";
		
		return html;
	},
	
	getPuzzleCompletedHTML:function(comp)
	{
		var html = "<div>" + this.getUserHTML(comp.who);
		html += " finished <a href='Puzzle.action?id=" + comp.puzzleID + "'>" + comp.puzzleName + "</a> with " + comp.score + " points.";
		html += "</div>";
		html += "<div style='float:right'>" + this.prettyTimeAgo(comp.when) + "</div><div style='clear:both'></div>";
		
		return html;
	},

	getUserHTML:function(who)
	{
		return "<a href=\"Person.action?userID=" + who.id + "\">" + who.name + "</a>";
	},
	
	getClueLinkHTML:function(clue, text)
	{
		var clueDir = "across";
		if (clue.down)
		{
			clueDir = "updown";
		}
		var isCurPuzzle = clue.puzzleID == puzzleID;

		if (!text)
		{
			if (isCurPuzzle)
			{
				text = "<strong>" + this.getClueDisplay(clue) + "</strong>";
			}
			else
			{
				text = "<strong>" + clue.puzzleName + "</strong>";
			}
		}

		if ((typeof(board) != "undefined") && (isCurPuzzle))
		{
			return "<a href=\"javascript:board.jumpTo(" + clue.x + "," + clue.y + ",'" + clueDir + "')\">" + text + "</a>";
		}
		else
		{
			return "<a href='Puzzle.action?id=" + clue.puzzleID + "&initialX=" + clue.x + "&initialY=" + clue.y + "'>" + text + "</a>";
		}
	},
	
	//TODO: move to utils class
	shortenString:function(str, max)
	{
		var len = str.length;
		
		if (len < max)
		{
			return str;
		}
		
		return str.substring(0, max - 2) + "...";
	},
	
	prettyTimeAgo:function(d)
	{
		var now = new Date();
        var diff = ((now.getTime() - d.getTime()) / (1000)) | 0; 
		
		if (diff < 1)
		{
			return "just now";
		}
		
		if (diff < 60)
		{
			if (diff == 1)
			{
				return "1 sec ago";
			}
			return diff + " secs ago";
		}
		
		if (diff < 60 * 60)
		{
			var mins = (diff/60)|0;
			if (mins == 1)
			{
				return "1 min ago";
			}			
			return mins + " mins ago";
		}
		
		var hrs = (diff/60/60)|0;
		
		if (hrs == 1)
		{
			return "1 hr ago";
		}
		return hrs + " hrs ago";
	},
	
	hideClueTagger:function()
	{
		var checked = document.getElementById('nomore').checked;
		if (checked)
		{
			API.setNoMoreHelp(challengeID);
			canAsk = false;
		}
		
		this.lastSubmittedGuesses = null;
		dialogs.hideDialog();
	}
		
}
