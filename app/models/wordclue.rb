class Wordclue < ActiveRecord::Base
  belongs_to :word
  
  has_many :clues
end