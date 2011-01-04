class Level < ActiveRecord::Base
  belongs_to :user
  
  validate :title_content
  
  def html_title
    self.title.gsub(' ', '_')
  end
  
  private
  
  def title_content
    errors.add_to_base("Level titles must be unique") if self.user.levels.map{ |l| l.title }.include? self.title
    errors.add_to_base("Title can only contain letters, numbers, and spaces") if self.title =~ /[^\w ]|_/
  end

end
