class RegistrationsController < Devise::RegistrationsController
  prepend_view_path 'app/views/devise'

  def create
    super
    
    if request.cookies.has_key? 'rapt'
      stats = JSON.parse(request.cookies['rapt'])
      stats.each do |s|
        user = User.find_by_username(s['username'])
        level = user.levels.select { |l| l.html_title == s['levelname'] }.first

        stat = Statistic.new
        stat.user = resource
        stat.level = level
        stat.update_attributes({
          :complete => s['complete'],
          :got_all_cogs => s['gotAllCogs']
        })
      end
    end
  end
end
