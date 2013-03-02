class Clue
  constructor: (c) ->
    @point = new Point(c.x, c.y);
    @direction = directionFromClue(c);
  

window.Clue = Clue