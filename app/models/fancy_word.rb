class FancyWord
  attr_reader :positions
  
  def initialize
    @letters = []
    @positions = []
    @dirs = []
  end
  
  def add_letter(letter, position, dir)
    @letters << letter
    @positions << position
    @dirs << dir
  end
  
  def pop_letter
    @letters.pop
    @positions.pop
    @dirs.pop
  end
  
  def to_s
    @letters.join
  end
  
  def nice_to_s
    "#{@letters.join} (#{@positions.first}:#{@dirs[1..-1].join(',')})"
  end
  
  def length
    @letters.length
  end
  
  def each_pos
    @positions.each do |p|
      yield p
    end
  end
  
  def is_all_dir?(dir)
    ret = true
    @dirs[1..-1].each do |d|
      ret = false if d != dir
    end
    ret
  end
  
  def start
    @positions.first
  end
  
  def to_dbclue
    turns = @dirs[1..-1].join(',')
    Clue.new(:x => start.x, :y => start.y, :direction => 'Z', :length => length, :number => 1, :turns => turns)
  end
  
  
end