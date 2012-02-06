require File.dirname(__FILE__) + '/../config/environment.rb'
puts "Starting Day Stock Maintance......"

#每天 3点5分执行 一次 unbuntu crontab
#Time To Doing
n=Time.now
#tem=nil
#sun and sat. not have stock data
if n.wday==6 or n.wday==0
  puts "saving connection ing!"
end
#追加记录
f=nil
sd=nil
begin
  sd=UserDetail.find(:all)
rescue 
  puts "An error occurred: ",$!
end

unless sd.blank?
  #读取一只股票，显示一只股票
  for s in sd
    begin
      #文件名： 股票名称，加时间
      @h=HistoryRank.new(:user_id=>s.user_id,:trading_date=>Time.now,:daily_final_rank=>s.select_rank)
      @h.save
    rescue
      puts "An error occurred: ",$!
      next
    end # end begin
  end #end for
end #end unless
puts "save end!"
  