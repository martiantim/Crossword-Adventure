class PuzzleBuilder
  
  def initialize(puzzle)
    @puzzle = puzzle    
    @tree = WordTree.init(1)
    @clues = @puzzle.clues
    @cur_clue_offset = 0
  end
  
  def build!(seed = 1234)
    @rnd = Random.new(seed)
    @cgrid = CheckingGrid.new(@puzzle.letter_grid)
    
    fill_clue
    
    @cgrid.cur_grid.each_letter do |letter, x,y|
      @puzzle.answers << Answer.new(:x => x, :y => y, :correct => letter)
    end
    @puzzle.reset_letter_grid
    
  end
  
  def fill_clue
    clue = next_clue
    return true if !clue
    
    pattern = @cgrid.pattern(clue)
    puts "PATTERN #{pattern}"
    
    @tree.get_all_matching(pattern, @rnd) do |word|
      puts "FOUND #{word}"
      @cgrid.set_clue(clue, word)
      puts @cgrid.to_s
      
      if fill_clue
        puts "------- #{word} (#{clue.position}#{clue.direction})"
        return true
      end
      undo_clue(clue, pattern)      
    end
    
    false
  end
  
  def next_clue    
    if @cur_clue_offset >= @clues.length
      puts "*"*100
      puts "YAYAYAYA"
      return nil
    end
    
    clue = @clues[@cur_clue_offset]
    @cur_clue_offset += 1
    
    clue    
  end
  
  def undo_clue(clue, pattern)
    puts "UNDO"
    @cgrid.undo_clue(clue, pattern)
    @cur_clue_offset -= 1
  end
  
end