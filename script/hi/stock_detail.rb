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
  #10 - 1
  if n.month.to_i==10 
    if n.day.to_i==1 or n.day.to_i==2 or n.day.to_i==3 or n.day.to_i==4 or  n.day.to_i==5
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
  end
   #5 - 1
  if n.month.to_i==5
    if n.day.to_i==1 or n.day.to_i==2 or n.day.to_i==3
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
  end
  
  #moring
  up_start=Time.parse("9:31")
  up_end=Time.parse("11:32")
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
      #读取一只股票，显示一只股票
      for s in sd
        begin
          #文件名： 股票名称，加时间
          plus_count=0
          path=File.dirname(__FILE__) + "/../tmp/stock_data/"+Time.now.year.to_s+"/"+Time.now.month.to_s+"/"+Time.now.day.to_s+"/"
          FileUtils.mkdir_p(path) unless File.directory?(path)
          f = File.open(path+s.code.to_s+".txt","a+").each { |line|
            plus_count += 1
          }
          f.flock(File::LOCK_EX)
          total_count= plus_count
          #update values 
          if(Time.now.hour.to_i==10 and Time.now.min.to_i==1)
            plus_count=30-plus_count
          elsif (Time.now.hour.to_i==10 and Time.now.min.to_i==31)
            plus_count=60-plus_count
          elsif (Time.now.hour.to_i==11 and Time.now.min.to_i==1)
            plus_count=90-plus_count
          elsif (Time.now.hour.to_i==11 and Time.now.min.to_i==31)
            plus_count=120-plus_count
          elsif (Time.now.hour.to_i==13 and Time.now.min.to_i==31)
            plus_count=150-plus_count  
          elsif (Time.now.hour.to_i==14 and Time.now.min.to_i==1)
            plus_count=180-plus_count  
          elsif (Time.now.hour.to_i==14 and Time.now.min.to_i==31)
            plus_count=210-plus_count  
          elsif (Time.now.hour.to_i==15 and Time.now.min.to_i==1)
            plus_count=240-plus_count  
          else
            plus_count=1
          end
          puts "update data count:"+plus_count.to_s
          if plus_count<=0
            plus_count=1
          end
          if total_count<400
            plus_count.times do
              #  `id`  `code`  `name`  `order_status`  `internal_code`  `stock_type`  `trade_money`  `trade_amount`  `current_price`  `last_price`  `start_price`
              d=s.id.to_s+"/"+s.code.to_s+"/"+s.name+"/"+s.order_status.to_s+"/"+s.internal_code.to_s+"/"+s.stock_type.to_s+"/"+s.trade_money.to_s+"/"+s.trade_amount.to_s+"/"+s.current_price.to_s+"/"+s.last_price.to_s+"/"+s.start_price.to_s+"/"+snow
              #Write to File
              f.puts d
              puts "loading data:"+d
            end
          end
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
      end #end for
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
  