class Guess < ActiveRecord::Base
  
  attr_accessor :correct
  attr_accessible :x, :y, :letter, :correct
  
  def to_json(options={})
    options = {:methods => [:correct], 
               :except => [:puzzle_id, :timestamp]
             }.merge(options)
    super(options)
  end
  
  def self.from_s(str)
    p = str.split(",")
    Guess.new(:x => p[0], :y => p[1], :letter => p[2])
  end
  
  def js_hash
    {
      :x => x,
      :y => y,
      :letter => letter,
      :correct => correct
    }
  end

end