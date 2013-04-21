class CheckingGrid
  attr_reader :cur_grid
  
  USED = '?'
  
  def initialize(grid)
    @orig_grid = grid
    @cur_grid = grid.dup
  end
  
  def most_walled_in(rnd, skips = [])
    worst_pos = nil
    worst_num = 100
    num_found = 1
    
    @cur_grid.each_letter do |letter, x, y|
      next if !is_letter?(letter)
      next if skips.include?(Position.new(x,y))
      
      pos = Position.new(x,y)
      ways = self.ways_from_pos(pos)
      
      if ways < worst_num || (ways == worst_num && rnd.rand > (1-1.0/(num_found*2))) #|| (ways == worst_num+1 && rnd.rand > (1-1.0/(num_found*4)))
        worst_num = ways
        worst_pos = pos
        num_found += 1
      end
      
    end
    
    worst_pos
  end
  
  def ways_from_pos(pos)
    ways = 0
    self.each_dir(pos) do |p, dir|              
      ways += 1
    end
    ways
  end
  
  def each_dir(pos, rnd = nil)
    start = 0
    start = rnd.rand(Position::DIRS.length) if rnd
    
    for i in 1..(Position::DIRS.length) do
      dir = Position::DIRS[(i+start)%Position::DIRS.length]
      p = pos.relative(dir)
      next if !@cur_grid.available?(p)
      
      yield p, dir
    end
  end
  
  def set_used(pos, let = USED)
    @cur_grid[pos] = let
  end
  
  def set_unused(pos)
    @cur_grid[pos] = @orig_grid[pos]
  end
  
  def set_clue(clue, word)
    pos = clue.position
    
    0.upto(clue.length-1) do |i|
      set_used(pos, word[i])
      pos = pos.relative(clue.dir_sym)
    end
  end
  
  def undo_clue(clue, pattern)
    pos = clue.position
    
    0.upto(clue.length-1) do |i|
      if pattern[i] == '?'
        set_unused(pos)
      end
      pos = pos.relative(clue.dir_sym)
    end
  end
  
  def undo_word(word)
    word.each_pos do |p|
      self.set_unused(p)
    end
  end
  
  def pattern(clue)
    @cur_grid.pattern(clue)    
  end
  
  def is_letter?(letter)
    letter >= 'A' && letter <= 'Z'
  end
  
  def to_s
    @cur_grid.to_s
  end
  
  def letters_to_fill
    num = 0
    @cur_grid.each_letter do |letter, x, y|
      num += 1 if is_letter?(letter)      
    end
    num
  end
  
  def is_normal_clue?(word)
    if word.is_all_dir?(:RIGHT)
      return false if @orig_grid.available?(word.positions.first.relative(:LEFT))
      return false if @orig_grid.available?(word.positions.last.relative(:RIGHT))
      true
    elsif word.is_all_dir?(:DOWN)
      return false if @orig_grid.available?(word.positions.first.relative(:UP))
      return false if @orig_grid.available?(word.positions.last.relative(:DOWN))
      true
    else
      false
    end
  end
  
end