class Wordclue < ActiveRecord::Base
  belongs_to :word
  
  has_many :clues
  
  attr_accessible :word_id, :clue
  
  
  def self.add(word, clue)
    w = Word.find_by_word(word) || Word.add(word)
    
    Wordclue.new(:word_id => w.id, :clue => clue).save!
  end
end