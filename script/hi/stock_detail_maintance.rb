require File.dirname(__FILE__) + '/../config/environment.rb'
puts "Starting Stock Maintance......"

while true do
  #60秒
  sleep 60
  #Time To Doing
  n=Time.now
  tem=nil
  #sun and sat. not have stock data
  if n.wday==6 or n.wday==0
    begin
      #睡吧，睡吧，没活干
      tem=StockDetail.find(:first,:conditions=>["id=1"])
      puts "saving connection ing!"
      next
    rescue
      puts "An error occurred: ",$!
      next
    end
  end
  #moring
  up_start=Time.parse("9:31")
  up_end=Time.parse("12:32")
  #after noon
  donw_start=Time.parse("13:01")
  donw_end=Time.parse("15:03")
  #puts donw_start.year.to_s+"-"+donw_start.month.to_s+"-"+donw_start.day.to_s+" "+donw_start.hour.to_s+":"+donw_start.min.to_s+":"+donw_start.sec.to_s
  #Check Time to doing
  if (n>=up_start and n<=up_end) or (n>=donw_start and n<=donw_end)
    snow=Time.now.year.to_s+"-"+Time.now.month.to_s+"-"+Time.now.day.to_s+" "+Time.now.hour.to_s+":"+Time.now.min.to_s+":"+Time.now.sec.to_s
    #追加记录
    f=nil
    sd=nil
    begin
      sd=StockDetail.find(:all,:conditions=>["current_price>0"])
    rescue 
      puts "An error occurred: ",$!
      next
    end
    puts "after select in doing......"
    unless sd.blank?
      begin
        #读取一只股票，显示一只股票
        path=File.dirname(__FILE__) + "/../tmp/stock_data_radar/"+Time.now.year.to_s+"/"+Time.now.month.to_s+"/"+Time.now.day.to_s+"/"
        FileUtils.mkdir_p(path) unless File.directory?(path)
        f= File.open(path+"all.txt", File::WRONLY|File::TRUNC|File::CREAT)
        f.flock(File::LOCK_EX)
        for s in sd
          d=s.id.to_s+","+s.code.to_s+","+s.name+","+s.current_price.to_s+","+s.last_price.to_s+","+snow
          #Write to File
          f.puts d
          puts d
        end #end for
        unless f.blank?
          f.flock(File::LOCK_UN)
          unless f.closed?
            f.close
          end
        end
      rescue
        unless f.blank?
          f.flock(File::LOCK_UN)
          unless f.closed?
            f.close
          end
        end
        puts "file error!"
      end # end begin
    end #end unless
  else
    begin
      #睡吧，睡吧，没活干
      tem=StockDetail.find(:first,:conditions=>["id=1"])
      puts "saving connection ing!"
      next
    rescue
      puts "An error occurred: ",$!
      next
    end
  end#end if
end
  