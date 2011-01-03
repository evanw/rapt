class UsersController < ApplicationController
  
  respond_to :html, :json
  
  def show
    @user = User.find_by_username(params[:username])
    respond_with(@user)
  end
  
  def levels
    @levels = User.find_by_username(params[:username]).levels
    respond_with(@levels, :methods => [:html_title] )
  end
    
  
end
