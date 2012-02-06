require 'date'
require 'rss/1.0'          
require 'rss/2.0'          
require 'open-uri'   
require 'iconv'

class StockController < ApplicationController
  protect_from_forgery :except=>'comment_add'

  def autocomplete
    if params[:q]
      @str = Autocomplete.suggest(params[:q])
      respond_to do |format|
        format.html {
          render :text => @str
        }
      end
    end
  end
  
  #Ajax读取 股票信息
  def stock_view
    #if request.get?
    unless params[:code].blank?
      #查找股票信息
      name="",s="",start_price=""
      i=1;
      #befor 9:30  return last day's stock_data
      stime=Time.now
      if(Time.now<Time.parse("9:30") or Time.now.wday==6 or Time.now.wday==0)
        stime=last_day(Time.now)
      end
      
      begin
        path=File.dirname(__FILE__) + "/../../tmp/stock_data/"+stime.year.to_s+"/"+stime.month.to_s+"/"+stime.day.to_s+"/"
        if File.readable?(path+params[:code].to_s+".txt")
          f = File.open(path+params[:code].to_s+".txt","r").each { |line|
            #解析股票数据
            #  `id`  `code`  `name`  `order_status`  `internal_code`  `stock_type`  `trade_money`  `trade_amount`  `current_price`  `last_price`  `start_price`
            list=line.split('/')
            unless list.blank?
              s+= list[8].to_s+","+i.to_s+";"
              name=list[2]       
              start_price=list[9]
              i+=1
            end
          }
          unless f.blank?
            unless f.closed?
              f.close
            end
          end
        end
      rescue
        unless f.blank?
          unless f.closed?
            f.close
          end
        end
      end
      #Stock Name
      s+= "-"+name.to_s
      #Stock Start Price
      s=start_price+",0;"+s
      render :text=>s
    end
  end
  
  def stock_view_all
    #if request.get?
    unless params[:code].blank?
      #查找股票信息
      name="",s="",start_price="",vt_value=""
      i=1;
      #befor 9:30  return last day's stock_data
      stime=Time.now
      if(Time.now<Time.parse("9:31") or Time.now.wday==6 or Time.now.wday==0)
        stime=last_day(Time.now)
      end
      
      begin
        #path=File.dirname(__FILE__) + "/../../tmp/stock_data/"+stime.year.to_s+"/"+stime.month.to_s+"/"+stime.day.to_s+"/"
        path=File.dirname(__FILE__) + "/../../tmp/stock_data/2010/1/27/"
        if File.readable?(path+params[:code].to_s+".txt")
          f = File.open(path+params[:code].to_s+".txt","r").each { |line|
            #解析股票数据
            #  `id`  `code`  `name`  `order_status`  `internal_code`  `stock_type`  `trade_money`  `trade_amount`  `current_price`  `last_price`  `start_price`
            list=line.split('/')
            unless list.blank?
              s+= list[8].to_s+","+i.to_s+","+list[7].to_s+";"
              name=list[2]       
              start_price=list[9]
              vt_value=list[3]
              i+=1
            end
          }
          unless f.blank?
            unless f.closed?
              f.close
            end
          end
        end
      rescue
        unless f.blank?
          unless f.closed?
            f.close
          end
        end
      end
      #Stock Name
      s+= "-"+name.to_s+"-"+vt_value
      #Stock Start Price
      s=start_price+",0;"+s
      render :text=>s
    end
  end
  
  #股票雷达
  def stock_radar
    #if request.get?
    #查找股票信息
    s=""
    #befor 9:30  return last day's stock_data
    stime=Time.now
    if(Time.now<Time.parse("9:31") or Time.now.wday==6 or Time.now.wday==0)
      stime=last_day(Time.now)
    end
      
    begin
      #path=File.dirname(__FILE__) + "/../../tmp/stock_data_radar/"+stime.year.to_s+"/"+stime.month.to_s+"/"+stime.day.to_s+"/"
      path=File.dirname(__FILE__) + "/../../tmp/stock_data_radar/2010/1/27/"
      if File.readable?(path+"all.txt")
        f = File.open(path+"all.txt","r").each { |line|
          #解析股票数据
          list=line.split(',')
          #list=list.sort! { |a,b| a[4] > b[4] }   
          unless list.blank?
            # d=s.id.to_s+","+s.code.to_s+","+s.name+","+s.current_price.to_s+",0,"+snow
            s+= list[1].to_s+","+list[2].to_s+","+list[3].to_s+","+list[4].to_s+";"
          end
        }
        unless f.blank?
          unless f.closed?
            f.close
          end
        end
      end
    rescue
      unless f.blank?
        unless f.closed?
          f.close
        end
      end
      puts "An error occurred: ",$!
    end
    render :text=>s
  end
  
  def rss_loader
    unless params[:uri].blank?
      feed= params[:uri]       
      content = ""          
      open(feed) do |s|      
        content = s.read        
      end
      rss = RSS::Parser.parse(content, false)
      render :xml=>rss
    end
  end
  
  def financial_loader
    unless params[:code].blank?
      begin
        s=""
        path=File.dirname(__FILE__) + "/../../tmp/stock_data_info/"+ params[:code].to_s+".txt"
        if File.readable?(path)
          f = File.open(path,"r").each { |line|
            #解析股票数据
            s+=line.gsub("?&gt;","")
            s=s.gsub("?","")
          }
          unless f.blank?
            unless f.closed?
              f.close
            end
          end
        end
      rescue
        unless f.blank?
          unless f.closed?
            f.close
          end
        end
        puts "An error occurred: ",$!
      end
    end
    #render :text=>s
    render :text=>conv("UTF-8//IGNORE", "GB2312//IGNORE", s)
  end
  
  #stock day info
  def stock_day
    unless params[:code].blank?
      begin
        iii=0
        s=""
        sss=[]
        path=File.dirname(__FILE__) + "/../../tmp/stock_day_list/"+ params[:code].to_s+".txt"
        if File.readable?(path)
          f = File.open(path,"r").each { |line|
            sss.push line
            iii+=1
            s+=line
          }
          unless f.blank?
            unless f.closed?
              f.close
            end
          end
        end
      rescue
        unless f.blank?
          unless f.closed?
            f.close
          end
        end
        puts "An error occurred: ",$!
      end
    end
    istart=iii-30
    iend=iii
    #render :text=>s
    render :text=>s #sss[istart..iend]
  end
  
  #ping ping
  def comment_add
    #if request.post?
    unless params[:name].blank?
      path=File.dirname(__FILE__) + "/../../tmp/stock_comment/"+ params[:code].to_s+".txt"
      f = File.open(path,"a")
      f.puts "<div align='left' style='width:100%'>大名:"+ params[:name]+"    评论时间："+Time.now.year.to_s+"-"+Time.now.month.to_s+"-"+Time.now.day.to_s+":"+Time.now.hour.to_s+":"+Time.now.min.to_s+"</div><div align='left' style='width:100%'>内容:"+ params[:content]+"</div><div id='aaa'></div>"
      unless f.blank?
        unless f.closed?
          f.close
        end
      end
      render :text=>'true'
    else
      render :text=>'false'
    end
  end
  
  #end
  #read read
  def comment_read
    unless params[:code].blank?
      s=""
      i=0
      tr=[]
      path=File.dirname(__FILE__) + "/../../tmp/stock_comment/"+ params[:code].to_s+".txt"
      if File.readable?(path)
        f = File.open(path,"r").each { |line|
          tr.push line
        }
        tr=tr.reverse
        for a in tr
          if i<100
            s+=a
            i+=1
          else
            break
          end
        end
        unless f.blank?
          unless f.closed?
            f.close
          end
        end
      end
      #s=conv("GB2312//IGNORE", "UTF-8//IGNORE", s)
      render :text=>s
    end
  end
  
  private
  #字符编码转换
  def conv(to, from, src)
    begin
      icnv = Iconv.new(to, from)
      icnv.iconv(src)
    rescue
      src
    end
  end
  
end
