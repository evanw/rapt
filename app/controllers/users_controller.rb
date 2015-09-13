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
    @level = @user.levels.detect { |l| l.html_title == params[:levelname]}
    render :json => @level, :methods => [:html_title]
  end

  def get_stats
    render :json => current_user.statistics.map { |s| {
      :username => s.level.user.username,
      :levelname => s.level.html_title,
      :complete => s.complete,
      :gotAllCogs => s.got_all_cogs
    }}
  end

  def set_stats
    user = User.find_by_username(params[:username])
    level = user.levels.detect { |l| l.html_title == params[:levelname] }
    stat = current_user.statistics.detect { |s| s.level == level }
    if stat.nil?
      stat = current_user.statistics.create
      stat.level = level
    end
    stat.update_attributes({
      :complete => params[:complete],
      :got_all_cogs => params[:gotAllCogs]
    })
    render :nothing => true
  end

  # update the level
  def update_level
    @level = current_user.levels.detect { |l| l.html_title == params[:levelname]}
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
