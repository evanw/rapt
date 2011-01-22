class Level < ActiveRecord::Base
  default_scope :order => 'position ASC'
  
  belongs_to :user
  
  validate :title_content, :on => :create
  validates_presence_of :title, :on => :create, :message => "can't be blank"
  validates_uniqueness_of :title, :scope => :user_id
  
  attr_accessible :data, :position, :title
  
  before_create :determine_position, :set_default_level
  
  def html_title
    self.title.gsub(' ', '_')
  end
  
  private
  
  def title_content
    errors.add(:base, "Title can only contain letters, numbers, and spaces") if self.title =~ /[^\w ]|_/
  end
  
  def determine_position
    begin
      self.position = self.user.levels.maximum(:position) + 1.0
    rescue
      self.position = 1.0
    end
  end
  
  def set_default_level
    unique_id = rand(2**31 - 1)
    if self.data.nil?
      self.data = sprintf("{\"cells\":[[0,1,1,0],[0,0,0,0]],\"width\":4,\"height\":2,\"entities\":[],\"unique_id\":%d,\"start\":[0,0],\"end\":[3,0]}", unique_id)
    end
  end

end
