class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_filter :check_uri

  def check_uri
    redirect_to request.protocol + 'raptjs.com' + request.request_uri, :status => 301 if request.host =~ /^raptjs.heroku.com/
  end

  protect_from_forgery

  def index
  end

  def manifest
    send_file "#{Rails.root}/config/manifest.#{params[:format]}", :type => "application/x-web-app-manifest+json"
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) << :username << :email
  end
end
