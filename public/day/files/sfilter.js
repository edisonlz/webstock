
$(document).ready(function() {  
	$.get("http://localhost:3001/stock/stock_radar", function(data){
			  load_stock_list(parse_data(data));
		});							
 });

var cache_t2=[];
var sort_data=[];
var mid=0;
var max_price=0;
var min_price=10000;
var min_up=10000;
var max_up=-10;
var min_amount;
var max_amount;
var up_heart=0;
var down_heart=0;

function parse_data(data)
{
	var i=0;
	var t=[];
	var te=[];
	var t2=[];
	if(data.length<=0)
	{
		alert("sorry no data!");
		return;
	};
	var radar_list=data.split(';');
	for(i=0;i<radar_list.length;i++)
	{
		t=radar_list[i].split(',');
		if(t.length>0 && parseFloat(t[3])>0)
			t2.push([t[2],t[3],t[1],t[0]]);
		if(parseFloat(max_price)<parseFloat(t[2]))
			max_price=t[2];
		if(parseFloat(min_price)>parseFloat(t[2]))
			min_price=t[2];
		if((t[2]/t[3])>1)
		{
			up_heart++;
		}
		else
		{
			down_heart++;
		}
	}
	$("#max_price").val(max_price+0.5);
	$("#min_price").val(min_price);
	
	t2.sort(DescSort);
	for(i=0;i<t2.length;i++)
	{
		te[i]=t2[i];
		if(te[i][1]>0)
			te[i][1]=((te[i][0]-te[i][1])/te[i][1]*100);
		else
			te[i][1]=-10;
		if(parseFloat(max_up)<parseFloat(te[i][1]))
			max_up=te[i][1];
		if(parseFloat(min_up)>parseFloat(te[i][1]))
			min_up=te[i][1];
	}
	$("#min_up").val(((min_up)+"").substring(0,5));
	$("#max_up").val(((max_up+0.5)+"").substring(0,5));
	sort_data=cache_t2=te;
	///Draw heart;
	draw_heart(up_heart/cache_t2.length);
	return te;
}

function  DescSort(x, y) 
{
   return   x[0]/x[1]  ==  y[0]/y[1]  ?   0  : (x[0]/x[1]  >  y[0]/y[1]  ?   - 1  :  1 );
}

var html_stock="";
var page_index=0;
var page_count=15;
var pages=0;
//Paginage
function load_stock_list(data)
{
	if(data==null)
	{
		data=sort_data;
	}
	if(page_count>data.length)
	{
		page_count=data.length;
	}
	html_stock="<table style='width:500px;'><tr><td><b>股票名称</b></td><td><b>股票代码</b></td><td><b>价格</b></td><td><b>涨跌幅</b></td></tr><tr><td colspan='4'><div id='aaa'></div></td></tr>";
	for(i=(page_count*page_index);i<page_count*(page_index+1);i++)
	{
		if(data[i][0]==null)
			continue;
		
		html_stock+="<tr><td>"+data[i][2]+"</td><td><a href='day.htm?code="+data[i][3]+"' target='_blank'>"+data[i][3]+"</a></td><td>"+data[i][0]+"</td><td>"+(data[i][1]+"").substring(0,5)+"%</td></tr><tr><td colspan='4'><div id='aaa'></div></td></tr>";
	}
	html_stock+="</table>";
	$("#stock_resule").html(html_stock);
	pages=data.length/page_count;
}
///page event
function next_stock_page()
{
	page_index+=1;
	if(page_index>pages)
	{
		page_index=pages;
		return;
	}
	load_stock_list();
}
function last_stock_page()
{
	page_index-=1;
	if(page_index<0)
	{
		page_index=0;
		return;
	}
	load_stock_list();
}

