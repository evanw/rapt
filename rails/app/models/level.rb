class Level < ActiveRecord::Base
  belongs_to :user
  
  validates_uniqueness_of :title, :message => "must be unique"
  validate :title_content
  
  def title_content
    errors.add_to_base("Title can only contain letters, numbers, and spaces") if self.title =~ /[^\w ]|_/
  end
  
  def html_title
    self.title.replace(' ', '_')
  end

end
