class Point
  constructor: (@x, @y) ->

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