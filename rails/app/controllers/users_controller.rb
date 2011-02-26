class UsersController < ApplicationController
  before_filter :authenticate_user!, :except => [:menu_data, :level_data]
  respond_to :html, :json

  # show the editor
  def edit_level
    begin
      @level = current_user.levels.select { |l| l.html_title == params[:levelname]}.first
    rescue
      redirect_to "/", :flash => {:error => "Couldn't find level '#{params[:levelname]}' in #{current_user}'s levels"}
      return
    end
    
    if @level.nil?
      redirect_to "/", :flash => {:error => "Couldn't find level '#{params[:levelname]}' in #{current_user}'s levels"}
    else
      render :layout => false
    end
  end

  def menu_data
    # we don't want to cache because otherwise creating a new level, editing that level, and going
    # back won't show the newly created level (because the old page will be pulled from the cache)
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
    
    @user = User.find_by_username(params[:username])
    respond_with(@user, {:only => :username, :include => {:levels => {:methods => [:html_title], :only => [:title, :difficulty]}}})
  end

  def level_data
    @user = User.find_by_username(params[:username])
    @level = @user.levels.select { |l| l.html_title == params[:levelname]}.first
    render :json => @level, :methods => [:html_title]
  end

  # update the level
  def update_level
    @level = current_user.levels.select { |l| l.html_title == params[:levelname]}.first
    respond_with @level do |format|
      format.json do
        if @level.update_attributes(params[:level])
          render :json => @level, :methods => [:html_title]
        else
          render :json => @level.errors, :status => :unprocessable_entity
        end
      end
    end
  end
  
end
