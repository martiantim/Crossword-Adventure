class Clue < ActiveRecord::Base
  belongs_to :puzzle
  belongs_to :wordclue
  
  attr_accessible :number, :x, :y, :direction, :length, :turns
    
  scope :across, :conditions => "clues.direction = 'A'"
  scope :down, :conditions => "clues.direction = 'D'"
  scope :crazy, :conditions => "clues.direction = 'Z'"
  scope :in_order, :order => "number asc"
  
  def to_s
    "#{number}#{direction}. #{clue ? clue.clue : ''} (#{clue ? clue.word.word : ''})"
  end

  def wc
    Wordclue.find(self.wordclue_id)
  end
  
  def position
    @pos ||= Position.new(self.x, self.y)
  end
  
  def js_hash
    {
      :number => number,
      :x => x,
      :y => y,
      :length => length,
      :direction => direction,
      :clue => self.wc.clue,
      :turns => self.turns
    }    
  end
  
  def [](i)
    word[i]
  end
  
  def word
    @word ||= wordclue.word.word
  end
  
  def dir_sym
    if self.direction == 'A'
      :RIGHT
    elsif self.direction == 'D'
      :DOWN
    end
  end
end
