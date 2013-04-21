
Direction2 = function(letter, display, plural, xAdd, yAdd, turns, start)
{
  this.letter = letter;
  this.display = display;
  this.plural = plural;
  this.xxAdd = xAdd;
  this.yyAdd = yAdd;
  this.turns = turns;
  this.start = start;
}

Direction2.prototype = 
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


//function directionFromLetter(letter)
//{
//  for (var i = 0; i < DIRECTIONS.length; i++) {
//    var dir = DIRECTIONS[i];
//    if (letter == dir.letter) {
//      return dir;
//    }
//  }
//
//  return null;
//}

//function directionFromClue(clue)
//{
//  var letter = clue.direction;
//  for (var i = 0; i < DIRECTIONS.length; i++) {
//    var dir = DIRECTIONS[i];
//    if (letter == dir.letter) {
//      if (letter == 'Z') {
//        return new Direction('Z', 'crazy', '', 0, 0, clue.turns.split(','), clue.point);
//      }
//      return dir;
//    }
//  }
//
//  return null;
//}

//function directionFromWord(word)
//{
//  for (var i = 0; i < DIRECTIONS.length; i++) {
//    var dir = DIRECTIONS[i];
//    if (word == dir.display) {
//      return dir;
//    }
//  }
//
//  return null;
//}


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
