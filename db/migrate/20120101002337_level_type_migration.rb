class LevelTypeMigration < ActiveRecord::Migration
  def self.up
    add_column :levels, :difficulty, :integer, :default => 0
  end

  def self.down
    remove_column :levels, :difficulty
  end
end
