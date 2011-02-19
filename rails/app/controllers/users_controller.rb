class UsersController < ApplicationController
  before_filter :authenticate_user!, :except => [:show, :edit_level]
  respond_to :html, :json
  
  def index
        # TODO
        render :text => "Nothing to see here yet."
  end

  def show
    begin
        @user = User.find_by_username(params[:username])
        
        # we don't want to cache because otherwise creating a new level, editing that level, and going
        # back won't show the newly created level (because the old page will be pulled from the cache)
        response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
        
        respond_with(@user, {:only => :username, :include => {:levels => {:methods => [:html_title], :only => [:title, :difficulty]}}})
    rescue
        redirect_to "/", :flash => {:error => "Couldn't find user '#{params[:username]}'"}
        return
    end
  end
  
  def levels
    @levels = User.find_by_username(params[:username]).levels
    respond_with(@levels, :exclude => [:data], :methods => [:html_title] )
  end
  
  # show the editor
  def edit_level
    begin
      @user = User.find_by_username(params[:username])
    rescue
      redirect_to "/", :flash => {:error => "Couldn't find user '#{params[:username]}'"}
      return
    end
    
    begin
      @level = @user.levels.select { |l| l.html_title == params[:levelname]}.first
    rescue
      redirect_to "/", :flash => {:error => "Couldn't find level '#{params[:levelname]}' in #{params[:username]}'s levels"}
      return
    end
    
    respond_with @level do |format|
      format.json { render :json => @level, :methods => [:html_title] }
      format.html do
        if @level.nil?
          redirect_to "/", :flash => {:error => "Couldn't find level '#{params[:levelname]}' in #{params[:username]}'s levels"}
        elsif current_user.present? and @level.user == current_user
          render :layout => false
        elsif current_user.present?
          redirect_to "/edit/#{current_user.username}/", :flash => {:error => "You can only edit levels you created"}
        else
          redirect_to root_url, :flash => {:error => "You must be logged in to edit levels"}
        end
     end
    end
  end
  
  # update the level
  def update_level
    @level = current_user.levels.select { |l| l.html_title == params[:levelname]}.first
    @level.update_attributes(params[:level])
    render :text => ''
  end
  
end
