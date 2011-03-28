class Statistic < ActiveRecord::Base
  belongs_to :level
  belongs_to :user
  
  validates_presence_of :user
  validates_presence_of :level

  attr_accessible :complete, :got_all_cogs
end
