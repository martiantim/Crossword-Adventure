class ClueFinder
  
  def initialize(puzzle)
    @puzzle = puzzle
  end
  
  def find!
    clues = []
    
    clue_num = 1
    grid = @puzzle.letter_grid

    grid.each_letter do |letter, x, y|
      next if letter == '*'

      found_clue = false      
      pos = Position.new(x,y)
      if grid.is_block?(pos.relative(:LEFT)) && count_length(pos, :RIGHT) > 1
        clues << Clue.new(:number => clue_num, :x => pos.x, :y => pos.y,
                          :direction => 'A', :length => count_length(pos, :RIGHT))
        found_clue = true
      end
      
      if grid.is_block?(pos.relative(:UP)) && count_length(pos, :DOWN) > 1
        clues << Clue.new(:number => clue_num, :x => pos.x, :y => pos.y, :direction => 'D', :length => count_length(pos, :DOWN))
        found_clue = true
      end
      
      
      clue_num += 1 if found_clue
    end
    
    clues
  end
  
  def count_length(pos, dir)
    len = 0
    until @puzzle.letter_grid.is_block?(pos) do
      pos = pos.relative(dir)
      len += 1
    end
    
    len
  end
  
end