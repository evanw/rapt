namespace :cron do
  desc "Normalize level positions"
  task(:normalize => :environment) { User.all.each {|u| u.normalize_level_positions } }
  
  desc "Run all cron jobs"
  task(:all => :environment) do
    puts "Running Level position normalization"
    Rake::Task["cron:normalize"]
  end
end

desc "Run all cron jobs - heroku requirement"
task (:cron) { Rake::Task["cron:all"].invoke }