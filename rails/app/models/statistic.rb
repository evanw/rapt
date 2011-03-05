class Statistic < ActiveRecord::Base
  belongs_to :level
  belongs_to :user

  attr_accessible :complete, :got_all_cogs

  def levelname
    self.level.html_title
  end
end
