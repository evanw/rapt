class ApplicationController < ActionController::Base
  before_filter :check_uri

  def check_uri
    redirect_to request.protocol + 'raptjs.com' + request.request_uri if request.host =~ /^raptjs.heroku.com/
  end

  protect_from_forgery

  def index
  end
end
