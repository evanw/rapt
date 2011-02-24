class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  end
  
  def manifest
    send_file "#{Rails.root}/config/manifest.#{params[:format]}", :type => "application/x-web-app-manifest+json"
  end
end
