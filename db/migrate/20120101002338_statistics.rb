class Statistics < ActiveRecord::Migration
  def self.up
    add_column :statistics, :complete, :boolean, :default => false
    add_column :statistics, :got_all_cogs, :boolean, :default => false
  end

  def self.down
    remove_column :statistics, :complete
    remove_column :statistics, :got_all_cogs
  end
end
