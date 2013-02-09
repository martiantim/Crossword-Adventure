Puzzle = function(width, height)
{
	this.width = width;
	this.height = height;
	this.data = null;
	this.clues = null;
	this.minX = 0;
	this.minY = 0;
	this.maxX = 0;
	this.maxY = 0;	

	this.loadingPuzzleData = false;
	this.isClueLinksOpen = false;
	this.score = 0;
	this.isSample = false;
	this.isFirstLoad = true;
	this.lastShownClue = null;
  this.viewportHeight = null;
	
	this.PRELOAD = 10;
}

Puzzle.prototype = 
{
	grabData:function(minx, miny, maxx, maxy)
	{
		if (minx < 0) minx = 0;
		if (maxx > this.width) maxx = this.width;
		if (miny < 0) miny = 0;
		if (maxy > this.height) maxy = this.height;
		
		if (this._isWithin(minx, miny, maxx, maxy))
		{
			return;
		}
		
		if (this.loadingPuzzleData == true)
		{
			return;
		}
		
    var that = this;
    $.ajax({
      url: '/puzzles/'+puzzleID + '/section',
      dataType: 'json',
      data: {
        x1: (minx - this.PRELOAD),
        y1: (miny - this.PRELOAD),
        x2: (maxx + this.PRELOAD),
        y2: (maxy + this.PRELOAD)
      },
      success: function(data) {
        that.setDataFromServer(data);
      }
    });
    
     //TODO: use library to put these together
//        var params = "challenge_id=" + challengeID;
//        params += "&x1=" + (minx - this.PRELOAD);
//        params += "&y1=" + (miny - this.PRELOAD);
//        params += "&x2=" + (maxx + this.PRELOAD);
//        params += "&y2=" + (maxy + this.PRELOAD);
//        params += "&show_complete=" + showComplete;
//        new Ajax.Updater('puzzle_data', '/puzzle/section?' + params, {asynchronous:true, evalScripts:true});
        
		//API.getPuzzleSection(challengeID, minx - this.PRELOAD, miny - this.PRELOAD, maxx + this.PRELOAD, maxy + this.PRELOAD, showComplete, this.onReceivedPuzzle);
		this.loadingPuzzleData = true;
	},
	
	_isWithin:function(minx, miny, maxx, maxy)
	{
		if (minx < this.minX) return false;
		if (maxx > this.maxX) return false;
		if (miny < this.minY) return false;
		if (maxy > this.maxY) return false;
		
		return true;		
	},

	setData:function(pattern, clue)
	{
		this.minX = 0;
    this.minY = 0;
    this.maxX = pattern.length;
    this.maxY = 1;
    this.isSample = true;
	    
		this.data = new Array();		
		
		for (var i = 0; i < pattern.length; i++)
		{             
			this.data[i] = new Array();
			this.data[i][0] = pattern[i];
		}
		
		this.clues = new Array();
		this.clueList = new Array();
	  
     var clueObj = new Object;
     clueObj.point = new Point(0,0);
     clueObj.down = false;
     clueObj.number = 1;
     clueObj.length = pattern.length;
     clueObj.text = clue;      

	   this._hashClue(clueObj);
	},
	
	onReceivedPuzzle:function(puz)
	{
     puzzle.setDataFromServer(puz);
  },
  
  setDataFromServer:function(puz)
  {
		this.minX = puz.minX;
		this.minY = puz.minY;
		this.maxX = puz.maxX;
		this.maxY = puz.maxY;
		
		this.data = puz.grid;
		this.clues = new Array();
		this.clueList = new Array();
	
		puz.clues.sort(this._compareClueNumbers);	
    console.log("Clues: " + puz.clues.length);
		for (var i = 0; i < puz.clues.length; i++)
		{
			var clue = puz.clues[i];      
			clue.point = new Point(clue.x, clue.y);
      clue.direction = directionFromClue(clue);
			this._hashClue(clue);
		}
		
		this.loadingPuzzleData = false;

		if (this.isFirstLoad)
		{
			board.validateSelectedPosition();
		}
		         
    //for simple puzzles where might not have clue in cur dir
    board._swapCurrentDirection();
    board._swapCurrentDirection();        

		board.reDraw();        
		if (guesses) { guesses._displayGuesses(); }				
	},
	
	_showClueList:function(clues, dir)
	{
    var d = $('#'+dir.plural);
		if (!d) return;
		
		var html = "";
		for (var i = 0; i < clues.length; i++)
		{
			var clue = clues[i];
			
			if (clue.direction == dir)
			{
				var text = clue.text;
				if (text.split(':').length == 3) text = text.split(':')[2]; //TODO: super-hackey
				
				html += "<div id='" + this._getKeyForClue(clue) + "' class='listclue' onclick=\"board.jumpTo(" + clue.x + "," + clue.y + ",'" + dir.display + "', false)\">";
				html += "<div class='listclue_num'>" + clue.number + ".</div>";
				html += "<div class='listclue_text'>" + text + "</div>";
				html += "<div class='clear'></div></div>";
			}
		}
		
		d.innerHTML = html;
	},
	
	scrollToClue:function(clue)
	{
    return false;
    
		var d = $(this._getKeyForClue(clue));
		if (d) {
			if (this.viewPortHeight() > 550) {
				//d.scrollIntoView(false);
			}
			$$('div.selectedclue').each(function(el){ el.removeClassName('selectedclue'); });
			
			d.addClassName('selectedclue');
		}
	},
   
  viewPortHeight:function()
  {
    return 600;
    
    if (this.viewportHeight) { return this.viewportHeight }
    this.viewportHeight = document.viewport.getHeight();
    return this.viewportHeight;
  },
	
	_compareClueNumbers:function(a, b)
	{
		return a.number - b.number;
	},
	
	showScore:function(user)
	{
		if ((!user) || (!$('score')))
		{
			return;
		}
		
		this.score = user.score;
		
		var html = this._getScoreLineHTML("Score", user.score);
		// html += this._getScoreLineHTML("Words finished", user.words_completed);
		html += this._getScoreLineHTML("Mistakes", user.letters_wrong);
		html += this._getScoreLineHTML("% Complete", user.percent_complete_str);
         
		$('#score').innerHTML = html;
	},
   
  showScores:function(scores)
  {    
    var html = "";
    for (var i = 0; i < scores.length; i++) {
      var s = scores[i];
      html += this._getScoreLineHTML(s.name, s.score, s.html_color);
    }
    
    $('#scores').innerHTML = html;
  },
	
	_getScoreLineHTML:function(title, value, color)
	{
    var attribs = "";
    if (color) {
      attribs = "background-color: " + color;
    } 
		return "<div class='item_left' style='" + attribs + "'>" + title + ":</div><div class='item_right'>" + value + "</div><div class='clear'></div>";
	},
	
	_hashClue:function(clue)
	{       
    var x = clue.point.x;
    var y = clue.point.y;
    
		for (var i = 0; i < clue.length; i++)
		{
			var key = this._getClueKey(x, y, clue.direction);
		  
      x += clue.direction.xAdd(i);
      y += clue.direction.yAdd(i);
			this.clues[key] = clue;
		}		
		
		this.clueList.push(clue)
	},
	
	_getClueKey:function(x, y, dir)
	{
		var key = x + "x" + y + dir.letter;
		
		return key;
	},
	
	_getKeyForClue:function(clue)
	{
		return this._getClueKey(clue.point.x, clue.point.y, clue.direction);
	},
	
	isUnknown:function(p)
	{
		if (!this.isValidPosition(p))
		{
			return false;
		}

		//TODO: this is duplicated
		if (p.x < this.minX) return true;
		if (p.x >= this.maxX) return true;
		if (p.y < this.minY) return true;
		if (p.y >= this.maxY) return true;

		if (!this.data)
		{
			return true;
		}
		
		return false;
	},
	
	isSolid:function(p)
	{
		if (!this.isValidPosition(p))
		{
			return true;
		}
		
		if (!this.data)
		{
			return false;
		}
		
		return this.getLetter(p) == '*';
	},
	
	getWidth:function()
	{
		return this.width;		
	},
	
	getHeight:function()
	{
		return this.height;
	},

	getLetter:function(p)
	{
		if ((this.isUnknown(p)) || (!this.data))
		{
			return "?";
		}
		
		var o = this.data[p.x - this.minX][p.y - this.minY];     
    var letter = o;
		
		if ((letter == ' ') || (letter == '?'))
		{
			return "&nbsp;";
		}
		
		return letter;
	},
   
  getSolver:function(p)
  {
    if ((this.isUnknown(p)) || (!this.data))
		{
			return null;
		}
		
		var o = this.data[p.x - this.minX][p.y - this.minY];     
    
    return o.user_id;
  },
	
	isSquareFilled:function(p)
	{
		var let = this.getLetter(p);
		
		if (let == "&nbsp;")
		{
			return false;
		}
		
		return true;
	},
	
	isSquareFilledWithLetter:function(x,y)
	{
		var p = new Point(x,y);
		if (!this.isValidPosition(p))
		{
			return false;
		}
		var let = this.getLetter(p);
		
		if ((let == "&nbsp;") || (let == '*'))
		{
			return false;
		}
		
		return true;
	},
	
	isEnabled:function(p)
	{
		return true; //TODO: check rule
		
		if (this.isEnabledWithDirection(p, false))
		{
			return true;
		}
		
		return this.isEnabledWithDirection(p, true);
	},
	
	isEnabledWithDirection:function(p, dir)
	{
		return true; //TODO: check rule
		
		var clue = this.getClue(p, dir);
		if (clue.number == 1)
		{
			return true;
		}
		var word = this.getClueSolution(clue, true);
		if (!this._isAllSpaces(word))
		{
			return true;
		}
		
		return false;
	},
	
	//TODO: move somewhere better
	_isAllSpaces:function(str)
	{
		for (var i = 0; i < str.length; i++)
		{
			if (str[i] != ' ')
			{
				return false;
			}
		}
		
		return true;
	},
	
	getClue:function(p, dir)
	{
		if (!this.clues)
		{
			return null;
		}
		
		return this.clues[this._getClueKey(p.x, p.y, dir)];
	},
     
    isClueComplete:function(clue)
    {
        var x = clue.point.x;
        var y = clue.point.y;
        
        for (var i = 0; i < clue.length; i++) {
          if (!this.isSquareFilled(new Point(x,y))) {
            return false;
          }
          x += clue.direction.xAdd(i);
          y += clue.direction.yAdd(i);
        }
        
        return true;
    },
	
	getClueStartNumber:function(p)
	{
    for (var i = 0; i < DIRECTIONS.length; i++) {
      var dir = DIRECTIONS[i];
      
      var clue = this.getClue(p, dir);
      if ((clue) && (clue.point.equals(p))) {
        return clue.number;
      }
    }
		
		return -1;
	},
	
	isClueStart:function(p)
	{
		return (this.getClueStartNumber(p) != -1)
	},
	
	isWithinClue:function(clue, p)
	{
		if (!clue)
		{
			return false;
		}
	
    var x = clue.point.x;
    var y = clue.point.y;
    
    for (var i = 0; i < clue.length; i++) {
      if ((p.x == x) && (p.y == y)) {
        return true;
      }
      x += clue.direction.xAdd(i);
      y += clue.direction.yAdd(i);
    }
    
    return false;
	},
	
	isWithinThemeClue:function(p)
	{
     for (var i = 0; i < DIRECTIONS.length; i++) { //todo: only directions puzzle uses
        var dir = DIRECTIONS[i];
        var clue = this.getClue(p, dir);
		    if ((clue) && (clue.theme))
		    {
			    return true;
        }
     }
     
     return false;
	},
	
	isValidPosition:function(p)
	{		
		if ((p.x < 0) || (p.x >= this.getWidth()))
		{
			return false;
		}
		
		if ((p.y < 0) || (p.y >= this.getHeight()))
		{
			return false;
		}
		
		return true;
	},
	
	getClueHTML:function(clue)
	{
		var clueLinks = "";
		
		if (this.isSample)
		{		
			//no opening			
		}
		else if (!this.isClueLinksOpen)
		{
			clueLinks += "<span class='clue_action'><a href=\"javascript:puzzle.openClueLinks();\">more</a></span>";
		}
		else
		{
			clueLinks += "<span class='clue_action'><a href=\"javascript:puzzle.closeClueLinks();\">less</a></span>";
		}
		
    var text = '';
    if (!clue.media) {
      text = clue.clue;
		} else if (clue.media.match("thoughtequity://")) {
			var video_id = clue.media.slice(16);
			if ((this.lastShownClue) && (clue != this.lastShownClue)) {
			    dialogs.showVideoClue(video_id, clue.text);
			}
			text = clue.text + " <a href='javascript:dialogs.showVideoClue(" + video_id.inspect(true) + "," + clue.text.inspect(true) + ")'>Play video again</a>";
		}
    else if (clue.media.match("flickr.com")) {      
			if ((this.lastShownClue) && (clue != this.lastShownClue)) {
			    dialogs.showPhotoClue(clue.media, clue.text, clue.attribution);
			}
			text = clue.text + " <a href='javascript:puzzle.showPhotoClue(" + this._getKeyForClue(clue).inspect(true) + ")'>Show photo</a>";
    } else {
      text = clue.text;
    }
		this.lastShownClue = clue;
		
    var clueComplete = this.isClueComplete(clue);
		var html = "<span id='clue_display'><span id='clue_number'>";
    if (clueComplete) { html += "<s>"; }
    html += clue.number + " " + this.getClueDir(clue) + ":";
    if (clueComplete) { html += "</s>"; }
    html += "</span> " + text + clueLinks + "</span>";
		
		html += "<div style='clear: both;'></div>";
		
		if (this.isClueLinksOpen)
		{
			html += this.getClueLinksHTML(clue);
		}
		
		return html;
	},
   
  showPhotoClue:function(hash)
  {
    var clue = this.clues[hash];    
    dialogs.showPhotoClue(clue.media, clue.text, clue.attribution);
  },
  
	getClueLinksHTML:function(clue)
	{
	    var html = "";
	    
      if (isAdmin)
		  {
			  html += this.getClueLinkHTML('puzzle.editClue','edit', clue);
			  html += ", " + this.getClueLinkHTML('puzzle.replaceClue','replace', clue);
        html += ", " + this.getClueLinkHTML('puzzle.deleteClue', 'delete', clue);
		  }
       
	    html += "<div id='clue_links'>";
	    if (clue.solver)
		{
			html += "<div>Explanation: ";
			if (clue.explanation)
			{
				html += this._getExplanationHTML(clue) + " " + this.getClueLinkHTML('puzzle.addExplanation','edit', clue);
			}
			else
			{
				html += this._getExplanationHTML(clue) + " " + this.getClueLinkHTML('puzzle.addExplanation','add', clue);
			}
			html += "</div>";
		    html += "<div>Clue solved by <a href=\"Person.action?userID=" + clue.solver.id + "\">" + clue.solver.name + "</a></div>";

		    var word = this.getClueSolution(clue);
			
			html += "<div>";
			html += this.getClueLinkHTML('puzzle.flagClue', 'This clue is crap', clue);
			if (isAdmin)
			{
				html += " (" + this.getClueLinkHTML('puzzle.markToNotUse','mark to never use again', clue) + ")";
			}
			html += "</div>";
		}
	    else
		{
		    //html += "<div>" + this.getClueLinkHTML('data.askFriendAnswer','Get help from a friend', clue) + "</div>";
		    //html += "<div id='request_community_help'>" + this.getClueLinkHTML('data.askCommunityHelp','Get help from community', clue) + "</div>";
		    html += "<div id='buy_answer'>";
		    if (this.score >= 50)
		    {
		    	html += this.getClueLinkHTML('puzzle.buyAnswer','Buy answer (-50 points)', clue);
		    }
		    else
		    {
		    	html += "<span class='disabled'>Buy answer (-50 point)</span>";
		    }
		    html +=  "</div>";
		}

		if (clue.difficulty)
		{
			html += "<div>Difficulty: " + clue.difficulty;
			if (isAdmin)
			{
				html += " (" + this.getClueLinkHTML('dialogs.fixDifficulty','Fix', clue) + ")";
				
				html += "  Category: " + (clue.category ? clue.category : 'Not set');
				html += this.getClueLinkHTML('puzzle.showClueCatagorizerDialog','Set', clue);
			}  
			html += "</div>";
		}

	    if (clue.author)
		{
		    html += "<div>Written by <a href=\"Person.action?userID=" + clue.author.id + "\">" + clue.author.name + "</a></div>";
		}

	    html += "</div>";
	    return html;
	},
	
	_getExplanationHTML:function(clue)
	{
		ex = clue.explanation;
		if ((!ex) || (ex.length == 0))
		{
			return "<a href='http://en.wikipedia.org/wiki/" + this.getClueSolution(clue) + "' target='_blank'>wikipedia?</a>";
		}
		
		http = ex.indexOf("http://");
		if (http > -1)
		{
			prefix = ex.substr(0, http);
			link = ex.substr(ex);
			end = "";
			sp = ex.indexOf(" ", http);
			if (sp > -1)
			{
				link = ex.substr(http, sp - http);
				end = ex.substr(sp);
			}
			return prefix + "<a href='" + link + "' target='_blank'>link</a>" + end;
		}
		
		return ex;
	},
	
	getClueLinkHTML:function(func, text, clue)
	{
		return "<a href=\"javascript:" + func + "(" + clue.point.x + "," + clue.point.y + ",'" + this.getClueDir(clue) + "')\">" + text + "</a>";
	},
	
	getClueDir:function(clue)
	{
    return clue.direction.display;
	},
	
	openClueLinks:function()
	{
		this.isClueLinksOpen = true;
		board.reDrawClue();
	},
	
	closeClueLinks:function()
	{
		this.isClueLinksOpen = false;
		board.reDrawClue();
	},
	
	setLetter:function(p, letter, user_id)
	{         
		this.data[p.x - this.minX][p.y - this.minY] = letter;
	},
	
	setLetterIfVisible:function(x, y, letter, user_id)
	{
		if (x < this.minX) return;
		if (x >= this.maxX) return;
		if (y < this.minY) return;
		if (y >= this.maxY) return;
		
		this.setLetter(new Point(x, y), letter, user_id);
	},
	
	updateClueSolver:function(clue, solver)
	{
		var puzClue = this.getClue(new Point(clue.x, clue.y), clue.direction);
		
		if (puzClue)
		{
			puzClue.solver = solver;
		}
	},
	
	updateClueSolution:function(clue, word)
	{
		if (clue.down)
		{
			for (var i = 0; i < clue.length; i++)
			{
				if (word[i])
				{
					this.setLetterIfVisible(clue.x, clue.y + i, word[i]);
				}
			}
		}
		else
		{
			for (var i = 0; i < clue.length; i++)
			{
				if (word[i])
				{
					this.setLetterIfVisible(clue.x + i, clue.y, word[i]);
				}
			}
		}
	},
	
	flagClue:function(clue, word, x, y, dir)
	{    
		clue = this.getClue(new Point(x, y), directionFromLetter(dir));
		word = this.getClueSolution(clue);
			
		var reason=prompt('Why do you think the clue ' + clue + ' is bullshit?','');
		if (reason)
		{
			API.flagClue(challengeID, x, y, dir, reason, this.onClueFlagged);
			dialogs.showDialogWithWord(word);
		}
	},
	
	markToNotUse:function(x, y, dir)
	{
		API.markClueBad(challengeID, x, y, dir, this.onClueFlagged);
	},

	onClueFlagged:function()
	{
		//TODO: show thank you?
	},
	
	buyAnswer:function(x, y, dir)
	{
		document.getElementById('buy_answer').innerHTML = "Buying...";
		
		API.buySolution(challengeID, x, y, dir, this.onSolutionBought);
		
		//urchinTracker('/endlesscrossword/ajax/buyAnswer');
	},
	
	onSolutionBought:function(user)
	{
		puzzle.showScore(user);		
	},
	
	askCommunityHelp:function(x, y, dir)
	{
		document.getElementById('request_community_help').innerHTML = "Sending...";
		
		API.requestCommunityHelp(challengeID, x, y, dir, this.onRequestedHelp);
		
		//urchinTracker('/endlesscrossword/ajax/requestCommunityHelp');
	},
	
	onRequestedHelp:function()
	{
		document.getElementById('request_community_help').innerHTML = "Help requested. You will be notified when someone helps out.";		
	},
	
	askFriendAnswer:function(x, y, dir)
	{
		API.getFullFriendList(this.onGotFriendList);						
	},
	
	onGotFriendList:function(friends)
	{
		var html = "What smart friend can help you?";
		
		html += "<select>";
		for (var i = 0; i < friends.length; i++)
		{
			var friend = friends[i];
			html += "<option value='" + friend.facebookID + "'>" + friend.name + "</option>";
		}
		html += "</select>";
		
		document.getElementById('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},
				
	_getLetterOrGuess:function(p, skipGuesses)
	{
		var o = this.data[p.x - this.minX][p.y - this.minY];
    var letter = o.letter;
		
		if ((letter == ' ') || (letter == '?'))
		{
			if (!skipGuesses)
			{
				var guess = guesses.getGuess(p);
				if (guess)
				{
					return guess.letter;
				}
			}
			return " ";
		}
		
		return letter;		
	},
	
	getClueSolution:function(clue, skipGuesses)
	{
		var word = "";
		var x = clue.x ? clue.x : clue.point.x;
		var y = clue.y ? clue.y : clue.point.y;
		
		if (clue.down)
		{
			for (var i = 0; i < clue.length; i++)
			{
				word += this._getLetterOrGuess(new Point(x, y + i), skipGuesses);
			}
		}
		else
		{
			for (var i = 0; i < clue.length; i++)
			{
				word += this._getLetterOrGuess(new Point(x + i, y), skipGuesses);
			}
		}
		
		return word;
	},
	
	haveFullClueSolution:function(clue)
	{
		var solution = this.getClueSolution(clue);
		
		return solution.indexOf(' ') == -1;
	},
	
	sendHelp:function()
	{
		var word = this.getClueSolution(this.getClue(new Point(0,0), false));
		
		if (word.indexOf(' ') != -1)
		{
			alert("Please fill in the word first.");
			return;
		}
		
		document.getElementById('submitWord').value = word;
		document.getElementById('submitForm').submit();
	},
		
  editClue:function(x, y, dir)
  {
    var clue = this.getClue(new Point(x,y), directionFromWord(dir));
    var params = "puz_id=" + puzzleID + "&x=" + x + "&y=" + y + "&dir=" + dir;
     
    dialogs.showAddClueDialog('Save', this.getClueSolution(clue), clue.text, clue.media, clue.attribution, params);
  },
   
	deleteClue:function(x, y, dir)
	{
		var clue = this.getClue(new Point(x,y), directionFromWord(dir));
		
		var r = confirm('Never use this clue again?');
		if (r == true)
		{
        var params = "puz_id=" + puzzleID + "&x=" + x + "&y=" + y + "&dir=" + dir;
        new Ajax.Updater('puzzle_data', '/admin/delete_clue?' + params, {asynchronous:true, evalScripts:true});
		}
	},
   
  replaceClue:function(x, y, dir)
  {
    var clue = this.getClue(new Point(x,y), directionFromWord(dir));
    var params = "puz_id=" + puzzleID + "&x=" + x + "&y=" + y + "&dir=" + dir + "&replace=t";
     
    dialogs.showAddClueDialog('Replace', this.getClueSolution(clue), '', '', '', params);
    
    new Ajax.Updater('other_clues', '/admin/other_clues/' + this.getClueSolution(clue), {asynchronous:true, evalScripts:true});
  },
   
//  replaceClue:function(x, y, dir)
//  {
//    var clue = this.getClue(new Point(x,y), directionFromWord(dir));
//		
//		var newText = prompt('Enter text for new clue', clue.text);
//		if (newText)
//		{
//        var params = "puz_id=" + puzzleID + "&x=" + x + "&y=" + y + "&dir=" + dir + "&text=" + newText;
//        new Ajax.Updater('puzzle_data', '/admin/replace_clue_text?' + params, {asynchronous:true, evalScripts:true});
//			  clue.text = newText;
//		}
//  },
	
	addExplanation:function(x,y,dir)
	{
		var clue = this.getClue(new Point(x,y), dir == "down");				
		var curExplanation = clue.explanation ? clue.explanation : "";
		
		html = "<div style='padding: 0px 10px 10px'><h4>Add an explanation</h4>";		
		html += "<p>This could be a be sentance or a link to wikipedia.</p>";
		html += "<div>" + clue.text + ": " + this.getClueSolution(clue) + "</div>";
		html += "<div><textarea rows=2 style='width: 320px' id='explanation'>" + curExplanation + "</textarea>";
		html += "<br><input type='button' class='inputsubmit' value='Add Explanation' onClick=\"puzzle.updateExplanation(" + x + "," + y + ",'" + dir + "')\">";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'></div>";		

		document.getElementById('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},
	
	updateExplanation:function(x,y,dir)
	{
		var explanation = document.getElementById('explanation').value;
	
		API.updateExplanation(challengeID, x, y, dir, explanation, this.onUpdatedExplanation);
		clue = this.getClue(new Point(x, y), dir != "across");
		clue.explanation = explanation;
		board.reDrawClue();
		
		//urchinTracker('/endlesscrossword/ajax/addExplanation');
	},
	
	onUpdatedExplanation:function()
	{
		dialogs.hideDialog();
	},

	getUncategorizedClue:function()
	{
		var len = this.clueList.length;
		var offset = Math.floor(Math.random()*len);
		for (var i = 0; i < this.clueList.length; i++)
		{
			var clue = this.clueList[(i + offset) % len];
			if ((clue.category == null) && (this.haveFullClueSolution(clue)))
			{
				return clue;
			}
		}
		
		return null;
	},

	showClueTagger:function()
	{
		var clue = this.getUncategorizedClue();
		if (clue == null)
		{
			return;
		}
		
		this.showClueCatagorizerDialog(clue.point.x, clue.point.y, this.getClueDir(clue));
	},
	
	showClueCatagorizerDialog:function(x, y, dir)
	{
		var clue = this.getClue(new Point(x,y), dir == "down");				
		var word = this.getClueSolution(clue);
		
		html = "<div style='padding: 0px 10px 10px'><h4>Categorize a Clue</h4>";		
		html += "<p>Can you put this clue in a category? ";
		html += "<a onClick=\"document.getElementById('why').style.display = 'block'\">Why?</a>";
		html += "<span id='why' style='display:none'>We are attempting to categorize clues so that more customized puzzles can be made (puzzle with no french word clues, puzzle that has a lot of geography clues, etc.)</span>";
		html += "</p>";
		html += "<div style='padding-left: 30px'><div style='padding: 15px 0px; font-size: 14px;'>" + clue.text + ": " + word + "</div>";
		html += "<div style='float: left'><div>";
		html += "<select id='category'>";
		for (var i = 0; i < CLUE_CATEGORIES.length; i++)
		{
			var cat = CLUE_CATEGORIES[i];
			html += "<option value='" + cat + "'>" + cat + "</option>";
		}
		html += "</select></div>";
		html += "<div style='padding: 5px 0px;'><input type='button' class='inputsubmit' value='Categorize Clue' onClick=\"puzzle.setCategory(" + clue.point.x + "," + clue.point.y + ",'" + this.getClueDir(clue) + "')\"></div></div>";
		html += "<div style='float: right'>";
		html += "<INPUT TYPE=CHECKBOX name='nomore' id='nomore'>Don't ask again<br>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='guesses.hideClueTagger();'></div></div>";		

		$('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},
	
	setCategory:function(x,y,dir)
	{
		var clue = this.getClue(new Point(x,y), dir == "down");				
		var category = document.getElementById('category').value;
	
		API.setCategory(challengeID, x, y, dir, category, this.onUpdatedCategory);
		clue.category = category;
		guesses.hideClueTagger();
	},
	
	onUpdatedCategory:function()
	{
		//nothing to do
	}
	
}