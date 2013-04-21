class Puzzle < ActiveRecord::Base
  set_inheritance_column :blah
  
  attr_accessible :width, :height, :name
  
  has_many :clues  
  has_many :wordclues, :through => :clues
  has_many :words, :through => :wordclues
  
  MAX_TRIES = 2_000_000    
  
  has_many :answers
  has_many :clues
  
  def letter_grid
    @grid ||= LetterGrid.new(self.width, self.height, self.answers)    
  end
  
  def reset_letter_grid
    @grid = nil
  end
  
  def find_third(srand = 1234, save = false)
    @tree = WordTree.init(1)
    
    @cgrid = CheckingGrid.new(letter_grid)
    @word_cnt = 0
    @rnd = Random.new(srand)
    @skips = []
    @stuck = {}
    
    @words = []
    fewest_letters_left = 1_000_000
    while @cgrid.letters_to_fill > 0 do
      if @cgrid.letters_to_fill < fewest_letters_left
        fewest_letters_left = @cgrid.letters_to_fill
      end
      
      word = find_word
      if word
        #puts "Found #{word.nice_to_s}"
        #puts @cgrid.to_s
        @words << word
      else
        if @words.length == 0
          raise StandardError, "Can't go back further"
        end
        worth_reporting = true #(@cgrid.letters_to_fill < 15)
        
        puts "Left: #{@cgrid.letters_to_fill}"
        puts @cgrid.to_s if worth_reporting
        num = @words.length
        if @words.length > 1
          if @rnd.rand() > 0.5
            num = 1
          elsif @rnd.rand() > 0.5
            num = 2
          elsif @rnd.rand() > 0.5 && @words.length > 2
            num = @rnd.rand(((@words.length-1)/2).floor)+1
          else
            num = @rnd.rand(@words.length-1)+1
          end
        end
        num.times do
          lword = @words.pop
          puts "Undoing #{lword.nice_to_s}"
          @cgrid.undo_word(lword)          
        end
        puts @cgrid.to_s if worth_reporting
      end
    end
    
    puts "YAYAYAYAYAYAYAYA!!!!!"
    @words.each do |w|
      puts w.nice_to_s      
    end
    
    sorted_words = @words.sort_by do |w| 
      pos = w.positions.first
      pos.y*self.width + pos.x
    end
    
    if save
      @words.each do |w|        
        word = Word.find_by_word(w.to_s)
        if word
          c = w.to_dbclue
          c.puzzle_id = self.id
          wc = word.wordclues.sample
          c.wordclue_id = wc.id
          c.save!
        end
      end
    end

    str = ""
    sorted_words.each_with_index do |w, index|
      word = Word.find_by_word(w.to_s)
      if word
        clues = word.wordclues.first(5).collect(&:clue).join(", ")
      else
        clues = '?'
      end
     
      num = ((index %26) + 'A'.ord).chr 
      str += "#{num}. #{clues}\n"
    end
    
    puts str
    
    sorted_words
  end
  
  def find_word
    start_pos = nil
    1.upto(25) do |i|      
      min_length = 4
      #min_length = 5 if i > 5
      min_length = 4 if i > 10
      min_length = 3 if i > 15
      min_length = 2 if i > 20
      
      start_pos = @cgrid.most_walled_in(@rnd, @skips)
      raise StandardError, "DONE" if !start_pos
      
      
#      ways = @cgrid.ways_from_pos(start_pos)
#      if ways <= 1
#        @stuck[start_pos.to_s] ||= 0
#        @stuck[start_pos.to_s] += 1
#        if @stuck[start_pos.to_s] > 20
#          @skips << start_pos
#        end
#      end
      

      start_word = FancyWord.new()
      start_word.add_letter(letter_grid[start_pos], start_pos, :START)
      @cgrid.set_used(start_pos)
      word = find_word_at_pos(start_pos, start_word, min_length)
      return word if word
      @cgrid.set_unused(start_pos) if !word
      
      if @word_cnt > MAX_TRIES        
        puts @cgrid
        puts word

        @words.each do |w|
          puts w.nice_to_s
        end
        fdsfds
      end
    end
    
    puts "Stuck starting at #{start_pos}"
    nil
  end
  
  def find_word_at_pos(pos, word, min_length)            
    if @word_cnt > MAX_TRIES
      return nil
    end
    
    if word.length >= min_length
      if @tree.is_word?(word.to_s) && !@cgrid.is_normal_clue?(word)
        return word
      else
        if word.length >= 6 || @rnd.rand >= 0.5
          return nil
        end        
      end
    end        
    @cgrid.each_dir(pos, @rnd) do |p, dir|
      @word_cnt += 1      
      @cgrid.set_used(p)
      word.add_letter(letter_grid[p], p, dir)
      ret = find_word_at_pos(p, word, min_length)      
      if ret != nil
        return ret
      end
      word.pop_letter()
      @cgrid.set_unused(p)
    end
    
    nil
  end
  
  def possible_dirs(grid, pos)
    list = []
    list << :UP if grid.available?(pos.relative(:UP))
    list << :DOWN if grid.available?(pos.relative(:DOWN))
    list << :RIGHT if grid.available?(pos.relative(:RIGHT))
    list << :LEFT if grid.available?(pos.relative(:LEFT))
    list
  end
  
  def grid_section(user, x1 = 0, y1 = 0, x2 = nil, y2 = nil)
    x2 = width - 1 if !x2
    y2 = height - 1 if !y2
    
    x1 = 0 if x1 < 0
    y1 = 0 if y1 < 0
    x2 = width - 1 if x2 >= width
    y2 = height - 1 if y2 >= height
    
    w = x2 - x1 + 1
    h = y2 - y1 + 1
    
    showgrid = user_grid(user)
    
    g = Array.new(w).map!{ Array.new(h) }
    (0..(w-1)).each do |x|
      (0..(h-1)).each do |y|
       g[x][y] = showgrid[Position.new(x + x1, y + y1)]
      end
    end    
    g
  end
  
  def user_grid(user)
    g = LetterGrid.new(self.width, self.height, [])
    
    letter_grid.each_letter do |letter, x, y|
      pos = Position.new(x,y)
      if letter == '*'
        g[pos] = '*'
      else
        g[pos] = ' '
      end
    end    
    
    #guesses = Guess.find(:all, :conditions => "(puzzle_id = #{self.id} and user_id = #{user.id}) OR challenge_id = #{challenge.id}")        
    guesses = []
    guesses.each do |guess|
      y = guess.attributes["y"]
      x = guess.x
      if guess.letter == grid[y][x][:letter]
        g[y][x] = {:letter => guess.letter, :user_id => guess.user_id}
      end
    end
    
    g
  end



  def self.make(width = 4, height = 4, seed = 1234)
    puz = Puzzle.new(:width => width, :height => height)
    
    puz.clues = ClueFinder.new(puz).find!
    
    pb = PuzzleBuilder.new(puz)
    pb.build!(seed)
    
    puz.find_third(seed)
    
    puz
  end
  
  def check_guesses!(guesses)
    guesses.each do |g|
      puts "-"*100
      p g
      p letter_grid[g]
      g.correct = (g.letter == letter_grid[g])      
      
      #g.created_at = Time.now
      #g.user_id = score.user_id
      #g.save!
      
      #score.record_score_for_guess(g)
    end
    
    #check if finished puzzle
    #challenge = score.challenge
    #challenge.next_player!
    #letters_completed = challenge.scores.collect(&:letters_completed).sum   
#    if letters_completed >= numNonblockLetters
#      challenge.update_attribute(:end_time, Time.now)
#      true
#    else
#      false
#    end    
  end

  
  
end
