class Word < ActiveRecord::Base
  has_many :wordclues
  
  before_save :calculate_difficulties
  
  def calculate_difficulties
    min = nil
    max = nil
    wordclues.each do |wc|
      next if !wc.difficulty
      
      if !min || wc.difficulty < min
        min = wc.difficulty
      end
      if !max || wc.difficulty > max
        max = wc.difficulty
      end
      
    end
    self.min_difficulty = min
    self.max_difficulty = max
  end
  
end