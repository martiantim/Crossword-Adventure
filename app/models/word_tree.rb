class WordTree  
 
  attr_accessor :trunk 
  
  TWO_LETTER_WORDS = ["AA","AB","AD","AE","AG","AH","AI","AL","AM","AN","AR","AS","AT","AW","AX","AY","BA","BE","BI","BO","
BY","DE","DO","ED","EF","EH","EL","EM","EN","ER","ES","ET","EX","FA","GO","HA","HE","HI","HM","HO","
ID","IF","IN","IS","IT","JO","KA","LA","LI","LO","MA","ME","MI","MM","MO","MU","MY","NA","NE","NO","
NU","OD","OE","OF","OH","OM","ON","OP","OR","OS","OW","OX","OY","PA","PE","PI","RE","SH","SI","SO","
TA","TI","TO","UH","UM","UN","UP","US","UT","WE","WO","XI","XU","YA","YE","YO",
    
    "IQ","OK"
]
 
  def initialize
    @trunk = WordBranch.new("")    
  end
  
  def add_word(word)
    @trunk.add_word([], word.chars.to_a)
  end
  
  def is_word?(word)
    return true if word.length == 2
    
    found = false
    get_all_matching(word) do |word|
      found = true
      true
    end
    
    found
  end
  
  def get_all_matching(pattern, rnd = nil, &block)    
    list = []
    get_all_matching_sub(rnd, pattern.chars.to_a, @trunk, list, block)
    list
  end
  
  def self.init(min_difficulty = 1)
    tree = WordTree.new
    Word.where("min_difficulty <= #{min_difficulty}").each do |w|
      tree.add_word(w.word)
    end
    TWO_LETTER_WORDS.each do |w|
      tree.add_word(w)
    end
    tree
  end
      
  private
  
  def get_all_matching_sub(rnd, chars, trunk, list, block)
    if chars.length == 0
      if trunk.is_word        
        if block
          ret = block.call(trunk.prefix)
          return true if ret == true
        else
          list << trunk.prefix
        end
      end
      return false
    end
    
    ch = chars[0]    
    if ch == '?'            
      trunk.each_branch(rnd) do |b|
        skip_out = get_all_matching_sub(rnd, chars[1..-1], b, list, block)
        return skip_out if skip_out
      end
    else
      b = trunk.get_branch(ch)
      skip_out = get_all_matching_sub(rnd, chars[1..-1], b, list, block) if b
      return skip_out if skip_out
    end
    
    false
  end 
 
end
