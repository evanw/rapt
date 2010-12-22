class CreateLevels < ActiveRecord::Migration
  def self.up
    create_table :levels do |t|
      t.string :title
      t.text :data
      t.integer :user_id

      t.timestamps
    end
  end

  def self.down
    drop_table :levels
  end
end
