# These helper methods can be called in your template to set variables to be used in the layout
# This module should be included in all views globally,
# to do so you may need to add this line to your ApplicationController
#   helper :layout
module LayoutHelper
  def title(page_title, show_title = true)
    content_for(:title) { h(page_title.to_s) }
    @show_title = show_title
  end

  def show_title?
    @show_title
  end

  def stylesheet(*args)
    content_for(:head) { stylesheet_link_tag(*args) }
  end

  def javascript(*args)
    content_for(:head) { javascript_include_tag(*args) }
  end
  
  def edit_links_for_level(level)
    if current_user.present? and level.user == current_user
      "<span class='links'><a href='/users/#{current_user.username}/#{level.html_title}'>Edit</a> <a href='/levels/#{level.id}' data-confirm='Are you sure?' data-method='delete' rel='nofollow'>Delete</a></span>"
    else
      ""
    end
  end
end
