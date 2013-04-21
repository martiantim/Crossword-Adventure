class Clue
  constructor: (c) ->
    @point = new Point(c.x, c.y)
    @direction = Direction.directionFromClue(c)
    @length = c.length
    @text = c.clue    
  
  each_point: (func) ->    
    p = @point.dup()    
    for i in [1..@length]      
      func(p, @direction)
      p.incr(@direction)
      
window.Clue = Clue