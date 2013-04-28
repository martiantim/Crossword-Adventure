class Point
  constructor: (@x, @y) ->
    if typeof(@x) == 'string'
      idparts = @x.split('x');		    
      @x = parseInt(idparts[0])
      @y = parseInt(idparts[1])


  equals: (p) ->
    (@x == p.x) && (@y == p.y)

  dup: ->
    new Point(@x, @y)

  incr: (dir) ->
    @x = @x + dir.xxAdd;
    @y = @y + dir.yyAdd;
    
  log: ->
    console.log(@x + "," + @y)


window.Point = Point