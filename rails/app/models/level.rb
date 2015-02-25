class Level < ActiveRecord::Base
  default_scope -> { order('position ASC') }

  belongs_to :user
  has_many :statistics, :dependent => :destroy

  validate :title_content
  validates_presence_of :title, :on => :create, :message => "can't be blank"
  validates_uniqueness_of :title, :scope => :user_id

  attr_accessible :data, :position, :title, :difficulty

  before_create :determine_position, :set_default_level
  before_validation :clean_data

  def html_title
    self.title.gsub(' ', '_')
  end

  private

  def clean_data
    self.title.strip!
  end

  def title_content
    errors.add(:title, "can only contain letters, numbers, and spaces") if not self.title =~ /^[^\W_](([^\W_]| )*[^\W_])?$/
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
