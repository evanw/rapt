# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)

test_user = User.create({:username => "test", :email => "test@example.com", :password => "test123", :password_confirmation => "test123"}) unless User.first

test_user = User.first
unless test_user.levels.count > 1
  level = test_user.levels.create({:title => "Test Level 1"})
end