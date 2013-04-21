class ClueHash
  constructor: ->
    @h = {}
    @list = []
  
  add: (clue) ->    
    that = this
    clue.each_point (p, dir) ->            
      that.h[that._hash(p, dir)] = clue            
    @list.push clue  
    
   
  find: (p, dir) ->    
    @h[@_hash(p,dir)] 
 
  _hash: (p, dir) ->  
    p.x + "x" + p.y + dir.letter;


window.ClueHash = ClueHash