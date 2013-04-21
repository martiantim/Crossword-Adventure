class Special
  constructor: (@p, @width, @height, @prize) ->
    @applied = false
    
  isSatisfied: (puzzle) ->
    ret = true
    for x in [@p.x..(@p.x + @width-1)]
      for y in [@p.y..(@p.y+@height-1)]        
        if !puzzle.isSquareFilled(new Point(x,y))
          ret = false           
    ret
    
  apply: (puzzle) ->
    return if @applied
    
    if @prize.pos
      if @prize.letters
        dir = @prize.direction || ACROSS
        p = @prize.pos.dup()
        letters = @prize.letters
        for i in [0..(letters.length-1)]
          puzzle.setLetter(p, letters[i])
          p.incr(dir)
      else
        puzzle.setLetter(@prize.pos, ' ')
    else if @prize.item
      window.inventory.add(@prize.item)
    
    
    @applied = true


window.Special = Special