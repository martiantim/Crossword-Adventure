class LetterGrid
  
  def initialize(width, height, answers)
    @width = width
    @height = height
    
    @grid = Array.new(@width)
    @grid.each_with_index do |col, index|
      @grid[index] = Array.new(@height)
      0.upto(@height-1) { |y| @grid[index][y] = ' ' }
    end
    
    answers.each do |a|
      @grid[a.x][a.y] = a.correct
    end        
  end  

  def to_s    
    str = "  "    
    0.upto(@width-1) { |i| str += (i%10).to_s }
    str += "\n\n"
    
    each_letter do |letter, x, y|
      str += "\n" if y > 0 && x == 0
      str += "#{(y%10)} " if x == 0
      
      str += letter
    end
    str
  end
  
  def [](address)    
    @grid[address.x][address.y]    
  end
  
  def []=(address, value)
    @grid[address.x][address.y] = value
  end    
  
  def valid_pos?(pos)
    return false if pos.y < 0 || pos.y >= @height
    return false if pos.x < 0 || pos.x >= @width
    
    true
  end
  
  def is_block?(pos)
    return true if !self.valid_pos?(pos)
    
    let = self[pos]
    (let == '*')
  end
  
  def available?(pos)
    return false if !self.valid_pos?(pos)
    
    let = self[pos]
    (let != '*' && let != ' ' && let != '?')
  end

  def each_letter
    0.upto(@height-1) do |y|
      0.upto(@width-1) do |x|
        yield(@grid[x][y], x, y)
      end
    end
  end
  
  def dup
    d = LetterGrid.new(@width, @height, [])
    self.each_letter do |letter, x, y|
      d[Position.new(x,y)] = letter
    end
    
    d
  end
  
end