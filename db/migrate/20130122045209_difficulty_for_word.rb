class DifficultyForWord < ActiveRecord::Migration
  def up
    add_column :words, :min_difficulty, :integer
    add_column :words, :max_difficulty, :integer
    
    puts "Total #{Word.count}"
    Word.includes(:wordclues).find_each do |w|
      puts "#{w.id}" if (w.id % 1000) == 1
      w.calculate_difficulties
      w.save!
    end
  end

  def down
    remove_column :words, :min_difficulty
    remove_column :words, :max_difficulty
  end
end
