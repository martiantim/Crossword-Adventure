class Inventory
  constructor: () ->
    @items = []
    @used = []

  add: (item) ->
    @items.push(item)
    @redraw();
    
  redraw: ->
    items = $('#inventory .items')
    items.html('')
    for i in @items      
      items.append(i.toHTML());

  used_items: ->
    @used

  use: (p) ->
    i = @items.pop()
    return if !i
    
    @used.push(i)
    console.log(i)
    i.use(p)
    board.reDraw(true)

window.Inventory = Inventory