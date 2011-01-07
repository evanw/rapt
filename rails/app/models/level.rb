class Level < ActiveRecord::Base
  default_scope :order => 'position ASC'
  
  belongs_to :user
  
  validate :title_content, :on => :create
  validates_presence_of :title, :on => :create, :message => "can't be blank"
  validates_uniqueness_of :title, :scope => :user_id
  
  attr_accessible :data, :position, :title
  
  before_create :determine_position
  
  def html_title
    self.title.gsub(' ', '_')
  end
  
  private
  
  def title_content
    errors.add(:base, "Title can only contain letters, numbers, and spaces") if self.title =~ /[^\w ]|_/
  end
  
  def determine_position
    self.position = self.user.levels.count + 1.0
  end

end
