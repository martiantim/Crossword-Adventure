class Position
  attr_reader :x, :y
  
  OFFSETS = {
    :UP => [0,-1],
    :DOWN => [0,1],
    :RIGHT => [1,0],
    :LEFT => [-1,0],
    :UP_RIGHT => [1,-1],
    :UP_LEFT => [-1,-1],
    :DOWN_RIGHT => [1,1],
    :DOWN_LEFT => [-1,1]
  }
  
  DIRS = OFFSETS.keys
  
  def initialize(x,y)
    @x = x
    @y = y
  end
  
  def relative(change_x, change_y = nil)
    if change_x.is_a?(Symbol)
      self.relative_symbol(change_x)
    else
      Position.new(x+change_x, y+change_y)
    end    
  end
  
  def relative_symbol(sym)
    o = OFFSETS[sym]
    raise StandardError, "Invalid offset #{sym}" if !o
    
    Position.new(x+o[0], y+o[1])    
  end
  
  def to_s
    "#{x}x#{y}"
  end
  
  def ==(obj)
    self.x == obj.x && self.y == obj.y
  end
end