function filter_stock()
{
	max_price=$("#max_price").val();
	min_price=$("#min_price").val();
	min_up=$("#min_up").val();
	max_up=$("#max_up").val();
	//alert(cache_t2[1][2]);
	var idata=[];
	for(i=0;i<cache_t2.length;i++)
	{
		if(parseFloat(cache_t2[i][0])<=parseFloat(max_price) && parseFloat(cache_t2[i][0])>=parseFloat(min_price))
		{
			if(parseFloat(cache_t2[i][1])<=parseFloat(max_up) && parseFloat(cache_t2[i][1])>=parseFloat(min_up))
			{				
				idata.push(cache_t2[i]);
			}
		}
	}
	sort_data=idata;
	page_index=0;
	load_stock_list(idata);
}
function clear_stock()
{
	sort_data=cache_t2;
	page_index=0;
	load_stock_list();
}
//draw heart
var is_heart_show=false;
var all_value=null;
function draw_heart(data)
{
	 if(all_value==null)
	 {
		all_value=new All_Value_stock();
		all_value.draw($("#heart_div"),data);
		is_heart_show=true;
	 }
	 else
	 {
		all_value.setdata(data);
	 }
}
function All_Value_stock()
{
	var canvasWidth=0;
	var canvasHeight=0;
	var canvas;
	var ctx;
	var target=null;
	var data;
	var def_w=20;
	///Initial Draw
	this.draw=function(iobject,idata)
	{
		target=iobject;
		data=parseInt(idata+0.5);
		initial_trend();
		this.setdata(idata);
	}
	///Set Data
	this.setdata=function(idata)
	{
		data=0.6;
		ctx.save();
       	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.beginPath();
		ctx.fillStyle = 'rgb(102,204,0)';
		ctx.moveTo(75*data,40*data);
		ctx.bezierCurveTo(75*data,37*data,70*data,25*data,50*data,25*data);
		ctx.bezierCurveTo(20*data,25*data,20*data,62.5*data,20*data,62.5*data);
		ctx.bezierCurveTo(20*data,80*data,40*data,102*data,75*data,120*data);
		ctx.bezierCurveTo(110*data,102*data,130*data,80*data,130*data,62.5*data);
		ctx.bezierCurveTo(130*data,62.5*data,130*data,25*data,100*data,25*data);
		ctx.bezierCurveTo(85*data,25*data,75*data,37*data,75*data,40*data);
		ctx.fill();
		ctx.save();
		ctx.beginPath();
		var tdata=data;
		tdata=tdata*idata;
		ctx.fillStyle = 'rgb(255,0,0)';
		ctx.moveTo(75*data,40*data);
		x=75*data-75*tdata;
		y=40*data-40*tdata;
		ctx.bezierCurveTo(75*tdata+x,37*tdata+y,70*tdata+x,25*tdata+y,50*tdata+x,25*tdata+y);
		ctx.bezierCurveTo(20*tdata+x,25*tdata+y,20*tdata+x,62.5*tdata+y,20*tdata+x,62.5*tdata+y);
		ctx.bezierCurveTo(20*tdata+x,80*tdata+y,40*tdata+x,102*tdata+y,75*tdata+x,120*tdata+y);
		ctx.bezierCurveTo(110*tdata+x,102*tdata+y,130*tdata+x,80*tdata+y,130*tdata+x,62.5*tdata+y);
		ctx.bezierCurveTo(130*tdata+x,62.5*tdata+y,130*tdata+x,25*tdata+y,100*tdata+x,25*tdata+y);
		ctx.bezierCurveTo(85*tdata+x,25*tdata+y,75*tdata+x,37*tdata+y,75*tdata+x,40*tdata+y);
		ctx.fill();
		ctx.save();
	}
	/* draw stock trend */
	function initial_trend()
	{
		if(target==null)
		{
			return;
		}
		canvasWidth = target.width();
        canvasHeight = target.height();
        target.html(""); // clear target
        ///target.css("position", "relative"); // for positioning labels and overlay
        if (canvasWidth <= 0 || canvasHeight <= 0)
                throw "Invalid dimensions for plot, width = " + canvasWidth + ", height = " + canvasHeight;
            // the canvas
        canvas = $('<canvas width="' + canvasWidth + '" height="' + canvasHeight + '"></canvas>').appendTo(target).get(0);
        if ($.browser.msie) // excanvas hack
                canvas = window.G_vmlCanvasManager.initElement(canvas);
        ctx = canvas.getContext("2d");
	}
}