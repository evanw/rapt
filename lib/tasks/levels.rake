namespace :levels do
  
  desc 'rake "levels:make_official[username,levelname]"'
  task :make_official, [:username, :level] => :environment do |t, args|
    official = User.find_by_username('rapt')
    user = User.find_by_username(args.username)
    level = official.levels.create(user.levels.find_by_title(args.level).attributes)
  end
end
