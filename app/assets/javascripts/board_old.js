Board = function(el, puzzle, isPrint)
{ 
	this.SQUARE_SIZE = 30;

  this.element = el;
	this.data = puzzle;
	this.xOffset = 0;
	this.yOffset = 0;
	this.positionX = 0;
	this.positionY = 0;
	this.absSelectedSpot = new Point(0, 0);
	this.currentDirection = ACROSS;
  this.currentClue = null;
	this.allowDirSwitching = true;
  this.isPrint = isPrint;
  $('#inputBox').keydown(function(event) {
    return keyHandler.handleKeyDown(event);
  });
     
  el.onselectstart = function () { return false; }
	
  el.width($(window).width());
  el.height($(window).height());
  
  $(window).resize(function() {
    
  });
  
  $('.zoom').click(function() {
    console.log($(this));
    if ($(this).hasClass('zoom_in')) {
      board.setSquareSize(board.SQUARE_SIZE*2);
      board.reDraw();
    }
    if ($(this).hasClass('zoom_out')) {
      board.setSquareSize(board.SQUARE_SIZE/2);
      board.reDraw();
    }
  });
  this.setSquareSize(30);
	     
	this.dragMgr = new DragHandler(el.attr('id'), mkDelegate(this, this.handleDrag));

	this._reorientTimer = mkDelegate(this, this.reorientBoardTimer);
	setTimeout(this._reorientTimer, 100);
}

