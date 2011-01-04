class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  attr_accessor :login # to allow username or email
  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :username, :login
  
  has_many :levels
  
  validates_uniqueness_of :username, :on => :create, :message => "must be unique"
  
  protected
  
  def self.find_for_authentication(conditions)
    value = conditions[authentication_keys.first].downcase
    where(["username = :value OR email = :value", { :value => value }]).first
  end
  
  def username=(str)
    write_attribute(:username, str.downcase)
  end
  
  def email=(str)
    write_attribute(:email, str.downcase)
  end
end
