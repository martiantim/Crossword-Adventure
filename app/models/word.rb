class Word < ActiveRecord::Base
  has_many :wordclues
  
  before_save :calculate_difficulties
  
  attr_accessible :word
  
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
  
  def find_easy_clue
    wordclues.min { |a,b| (a.difficulty || 0) <=> (b.difficulty || 0) }
  end
  
  def self.add(str)
    w = Word.new(:word => str)
    w.save!
    w
  end
  
end