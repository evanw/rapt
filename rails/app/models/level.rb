class Level < ActiveRecord::Base
  belongs_to :user
  
  validate :title_content, :on => :create
  validates_uniqueness_of :title, :scope => :user_id
  
  attr_accessible :data
  
  def html_title
    self.title.gsub(' ', '_')
  end
  
  private
  
  def title_content
    errors.add(:base, "Title can only contain letters, numbers, and spaces") if self.title =~ /[^\w ]|_/
  end

end
