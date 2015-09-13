source 'http://rubygems.org'

gem 'rails', '4.2'
gem 'devise'
gem 'jquery-rails'
gem 'bcrypt'
gem 'protected_attributes'
# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

group :production do
	gem 'pg'
end

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug'

# Bundle the extra gems:
# gem 'bj'
# gem 'nokogiri'
# gem 'sqlite3-ruby', :require => 'sqlite3'
# gem 'aws-s3', :require => 'aws/s3'

# Bundle gems for the local environment. Make sure to
# put test-only gems in this group so their generators
# and rake tasks are available in development mode:
# group :development, :test do
#   gem 'webrat'
# end
#
group :production do
  gem 'rails_12factor'
end

group :development do
	gem 'sqlite3'
	gem 'nifty-generators'
end

ruby "2.0.0"
