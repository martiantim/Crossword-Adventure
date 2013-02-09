class AddSupportForCrazyClues < ActiveRecord::Migration
  def up
    add_column :clues, :turns, :string
  end

  def down
    remove_column :clues, :turns
  end
end