Board.prototype = 
{
  setSquareSize: function(size)
  {
    this.SQUARE_SIZE = size;
    
    this.width = this.element.width() / this.SQUARE_SIZE | 0;
    this.height = this.element.height() / this.SQUARE_SIZE | 0;
  },

  getHTML:function()
	{
		this.data.grabData(this.xOffset, this.yOffset, this.xOffset + this.width, this.yOffset + this.height);
		
		//TODO: has dupe below
		var extras = this._calculateExtras();

		var pixelWidth = (this.width + 2) * this.SQUARE_SIZE;
		var pixelHeight = (this.height + 2) * this.SQUARE_SIZE;
		
		var html = "<div id='grid_table' style='position: relative; left: " + extras.x + "px; top: " + extras.y + "px; width: " + pixelWidth + "px; height: " + pixelHeight + "px;'>"; 
		html += "<table cellpadding=0 cellspacing=0>";
	
  
		this.currentClue = this.data.getClue(this.absSelectedSpot, this.currentDirection);
		for (var i = this.yOffset - 1; i < this.yOffset + this.height + 2; i++)
		{
			html += "<tr>";
			
			for (var j = this.xOffset - 1; j < this.xOffset + this.width + 1; j++)
			{
				var absSquare = new Point(j, i);
				
				if (this.data.isUnknown(absSquare))
				{
					html += this._getUnknownSquareHTML(absSquare);
				}
				else if (this.data.isSolid(absSquare))
				{
					html += this._getBlockSquareHTML(absSquare);
				}
				else
				{				
					html += this._getSquareHTML(this.currentClue, absSquare);
				}
			}
			
			html += "</tr>";
		}
		
		html += "</table></div>";
		
		return html;
	},
  
  _sizeStyle: function()
  {
     return "style='width:"+(this.SQUARE_SIZE+1)+"px;height:"+(this.SQUARE_SIZE+1)+"px;'";
  },
	
	_getUnknownSquareHTML:function(absSquare)
	{
		var html = "<td class='square' class='" + this._getSquareClass(null, absSquare) + "'"+this._sizeStyle()+">";
		html += "<div class='letter'>?</div>";
		html += "</td>";
		
		return html;
	},
	
	_getSquareHTML:function(currentClue, absSquare)
	{		 
		var html = "<td id='" + this._getID(absSquare) + "' class='" + this._getSquareClass(currentClue, absSquare) + "' "+this._sizeStyle();        
        html += ">";

    if ((this.currentClue) && (this.currentClue.direction.letter == 'Z') && (this.data.isWithinClue(this.currentClue, absSquare)))
    {
      var offset = this.currentClue.direction.pointToOffset(absSquare);
      var turn = this.currentClue.direction.turns[offset];
      if (turn) {
        html += '<div class="arrow '+turn.toLowerCase()+'"><img src="/assets/bullet-green-arrow.png"/></div>';
      }
    }
    
				
		html += this._getSquareLetterHTML(absSquare);				
		
		html += "</td>";		
		
		return html;
	},
	
	_getSquareLetterHTML:function(absSquare)
	{					
		var guess = this.isPrint ? null : guesses.getGuess(absSquare);
		var clas = "letter";
		var letter = "?";
		var extra = "";
		if (!guess)
		{
			letter = this.data.getLetter(absSquare); 
		}
		else
		{
			letter = guess.letter;
			if (!guess.correct)
			{
				extra = "<div class='wrongx'><img src='/images/wrong.gif'></div>";
				clas += " wrong";
			}
			else
			{
				letter = guess.letter;
				clas += " guess";
			} 
		}
     
    var user_color = "";
    var user_id = 0; //this.data.getSolver(absSquare);
    if ((user_id) && (typeof(scores) != "undefined")) {
      user_color = "background-color: " + this.userColor(user_id);
    }
		var fontSize = this.SQUARE_SIZE-12;
    
		return "<div style='overflow: hidden;" + user_color + "'><div class='" + clas + "' style='font-size:"+fontSize+"px'>" + letter + "</div>" + extra + "</div>";
	},
   
  userColor:function(user_id)
  {
    for (var i = 0; i < scores.length; i++) {
      var s = scores[i];
      if (s.user_id == user_id) {
        return s.html_color;
      }
    }
    return "#fff";
  },
	
	_getSquareClass:function(currentClue, absP)
	{
		var guessClass = "";
		if ((!this.isPrint) && (guesses.getGuess(absP)))
		{
			guessClass = " guess";
		}
    
    if (!this.data.isVisible(absP))
		{
			return "square disabled";
		}
		
        if (!this.isPrint)
        {
            if (absP.equals(this.absSelectedSpot))
            {
                return "square selected" + guessClass;
            }
		
            if ((currentClue) && (this.data.isWithinClue(currentClue, absP)))
            {
                return "square currentClue" + guessClass;
            }
        }    						
		
		return "square" + guessClass;
	},
	
	_getBlockSquareHTML:function(p)
	{
    var classes = 'square solid';
    if (this.data.isValidPosition(p) && (!this.data.isVisible(p))) {
      classes += " disabled";
    }
		return "<td class='"+classes+"' "+this._sizeStyle()+">&nbsp;</td>";
	},
	
	_getID:function(absP)
	{
		return absP.x + "x" + absP.y;
	},
	
	handleClick:function(el, event)
	{
		var idparts = el.attr('id').split('x');
		    
		var point = new Point(parseInt(idparts[0]), parseInt(idparts[1])); 
		board.handleSquareClicked(point);
	},

	_swapCurrentDirection:function()
	{
    var newDir = this.currentDirection;    
    do {
      var newDir = this._oppositeDirection(newDir);      
      if (newDir == this.currentDirection) {        
        return;
      }
    } while (!this.canPlaceCursor(this.absSelectedSpot, newDir));
                      
    this.currentDirection = newDir;		
	},
	
  _oppositeDirection:function(dir)
  {
    //TODO: needs to handle more directions
    return dir.nextDirection(DEFAULT_DIRECTION_LETTERS);
  },
   
	handleSquareClicked:function(absP)
	{
		if (this.absSelectedSpot.equals(absP))
		{			
			this._swapCurrentDirection();
		}
		    
		if (!this.canPlaceCursor(absP))
		{
			var opp = this._oppositeDirection(this.currentDirection);
			if (!this.canPlaceCursor(absP, opp))
			{
				return;			
			}
			this.currentDirection = opp;
		}
		
		this.absSelectedSpot = absP;
		
		this.forceSelectedCluesVisible();

		this.reDraw();
	},
	
	getClueHTML:function()
	{
		var currentClue = this.data.getClue(this.absSelectedSpot, this.currentDirection);
		if (!currentClue)
		{
			return "";
		}

    this.data.scrollToClue(currentClue); //TODO: somewhere else?
		
    if (!this.data.isEntireClueVisible(currentClue)) {
      return "Can't see yet";
    }
    
		return this.data.getClueHTML(currentClue);
	},

	reDrawClue:function()
	{
		$('#clue').html(this.getClueHTML());
	},
		
	reDraw:function(recalcVisible)
	{
    var that = this;
    if (recalcVisible) {
      this.data.recalculateVisible(this.absSelectedSpot);
    }
    
		var el = $('#grid');
		if (el)
		{  		
      el.html(this.getHTML());
      el.find('td').click(function(event) {
        that.handleClick($(this), event);
      });
		}
  	    
    this.reDrawClue();
  	this.setFocus();
	},
	
	setFocus:function()
	{
		//TODO: move inputbox to middle of puzzle???
		
  	  var el = $('#inputBox');     
  		if (el)
  		{
  			el.focus();
  		}
  		setTimeout("var el = $('#inputBox'); if (el) { el.focus(); }",1);				
	},
	
	handleDrag:function(x1, y1, x2, y2)
	{
	    if(this.width >= this.data.width
	        && this.height >= this.data.height)
	    {
	        // no scrolling if the puzzle is too small
	        return;
	    }
	    
		var moveX = (x1 - x2);
		var moveY = (y1 - y2);
		this.positionX += moveX;
		this.positionY += moveY;
		 
		var gridMoveX = Math.round(this.positionX/this.SQUARE_SIZE) - this.xOffset;
		var gridMoveY = Math.round(this.positionY/this.SQUARE_SIZE) - this.yOffset;

		var extras = this._calculateExtras();		
		
		if ((gridMoveX == 0) && (gridMoveY == 0))
		{			
			document.getElementById('grid_table').style.left = extras.x + "px";
			document.getElementById('grid_table').style.top = extras.y + "px";
			return;
		}				
		
		this.xOffset += gridMoveX;
		this.yOffset += gridMoveY;		
				
//		if (this.xOffset < 0)
//		{
//			this.xOffset = 0;
//		}
//		if (this.xOffset > this.data.getWidth() - this.width)
//		{
//			this.xOffset = this.data.getWidth() - this.width;
//		}
//		
//		if (this.yOffset < 0)
//		{
//			this.yOffset = 0;
//		}
//		if (this.yOffset > this.data.getHeight() - this.height)
//		{
//			this.yOffset = this.data.getHeight() - this.height;
//		}
		
		board.reDraw();
	},
	
	_calculateExtras:function()
	{
		var extraX = this.xOffset * this.SQUARE_SIZE - this.positionX - this.SQUARE_SIZE;
		var extraY = this.yOffset * this.SQUARE_SIZE - this.positionY - this.SQUARE_SIZE;
		
		return new Point(extraX, extraY);
	},
	
	handleLetterTyped:function(letter)
	{
		if ((!this.data.isSquareFilled(this.absSelectedSpot)) && (guesses.can_add()))
		{
			guesses.add(this.absSelectedSpot, letter);
		}		
		     
    this.advancePosition(this.currentClue.direction.xAdd(this.absSelectedSpot), this.currentClue.direction.yAdd(this.absSelectedSpot), false);
		
		board.reDraw();				
	},
	
	handleBackspace:function()
	{
		guesses.removeAt(this.absSelectedSpot);
		
    this.advancePosition(-1 * this.currentClue.direction.xAdd(this.absSelectedSpot), -1 * this.currentClue.direction.yAdd(this.absSelectedSpot), false);
     
		this.reDraw();		
	},
	
	handleDelete:function()
	{
		guesses.removeAt(this.absSelectedSpot);
		
		this.reDraw();
	},
	
	handleSpace:function()
	{
		guesses.removeAt(this.absSelectedSpot);
		    
    this.advancePosition(this.currentClue.direction.xAdd(this.absSelectedSpot), this.currentClue.direction.yAdd(this.absSelectedSpot), false);
		
		this.reDraw();
	},
	
	handleArrowPressed:function(direction)
	{
		if (direction == "left")
		{
			this.advancePosition(-1, 0, true);
		}
		else if (direction == "up")
		{
			this.advancePosition(0, -1, true);
		}			
		else if (direction == "right")
		{
			this.advancePosition(1, 0, true);
		}
		else if (direction == "down")
		{
			this.advancePosition(0, 1, true);
		}
		
		this.reDraw();
	},
	
	handleTab:function()
	{
		this._swapCurrentDirection();
		this.reDraw();
	},
	
	handleEnter:function()
	{
		var currentClue = this.data.getClue(this.absSelectedSpot, this.currentDirection);
		if (currentClue.video)
		{
			alert('show video');
		}
		else
		{
			guesses.submitGuesses(true);
		}
	},
	
	advancePosition:function(xAdd, yAdd, skipBlocks)
	{
		var newAbsPosition = new Point(this.absSelectedSpot.x + xAdd, this.absSelectedSpot.y + yAdd);
		if (!this.data.isValidPosition(newAbsPosition))
		{
			return;
		}
		
		if (this.data.isSolid(newAbsPosition))
		{
			if (!skipBlocks)
			{
				return;
			}
			
			if (xAdd > 0) xAdd++;
			if (xAdd < 0) xAdd--;
			if (yAdd > 0) yAdd++;
			if (yAdd < 0) yAdd--;

			this.advancePosition(xAdd, yAdd, skipBlocks);
						
			return;
		}
	
		if (!this.canPlaceCursor(newAbsPosition))
		{
			return;
		}
		
		this.absSelectedSpot = newAbsPosition;				
		
		if (!this.isVisible(newAbsPosition))
		{
			this._changeOffset(xAdd, yAdd);
		}

		this.forceSelectedCluesVisible();				
	},
	
	canPlaceCursor:function(pos, dir)
	{
		if (!dir)
		{
			dir = this.currentDirection;
		}
         
    var clue = this.data.getClue(pos, dir);
    if (!clue) {
      return false;
    }
    if (!this.data.isVisible(pos)) {
      return false;
    }
    

		return this.data.isEnabledWithDirection(pos, dir);
		
		if ((pos.x == 0) && (pos.y == 0))
		{
			return true;
		}
		
		if ((this.hasLetterOrGuess(pos.x - 1, pos.y)) ||
		    (this.hasLetterOrGuess(pos.x + 1, pos.y)) ||
		    (this.hasLetterOrGuess(pos.x, pos.y - 1)) ||
		    (this.hasLetterOrGuess(pos.x, pos.y + 1)))
		{
			return true;
		}
		
		return false;
	},
	
	hasLetterOrGuess:function(x,y)
	{
		if ((this.data.isSquareFilledWithLetter(x, y)) ||
		    (guesses.hasGuess(new Point(x,y))))
		{
			return true;
		}
		
		return false;
	},
	
	forceSelectedCluesVisible:function()
	{
		this.forceSelectedClueVisible(false);
		this.forceSelectedClueVisible(true);
        this.scrollIntoView(1);
	},
	
	forceSelectedClueVisible:function(direction)
	{
		var clue = this.data.getClue(this.absSelectedSpot, direction);
		if (clue)
		{
			if (!clue.down)
			{
				while (!this.isVisibleX(clue.point))
				{
					if (!this._changeOffset(-1, 0))
					{
						break;
					}
				}
				
				while (!this.isVisibleX(new Point(clue.point.x + clue.length, clue.point.y)))
				{
					if (!this._changeOffset(1, 0))
					{
						break;
					}					
				}
			}
			else
			{
				while (!this.isVisibleY(clue.point))
				{
					if (!this._changeOffset(0, -1))
					{
						break;
					}
				}
				
				while (!this.isVisibleY(new Point(clue.point.x, clue.point.y + clue.length)))
				{
					if (!this._changeOffset(0, 1))
					{
						break;
					}
				}
			}
		}
	},
	
	isVisible:function(absP)
	{
		if (!this.isVisibleX(absP))
		{
			return false;
		}
		
		return this.isVisibleY(absP);
	},
	
	isVisibleX:function(absP)
	{
		if (absP.x < this.xOffset + 1) return false;
		if (absP.x > this.xOffset + this.width - 1) return false;
		
		return true;
	},
	
	isVisibleY:function(absP)
	{
		if (absP.y < this.yOffset + 1) return false;
		if (absP.y > this.yOffset + this.height -1) return false;
		
		return true;
	},
	
	_changeOffset:function(changeX, changeY)
	{
		this.xOffset += changeX;
		this.positionX += (changeX * this.SQUARE_SIZE);

		this.yOffset += changeY;
		this.positionY += (changeY * this.SQUARE_SIZE);

		if ((this.xOffset < 0) || (this.xOffset > this.data.getWidth()))
		{
			return false;
		}
					
		if ((this.yOffset < 0) || (this.yOffset > this.data.getHeight()))
		{
			return false;
		}				
		
		return true;	
	},

	validateSelectedPosition:function()
	{
		var selectedX = this.absSelectedSpot.x;
		var selectedY = this.absSelectedSpot.y;
		while ((selectedX < this.data.getWidth()) && (this.data.isSolid(new Point(selectedX, selectedY))))
		{
			selectedX++;
		}
		
		this.absSelectedSpot = new Point(selectedX, selectedY);
	},

	centerGrid:function()
	{
		var offx = Math.round(this.data.getWidth() / 2 - this.width/2);
	    var offy = Math.round(this.data.getHeight() / 2 - this.height/2);

	    this.setGridOffset(offx, offy);
	},
	
	setGridOffset:function(x, y)
	{
		this.xOffset = x;
		this.yOffset = y;
		this.positionX = x * this.SQUARE_SIZE - 15;
		this.positionY = y * this.SQUARE_SIZE - 15;
        this.scrollIntoView(1);
		
		var selectedX = x + Math.round(this.width/2);
		var selectedY = y + Math.round(this.height/2);
		while ((selectedX < this.data.getWidth()) && (this.data.isSolid(new Point(selectedX, selectedY))))
		{
			selectedX++;
		}
		
		this.absSelectedSpot = new Point(selectedX, selectedY);		        
	},
	
	//TODO: combine with above
	jumpTo:function(x, y, direction, dontscroll)
	{
		var selectedX = x;
		var selectedY = y;
		
		this.absSelectedSpot = new Point(selectedX, selectedY);		

		if (direction)
		{
			this.currentDirection = direction;
		}
	
		if (!dontscroll)
		{	
			this.xOffset = x - Math.round(this.width/2);
			this.yOffset = y - Math.round(this.height/2);
			this.positionX = this.xOffset * this.SQUARE_SIZE;
			this.positionY = this.yOffset * this.SQUARE_SIZE;                        
      this.scrollIntoView(1.0, true);
		}
        		
		this.reDraw();
	},
	
	disallowSwitchDirections:function()
	{
		this.allowDirSwitching = false;
	},
     
    scrollIntoView:function(factor, skipRedraw)
    {
      var boardWidth = this.element.width();
      var boardHeight = this.element.height();
      var puzzleWidth = this.data.getWidth() * this.SQUARE_SIZE;
      var puzzleHeight = this.data.getHeight() * this.SQUARE_SIZE;
      
      var paddingX = (boardWidth - puzzleWidth)/2;      
      if (paddingX < 10) { paddingX = 15; }
      
      var paddingY = (boardHeight - puzzleHeight)/2;      
      if (paddingY < 10) { paddingY = 15; }
       
      var changed = false;

      if (this.positionX < -1 * paddingX - 1)
      {
        this.positionX -= (this.positionX + paddingX)/factor;
        changed = true;
      }
            
      if (this.positionX + boardWidth > puzzleWidth + paddingX + 1)
      {
        this.positionX -= (this.positionX + boardWidth - (puzzleWidth + paddingX))/factor;
        changed = true;
      }
      
      if (this.positionY < -1 * paddingY - 1)
      {
        this.positionY -= (this.positionY + paddingY)/factor;        
        changed = true;
      }
      
      if (this.positionY + boardHeight > puzzleHeight + paddingY + 1)
      {
        this.positionY -= (this.positionY + boardHeight - (puzzleHeight + paddingY))/factor;
        changed = true;
      }

      if (changed) {
        this.xOffset = this.positionX / this.SQUARE_SIZE | 0;
        this.yOffset = this.positionY / this.SQUARE_SIZE | 0;
        if (!skipRedraw) {
          this.reDraw();
        }
      }
      
      return changed;
    },
     
    reorientBoardTimer:function()
	{
	    var timer = 150; // check every 150-ish ms
	    
	    if(!this.dragMgr.isDragging)
	    {
	        if(this.scrollIntoView(2, false))
	            timer = 30; // faster update while scrolling
	    }
	    
	    setTimeout(this._reorientTimer, timer);
	}

		
}

//TODO: just make data a global