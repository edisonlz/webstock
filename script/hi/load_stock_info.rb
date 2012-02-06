require File.dirname(__FILE__) + '/../config/environment.rb'
require 'iconv'

f = File.new(ARGV[0])

converter = Iconv.new("UTF-8", "GBK")

f.each_line { |line|
  segs = line.split(',')
  item = StockDetail.find_by_internal_code(segs[2])
  if item
    item.code = segs[0]
    item.name = converter.iconv(segs[1])
    item.save
  else
    item = StockDetail.new
    item.internal_code = segs[2]
    item.code = segs[0]
    item.name = converter.iconv(segs[1])
    item.save
  end
  print line
}