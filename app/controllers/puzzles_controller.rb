class PuzzlesController < ApplicationController
  
  def show
    @me = User.find(1284)
    @puzzle = Puzzle.find(params[:id])
  end
  
  def edit
    @me = User.find(1284)
    @puzzle = Puzzle.find_by_id(params[:id])
    if !@puzzle
      @puzzle = Puzzle.create!(:width => 15, :height => 15, :name => "New Puzzle")
    end
  end
  
  def save
    @me = User.find(1284)
    @puzzle = Puzzle.find_by_id(params[:id])
    
    if params[:width]
      @puzzle.width = params[:width]
      @puzzle.height = params[:height]
      @puzzle.reset_letter_grid
      @puzzle.save!
    end
    
    params[:grid].each do |x, arr|
      arr.each do |y, h|
        letter = h[:letter]        
        @puzzle.set_answer(x, y, letter) if letter != ' '
      end
    end
        
    render :text => 'ok'
  end
  
  def section
    @me = User.find(1284)
    
    @puzzle = Puzzle.find(params[:id])
    
    x1 = params[:x1].to_i
    y1 = params[:y1].to_i
    x2 = params[:x2].to_i
    y2 = params[:y2].to_i
    
    x2 = 100 if x2 == 0
    y2 = 100 if y2 == 0
    
    #TODO: duplicated in puzzle.rb
    x2 = @puzzle.width - 1 if !x2
    y2 = @puzzle.height - 1 if !y2
    
    x1 = 0 if x1 < 0
    y1 = 0 if y1 < 0
    x2 = @puzzle.width if x2 >= @puzzle.width
    y2 = @puzzle.height if y2 >= @puzzle.height
    
    @data = @puzzle.grid_section(@me, x1, y1, x2, y2, params[:show_answers] == 'true')
    
    render :json => {
      :minX => x1, 
      :minY => y1, 
      :maxX => x2, 
      :maxY => y2,
      :grid => @data,
      :clues => @puzzle.clues.collect(&:js_hash)
    }.to_json
  end
  
  def guess
    @puzzle = Puzzle.find(params[:id])
    @guesses = params[:guesses].split("-").collect { |g| Guess.from_s(g) }
    
    @puzzle.check_guesses!(@guesses)
    
    render :json => {
      :guesses => @guesses.collect(&:js_hash)
    }
  end

  
end
