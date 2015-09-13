class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  attr_accessor :login # to allow username or email
  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :username, :login

  has_many :levels, :dependent => :destroy
  has_many :statistics, :dependent => :destroy

  validate :username_content
  validates_uniqueness_of :username, :on => :create, :message => "must be unique"

  def normalize_level_positions
    self.levels.each_with_index { |level, idx| level.update_attributes({:position => idx + 1})}
  end

  def username=(str)
    write_attribute(:username, str.downcase)
  end

  def email=(str)
    write_attribute(:email, str.downcase)
  end

  protected

  def self.find_for_authentication(conditions)
    value = conditions[authentication_keys.first].downcase
    where(["username = :value OR email = :value", { :value => value }]).first
  end


  private

  def username_content
    errors.add(:username, "can only contain letters, numbers, and spaces") if not self.username =~ /^[^\W_](([^\W_]| )*[^\W_])?$/
  end

end
