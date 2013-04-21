class Puzzle
  constructor: (@width, @height) ->
    @loading = false
    @clues = new ClueHash
    @data = null
    @specials = []

  getWidth: ->
    @width
    
  getHeight: ->
    @height

  grabData: (minx, miny, maxx, maxy) ->    
    that = this
    return if @loading

    @loading = true
    $.ajax '/puzzles/'+puzzleID + '/section',
      dataType: 'json'      
      success: (data) ->        
        that.onPuzzleLoaded data


  onPuzzleLoaded: (puz) ->        
    that = this
    @data = puz.grid    
    for x in [0..(@width-1)]
      for y in [0..(@height-1)]        
        that.data[x][y] = {letter: that.data[x][y], visible: false}
    
    for c in puz.clues
      clue = new Clue(c)
      @clues.add(clue)          
    @setLetter(new Point(0,7), 'S')
    @setLetter(new Point(4,8), '*')
    board.jumpTo(0,7,ACROSS)
    @specials.push new Special(new Point(0,7), 4, 3, {pos: new Point(4,8), letters: 'SESAME'})
    @specials.push new Special(new Point(3,7), 1, 1, {item: new Item('torch')})
    board.reDraw(true)
    
  getClue: (p, dir) ->
    @clues.find(p, dir)
	
  getLetter: (p) ->
    return '?' if !@isValidPosition(p)
    return '?' if !@data
    @data[p.x][p.y].letter
  
  setLetter: (p, letter) ->
    @data[p.x][p.y].letter = letter
  
  isVisible: (p) ->
    return false if !@data
    @data[p.x][p.y].visible
    
  setVisible: (p, val) ->
    return false if !@data
    return false if !@isValidPosition(p)
    @data[p.x][p.y].visible = val
    

  isEntireClueVisible: (c) ->
    that = this
    ret = true
    c.each_point (cp, cdir) ->      
      ret = false if !that.isVisible(cp)
    ret

  isSolid: (p) ->
    return true if !@isValidPosition(p)
    return false if !@data
    @getLetter(p) == '*'    
  
  isValidPosition: (p) ->
    return false if p.x < 0
    return false if p.x >= @width
    return false if p.y < 0
    return false if p.y >= @height
    
    true    
    
  isSquareFilled: (p) ->
    letter = this.getLetter(p)
    letter != ' '

  isWithinThemeClue: (p) ->
    false
    
  isWithinClue: (clue, p) ->
    return false if !clue
	
    ret = false
    clue.each_point (cp, cdir) ->      
      ret = true if cp.equals(p)
  
    ret
    
  isEnabledWithDirection: (p, dir) ->
    true

  isClueStart: (p) ->
    false
  
  isUnknown: (p) ->
    if !@isValidPosition(p)
      return false 

		if !@data
      true
    else
      false
      
  scrollToClue: (clue) ->
    false


  getClueHTML: (clue) ->        		
    @lastShownClue = clue        		
    $("<span id='clue_display'>"+clue.text+"</span>")        
       
  _hasSolveInDirection: (p, dir) ->
    p = p.dup()
    while @isValidPosition(p) && !@isSolid(p)
      return true if @isSquareFilled(p)
      p.incr(dir)
    
    false
  
  _hasSolveNextDoor: (p, dir) ->
    p = p.dup()
    p.incr(dir)
    @isValidPosition(p) && !@isSolid(p) && @isVisible(p)

  _shouldBeVisible: (p) ->    
    if @isSolid(p)
      if @_hasSolveNextDoor(p, RIGHT_TO_LEFT) || @_hasSolveNextDoor(p, ACROSS) || @_hasSolveNextDoor(p, DOWN_TO_UP) || @_hasSolveNextDoor(p, DOWN) || @_hasSolveNextDoor(p, UP_RIGHT) || @_hasSolveNextDoor(p, DOWN_LEFT) || @_hasSolveNextDoor(p, UP_LEFT) || @_hasSolveNextDoor(p, DOWN_RIGHT)
        true
      else
        false
    else if @_hasSolveInDirection(p, RIGHT_TO_LEFT) || @_hasSolveInDirection(p, ACROSS) || @_hasSolveInDirection(p, DOWN_TO_UP) || @_hasSolveInDirection(p, DOWN)
      true
    else
      false
      
  _applyTorch: (middle) ->
    for x in [-3..3]
      for y in [-3..3]
        continue if Math.abs(x) + Math.abs(y) > 3
        p = new Point(middle.x+x,middle.y+y)
        @setVisible(p, true)
     
  recalculateVisible: () ->
    for special in @specials
      if !special.applied && special.isSatisfied(this)
        special.apply(this)
    
    for x in [0..(@width-1)]
      for y in [0..(@height-1)]        
        @data[x][y].visible = @_shouldBeVisible(new Point(x,y))
    
    #XXX for now do twice since block depend on letter squares
    for x in [0..(@width-1)]
      for y in [0..(@height-1)]        
        @data[x][y].visible = @_shouldBeVisible(new Point(x,y))        
    
    for item in inventory.used_items()
      @_applyTorch(item.used_at)
      
      
    

window.Puzzle = Puzzle