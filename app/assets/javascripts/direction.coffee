class Direction
  constructor: (@letter, @display, @plural, @xxAdd, @yyAdd, @turns, @start) ->
  
  nextDirection: (directions) ->
    for i in [0..(directions.length-1)]    
      dir = directions[i]
      if (dir == @letter)
        nextLetter = directions[(i+1) % directions.length];
        return Direction.directionFromLetter(nextLetter);
    
    return null
    
  xAdd: (offset) ->
    if @turns
      if typeof(offset.x) != 'undefined'
        offset = @pointToOffset(offset)
      
      @serverDirToMovement(@turns[offset])[0]
    else
      @xxAdd
  
  yAdd: (offset) ->  
    if @turns
      if typeof(offset.x) != 'undefined'
        offset = this.pointToOffset(offset)      
      
      @serverDirToMovement(this.turns[offset])[1];      
    else
      @yyAdd
      
  pointToOffset: (target) ->
    p = @start.dup()
    
    for i in [0..@turns.length]    
      return i if p.equals(target)    
      p.x += @xAdd(i);
      p.y += @yAdd(i);    
    
    return -1
    
  #static methods
  @directionFromLetter: (letter) ->
    for dir in DIRECTIONS        
      return dir if letter == dir.letter
    null
    
  @directionFromClue: (clue) ->
    letter = clue.direction
    for dir in DIRECTIONS
      if letter == dir.letter
        if (letter == 'Z')
          return new Direction('Z', 'crazy', '', 0, 0, clue.turns.split(','), clue.point)
        else
          return dir
    null

      
window.Direction = Direction

window.ACROSS = new Direction('A', 'across', 'acrosses', 1, 0);
window.DOWN = new Direction('D', 'down', 'downs', 0, 1);
window.RIGHT_TO_LEFT = new Direction('L', 'right_to_left', '', -1, 0);
window.DOWN_TO_UP = new Direction('U', 'down_to_up', '', 0, -1);
window.DOWN_RIGHT = new Direction('V', 'down_right', '', 1, 1);
window.DOWN_LEFT = new Direction('W', 'down_left', '', -1, 1);
window.UP_RIGHT = new Direction('X', 'up_right', '', 1, -1);
window.UP_LEFT = new Direction('Y', 'up_left', '', -1, -1);
window.CRAZY = new Direction('Z', 'crazy', '', 0, 0);

window.DIRECTIONS = new Array(ACROSS, DOWN_RIGHT, DOWN, RIGHT_TO_LEFT, DOWN_TO_UP, CRAZY);
window.DEFAULT_DIRECTION_LETTERS = new Array('A', 'D', 'Z');
