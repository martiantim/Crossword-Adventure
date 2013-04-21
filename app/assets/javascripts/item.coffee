class Item
  constructor: (@name) ->
    @used_at = null
    
  toHTML: ->
    $('<img src="/assets/'+@name+'.png" style="width:25px;height:25px">')
    
  use: (p) ->
    @used_at = p
    console.log("TORCH!")

  log: ->
    console.log("Item: "+@name)

window.Item = Item