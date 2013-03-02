class Point
  constructor: (@x, @y) ->

  equals: (p) ->
    (@x == p.x) && (@y == p.y)

  dup: ->
    new Point(@x, @y)




window.Point = Point