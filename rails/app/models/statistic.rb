class Statistic < ActiveRecord::Base
  belongs_to :level
  belongs_to :user

  attr_accessible :complete, :got_all_cogs
end
