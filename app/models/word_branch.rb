class WordBranch
  
  A_ORD = "A".ord
  
  attr_reader :prefix, :is_word
 
  def initialize(prefix)
    @prefix = prefix    
    @branches = nil
    @is_word = false
  end
  
  def add_word(prefix, suffix)    
    if suffix.length == 0
      @is_word = true
      return
    else
      char = suffix.shift      
      index = char.ord - A_ORD
      return if index < 0 || index > 25
      @branches ||= Array.new
      @branches[index] ||= WordBranch.new(@prefix + char) 
      @branches[index].add_word(prefix << char, suffix)
    end
  end
  
  def each_branch(rnd)
    return if !@branches
    
    offset = rnd.rand(26)
    
    0.upto(25) do |i|
      b = @branches[(i+offset)%26]
      yield b if !b.nil?
    end
  end  
  
  def get_branch(char)
    return nil if !@branches
    @branches[char.ord - A_ORD]
  end
 
end
