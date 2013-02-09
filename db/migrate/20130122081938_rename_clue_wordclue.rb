class RenameClueWordclue < ActiveRecord::Migration
  def up
    rename_column :clues, :clue_id, :wordclue_id
  end

  def down
    rename_column :clues, :wordclue_id, :clue_id
  end
end
