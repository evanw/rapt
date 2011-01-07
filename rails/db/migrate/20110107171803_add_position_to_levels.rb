class AddPositionToLevels < ActiveRecord::Migration
  def self.up
    add_column :levels, :position, :double, :default => 0
  end

  def self.down
    remove_column :levels, :position
  end
end
