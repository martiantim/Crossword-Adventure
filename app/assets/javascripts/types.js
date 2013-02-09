Point = function(x,y)
{
	this.x = x;
	this.y = y;	
}

Point.prototype = 
{
	equals:function(point)
	{		
		if ((this.x == point.x) && (this.y == point.y))
		{
			return true;
		}
		
		return false;
	},
  
  dup: function()
  {
    return new Point(this.x, this.y);
  }
}

Direction = function(letter, display, plural, xAdd, yAdd, turns, start)
{
  this.letter = letter;
  this.display = display;
  this.plural = plural;
  this.xxAdd = xAdd;
  this.yyAdd = yAdd;
  this.turns = turns;
  this.start = start;
}

Direction.prototype = 
{
  nextDirection:function(directions)
  {
    for (var i = 0; i < directions.length; i++)
    {
      var dir = directions[i];
      if (dir == this.letter) {
        var nextLetter = directions[(i+1) % directions.length];
        return directionFromLetter(nextLetter);
      }
    }
  },
  
  xAdd: function(offset)
  {
    if (this.turns) {
      if (typeof(offset.x) != 'undefined') {
        offset = this.pointToOffset(offset);
      }
      
      return this.serverDirToMovement(this.turns[offset])[0];      
    } else {
      return this.xxAdd;
    }
  },
  
  yAdd: function(offset)
  {
    if (this.turns) {
      if (typeof(offset.x) != 'undefined') {
        offset = this.pointToOffset(offset);
      }
      
      return this.serverDirToMovement(this.turns[offset])[1];      
    } else {
      return this.yyAdd;
    }
  },
  
  pointToOffset: function(target)
  {
    var p = this.start.dup();
    for (var i = 0; i <= this.turns.length; i++) {
      if (p.equals(target)) {
        return i;
      }
      
      p.x += this.xAdd(i);
      p.y += this.yAdd(i);
    }
    return -1;
  },
  
  serverDirToMovement: function(str)
  {
    if (str == 'UP') {
      return [0,-1];
    } else if (str == 'UP_RIGHT') {
      return [1,-1];
    } else if (str == 'RIGHT') {
      return [1,0];
    } else if (str == 'DOWN_RIGHT') {
      return [1,1];
    } else if (str == 'DOWN') {
      return [0,1];
    } else if (str == 'DOWN_LEFT') {
      return [-1,1];
    } else if (str == 'LEFT') {
      return [-1,0];
    } else if (str == 'UP_LEFT') {
      return [-1,-1];
    } else {
      return [0,0];
    }
  }
}

ACROSS = new Direction('A', 'across', 'acrosses', 1, 0);
DOWN = new Direction('D', 'down', 'downs', 0, 1);
RIGHT_TO_LEFT = new Direction('L', 'right_to_left', '', -1, 0);
DOWN_TO_UP = new Direction('U', 'down_to_up', '', 0, -1);
DOWN_RIGHT = new Direction('V', 'down_right', '', 1, 1);
CRAZY = new Direction('Z', 'crazy', '', 0, 0);

DIRECTIONS = new Array(ACROSS, DOWN_RIGHT, DOWN, RIGHT_TO_LEFT, DOWN_TO_UP, CRAZY);
DEFAULT_DIRECTION_LETTERS = new Array('A', 'D', 'Z');

function directionFromLetter(letter)
{
  for (var i = 0; i < DIRECTIONS.length; i++) {
    var dir = DIRECTIONS[i];
    if (letter == dir.letter) {
      return dir;
    }
  }

  return null;
}

function directionFromClue(clue)
{
  var letter = clue.direction;
  for (var i = 0; i < DIRECTIONS.length; i++) {
    var dir = DIRECTIONS[i];
    if (letter == dir.letter) {
      if (letter == 'Z') {
        return new Direction('Z', 'crazy', '', 0, 0, clue.turns.split(','), clue.point);
      }
      return dir;
    }
  }

  return null;
}

function directionFromWord(word)
{
  for (var i = 0; i < DIRECTIONS.length; i++) {
    var dir = DIRECTIONS[i];
    if (word == dir.display) {
      return dir;
    }
  }

  return null;
}

Rules = function(hash)
{
	this.hash = hash
}

Rules.prototype =
{
	get:function(name, defult)
	{
		if (typeof(this.hash[name]) == "undefined")
		{
			return defult;
		}
		
		return this.hash[name];
	},
   
  set:function(name, value)
  {
    this.hash[name] = value;
  },
  
  setHash:function(h)
  {
    this.hash = h;
  }
}

//TODO: remove?
function showFirstLoginDialog()
{
	var html = "<h4>Welcome to The Endless Crossword</h4>";
	html += "<p>This is a <b>Beta</b>. Please let us know any feedback you have and excuse any problems</p>";
	html += "<p>The Endless Crossword is a huge crossword puzzle (thousands of clues) that you work on collaboratively (everyone on facebook is working on the same puzzle with you)</p>";
	html += "<h5>The Controls</h5>";
	html += "<ul>";
	html += "<li>Arrow keys - move around the puzzle</li>";
	html += "<li>Tab - switch direction (across/down)</li>";
	html += "<li>Drag mouse - move the puzzle around</li>";
	html += "</ul>";
	html += "<h5>What do the different color letters mean?</h5>";
	html += "<ul>";
	html += "<li>Black - correct letter</li>";
	html += "<li>Orange - your pending guess (may be right or wrong)</li>";
	html += "<li>Crossed out - wrong letter that you guessed</li>";
	html += "</ul>";
	html += "<p>Have fun and remember to floss.</p>";
	html += "<input style='margin: 0px 0px 10px 100px;' type='button' value='Start Puzzling' onclick='clueFiller.hideDialog();' class='inputbutton inputaux'/>";
	
	document.getElementById('dialog_content').innerHTML = html;
	
	clueFiller.showDialog();
}

function quoteJS(str)
{
	var s = "";
	for (var i = 0; i < str.length; i++)
	{
		var c = str[i];
		if (c == '\'') {
			s += '\\';
		}
		s += c;
	}
	
	return s;
}


function mkDelegate(obj, method) {
    function delegate() {
        return method.apply(obj, arguments);
    }    
    return delegate;
}
