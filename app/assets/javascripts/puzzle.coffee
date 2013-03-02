class Puzzle
  constructor: (@width, @height) ->
    @loading = false
    @clues = new ClueHash
    @data = null

  getWidth: ->
    @width
    
  getHeight: ->
    @height

  grabData: (minx, miny, maxx, maxy) ->
    console.log 'grab'
    return if @loading

    $.ajax '/puzzles/'+puzzleID + '/section',
      dataType: 'json'      
      success: (data) ->
        onPuzzleLoaded data


  onPuzzleLoaded: (puz) ->
    alert('hi')
    
    @data = puz.data
    for c in puz.clues
      clue = new Clue(c)
      @clues.add(clue)
    
  getClue: (p, dir) ->	
    @clues.find(p, dir)
	
  getLetter: (p) ->
    return '?' if !@isValidPosition(p)
    return '?' if !@data
    @data[p.x][p.y]
  
  isSolid: (p) ->
    return false if !@isValidPosition(p)
    return false if !@data
    @getLetter(p) == '*'    
  
  isValidPosition: (p) ->
    return false if p.x < 0
    return false if p.x >= @width
    return false if p.y < 0
    return false if p.y >= @height
    
    true

  isWithinThemeClue: (p) ->
    false

  isEnabled: (p) ->
    true

  isClueStart: (p) ->
    false
  
  isUnknown: (p) ->
    return false if !@isValidPosition(p)
		
		if !this.data
      true
    else
      false





window.Puzzle = Puzzle