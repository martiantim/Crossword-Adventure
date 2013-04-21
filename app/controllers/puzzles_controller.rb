class PuzzlesController < ApplicationController
  
  def show
    @me = User.find(1284)
    @puzzle = Puzzle.find(params[:id])
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
    
    @data = @puzzle.grid_section(@me, x1, y1, x2, y2)
    
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
