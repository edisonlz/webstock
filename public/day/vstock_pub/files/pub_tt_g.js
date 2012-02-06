var url=location.search;var Request=new Object();if(url.indexOf("?")!=-1){var str=url.substr(1);strs=str.split("&");for(var i=0;i<strs.length;i++){Request[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1])}}var plot;var max_P=null,min_P=null,current_P;var last_P=null;var startDate;var code;var up_down_per;var amount_plot;var vt_list;var aomount_list;var amount_max;var radar_holder;var is_init_timeline=false;var is_init_amount=false;var is_init_radar=false;var all_value;var autoComplete_s=[];var arc_draw;var istime=true;var timeline_code=0;var hr_html="<div id='aaa'></div>";$(document).ready(function(){max_P=null;min_P=null;code=Request["code"];if(code==null){code="600000"}$.get("http://localhost:3001/stock/stock_view_all?code="+code,function(data){initial_chart(parse_data(data))});setInterval("timer_load()",60000);setTimeout("stock_info_lets_go()",1500);start_auto_completes();load_financial_info();register_ajax_comments()});function stock_info_lets_go(){stock_letsgo("http://rss.cnfol.com/1325.xml",$("#day_view_info"))}function timer_load(){if(CheckTime()){max_P=null;min_P=null;$.get("http://localhost:3001/stock/stock_view_all?code="+code,function(data){draw_chart(parse_data(data))})}}function CheckTime(){startDate=new Date();var up_start_time=new Date();up_start_time.setHours(9);up_start_time.setMinutes(32);var up_end_time=new Date();up_end_time.setHours(11);up_end_time.setMinutes(35);var down_start_time=new Date();down_start_time.setHours(13);down_start_time.setMinutes(1);var down_end_time=new Date();down_end_time.setHours(15);down_end_time.setMinutes(5);if((startDate>=up_start_time&&startDate<=up_end_time)||(startDate>=down_start_time&&startDate<=down_end_time)){return true}else{return false}}function parse_data(data){if(data.length<=5||data==null){alert("用户您好,暂无数据!");return}var r=[];var a=[];var last_d2=0;var ttt=data.split('-');var d1=ttt[0].split(';');var d2;amount_max=0;for(var i=0;i<d1.length;i++){d2=d1[i].split(',');if(d2!=null){if(d2[1]!=null){if(i>0){if(max_P==null){max_P=min_P=parseFloat(d2[0])}else{if(parseFloat(max_P)<parseFloat(d2[0])){max_P=parseFloat(d2[0])}if(parseFloat(min_P)>parseFloat(d2[0])){min_P=parseFloat(d2[0])}if(parseFloat(amount_max)<parseFloat(d2[2]-last_d2)){amount_max=parseFloat(d2[2]-last_d2)}}}else{last_P=parseFloat(d2[0])}var t_value=(d2[2]-last_d2);if(parseInt(t_value)<0){t_value=0}a.push([d2[1],t_value]);r.push([d2[1],d2[0],t_value]);if(parseInt(d2[2])>0){last_d2=d2[2]}}}current_P=r[r.length-1][1]}up_down_per=current_P/last_P;up_down_per=up_down_per-1;up_down_per=up_down_per*100;$("#max_price").html(max_P+"元");$("#min_price").html(min_P+"元");$("#current_price").html(current_P+"元");$("#sname").html(ttt[1]);if(up_down_per<0){$("#up_down").html("<font style='color:#009933'>"+(up_down_per+"").substring(0,4)+"%</font>")}else{$("#up_down").html("<font style='color:#ff0000'>"+(up_down_per+"").substring(0,4)+"%</font>")}$("#y_price").html(last_P+"元");aomount_list=a;var trend_s=0;var k_5=0,k_10=0;for(var k=1;k<=parseInt(a.length*0.2);k++){k_10+=a[a.length-k][1];if(k<=parseInt(a.length*0.1)){k_5+=a[a.length-k][1]}}var trend_s=k_5/k_10*10;draw_trends(trend_s);draw_amount();vt_list=ttt[2].split('\t');calc_vt();return r}
 
///计算委托比例
function calc_vt()
{
	var price;
	var up_price=1,down_price=1;
	var len=vt_list.length;
	$("#vt_up_list").html("");
	$("#vt_down_list").html("");
    for (var i=1;i<len;i+=2) {    
		var txt;
        price = vt_list[i-1];
		txt="<b style='font-size:12px'>"+vt_list[i-1]+"("+parseInt(vt_list[i] / 100)+")</b>&nbsp;&nbsp;";
        if (i < 10) {
			up_price+=parseFloat(vt_list[i]);
            $("#vt_up_list").append(txt);
		}
        else {
			down_price+=parseFloat(vt_list[i]);
            $("#vt_down_list").append(txt);
        }
    }
	var tt=parseFloat(up_price/parseFloat(up_price+down_price));
	draw_arc(tt);
}
var v_u_d;
var down_v;
var up_v;
///Draw arc wei tuo
function draw_arc(tt)
{
	if(arc_draw==null)
	{
		arc_draw=new Arc_draw();
		arc_draw.draw($("#arc_holder"),tt);
	}
	else
	{
		arc_draw.setdata(tt);
	}
	up_v=parseInt(Math.ceil(tt*10));
	down_v=10-up_v;
	v_u_d="<font color='#ff0000'>"+up_v+":</font><font color='#00CC66'>"+down_v+"</font>";
	$("#vt_value").html(v_u_d);
}
 
//Draw Data 
function draw_chart(data)
{
	var mid=(max_P+min_P)/2;
	var e=Math.abs(1-max_P/last_P);
	var t=Math.abs(1-min_P/last_P);
	var yspan
	var n=0;
	if(e>t)
	{
		n=e;
		yspan=Math.abs(last_P-max_P);
	}
	else
	{
	    n=t;
		yspan=Math.abs(last_P-min_P);
	}
	yspan=yspan*0.3;
	plot.setData([data]);
	plot.get_y().min=last_P*(1-n-0.005);
	plot.get_y().max=last_P*(1+n+0.005);
	plot.get_y().tickSize=yspan;
	plot.setupGrid();
	plot.draw();
}
 
//initial Chart
function initial_chart(data)
{
	if(!is_init_timeline)
	{
	var mid=(max_P+min_P)/2;
	var e=Math.abs(1-max_P/last_P);
	var t=Math.abs(1-min_P/last_P);
	var yspan
	var n=0;
	if(e>t)
	{
		n=e;
		yspan=Math.abs(last_P-max_P);
	}
	else
	{
	    n=t;
		yspan=Math.abs(last_P-min_P);
	}
	yspan=yspan*0.3;
	/* initial Chart */
	plot=$.plot($("#placeholder"), [data], { 
		grid: { clickable: true },
	  	xaxis: {
            	min: 0,
	            max: 240,
				tickSize:30,
				tickFormatter: function (val, axis) {
						var timeNames = [" 9:30 "," 10:00 ", " 10:30 ", " 11:00 "," 11:30 "," 13:30 ", " 14:00 ", " 14:30 ", " 15:00 "];
					    switch(val)
						{
							case 0:return timeNames[0];
							case 30:return timeNames[1];
							case 60:return timeNames[2];
							case 90:return timeNames[3];
							case 120:return timeNames[4];
							case 150:return timeNames[5];
							case 180:return timeNames[6];
							case 210:return timeNames[7];
							case 240:return timeNames[8];
							default :return "";
						}
					  }
        	},
	  yaxis:{min: (last_P*(1-n-0.005)),max:(last_P*(1+n+0.005)),tickSize:(yspan),tickFormatter: function (val, axis) { return (parseFloat(val)+"").substring(0, 5);}}
		 });//end Plot initial
	
	/* bind event */	 
     $("#placeholder").bind("plotclick", function (e, pos) {
        // the values are in pos.x and pos.y
        $("#result").text('(' + pos.y + ')');
   	 });
	 is_init_timeline=true;
	}
	else
	{
		draw_chart(data);
	}
	timeline_code=code;
}
//initial Chart
function draw_amount()
{
	if(!is_init_amount)
	{
	amount_plot=$.plot($("#amount_holder"), [aomount_list], {
			xaxis: {
            	min: 0,
	            max: 240,
				tickSize:30,
				tickFormatter: function (val, axis) {
						var timeNames = [" 9:30 "," 10:00 ", " 10:30 ", " 11:00 "," 11:30 "," 13:30 ", " 14:00 ", " 14:30 ", " 15:00 "];
					    switch(val)
						{
							case 0:return timeNames[0];
							case 30:return timeNames[1];
							case 60:return timeNames[2];
							case 90:return timeNames[3];
							case 120:return timeNames[4];
							case 150:return timeNames[5];
							case 180:return timeNames[6];
							case 210:return timeNames[7];
							case 240:return timeNames[8];
							default :return "";
						}
					  }
        	},
		 yaxis:{min: 0,max:amount_max,tickFormatter: function (val, axis) { return (parseFloat(val)+"").substring(0, 4);}},
		 lines: {
		    show: true,
		    lineWidth: 1,
		    fill: true,
		    fillColor: "#e67976"
		 }
		 
		 } );
		is_init_amount=true;
	}
	else
	{
		amount_plot.setData([aomount_list]);
	    amount_plot.get_y().max=amount_max;
	    amount_plot.setupGrid();
	    amount_plot.draw();
	}
}

//End initial Funcion
function load_data(icode)
{
	var scode="0";
	if(icode!=null)
	{
		scode=icode;
	}
	else
	{
		scode=$("#stock_id").val();
	}
	if(scode!=null)
	{
		code=scode;
		if(istime)
		{
			if(timeline_code!=code)
			{
				max_P=null;
				min_P=null;
				$.get("http://localhost:3001/stock/stock_view_all?code="+code, function(data){
			  	initial_chart(parse_data(data));
				});
				load_financial_info();
			}
		}
		else
		{
			stock_load_day();
		}
	}
	register_ajax_comments();
}

///move
var x1;
function handlerMM(e)
{
    if(!document.all){//适用firefox
        x1=event.pageX;
    }else{//适用ie
        x1=document.documentElement.scrollLeft+event.clientX;
    }
	if(x1>0)
	{
		$("#c_price").css({left:(x1-40)+"px"}); 
	}
}

///Total Load
/*
function t_load(icode)
{
	load_data(icode);
}*/

function validateStockCode(obj)
{
    if (/\D/.test(obj.value)) {
        obj.value = obj.value.replace(/\D/g, '');
    }
   if (/\d{6}/g.test(obj.value)) {
	   if(istime)
		{
        	load_data(obj.value);
		}
		else
		{
			code=obj.value;
			stock_load_day();
			register_ajax_comments();
		}
		load_financial_info();
    }
}

///-----------radar-------------
function start_auto_completes()
{
	if(autoComplete_s.length<=0)
	{
		$.get("http://localhost:3001/stock/stock_radar", function(data){
			 if(data.length<=0)
			 {	return;	}
			 var t=[];
			 var radar_list=data.split(';');
	    	 for(i=0;i<radar_list.length;i++)
		 	 {
				t=radar_list[i].split(',');
				autoComplete_s.push(t[0]+"-"+t[1]);
			 };
			 $("#stock_id").autocomplete(autoComplete_s, {
			  minChars: 0,
			  autoFill: false,
			  scroll: false,
			  matchSubset:1,
			  matchContains:1,
			  cacheLength:100,
			  max: 12,
			  formatResult: function(data, value) {
			 	return (data+"").split("-")[0];
		      }
			});//autocomplete
		});//get
	}
	else
	{
		 $("#stock_id").autocomplete(autoComplete_s);
	}
	
}
function start_radar()
{
	$.get("http://localhost:3001/stock/stock_radar", function(data){
			  draw_radar(parse_radar_data(data,20));
		});
	if(!$.browser.msie)
	{
		setTimeout("clear_select()",500);
	}
	//setTimeout("start_radar()",120000);
}
/// -------- radar--------------
function  DescSort(x, y) 
{
   return  x[0]/x[1]  ==  y[0]/y[1]  ?   0  : (x[0]/x[1]  >  y[0]/y[1]  ?   - 1  :  1 );
} 

var cache_t2=[];
function parse_radar_data(data,ilen)
{
	var i=0;
	var t=[];
	var te=[];
	var t2=[];
	if(data.length<=0)
	{
		alert("sorry no data!");
		return;
	}	
	var radar_list=data.split(';');
	for(i=0;i<radar_list.length;i++)
	{
		t=radar_list[i].split(',');
		t2.push([t[2],t[3],t[1],t[0]]);
	}
	t2.sort(DescSort);	
	for(i=0;i<ilen;i++)
	{
		te[i]=t2[i];
		te[i][1]=te[i][0]/te[i][1];
	}
	cache_t2=t2;
	return te;
}

function select_count(i_count)
{
	is_init_radar=false;
	draw_radar(load_parse(i_count));
}

function load_parse(ilength)
{
	var i=0;
	var te=[];
	for(i=0;i<ilength;i++)
	{
		te[i]=cache_t2[i];
	}
	return te;
}

function clear_select()
{
	if(radar_holder!=null)
	{
		is_init_radar=false;
		draw_radar(top_data);
	}
}
var top_data;
var is_bind_select_event=false;
//initial Chart
function draw_radar(data)
{
	top_data=data;
	if(!is_init_radar)
	{
		$("#radarholder").height("200px");
		var options = {
    	    selection: { mode: "x" },
			points: {
		    show: true,
		    fill: true,
		    fillColor: "#e67976"
		 }
    	};
		radar_holder=$.plot($("#radarholder"), [top_data], options);
		 if(!is_bind_select_event)
		 {
		 $("#radarholder").bind("selected", function (event, area) {
            radar_holder = $.plot($("#radarholder"), [top_data],
                          $.extend(true, {}, options, {
                              xaxis: { min: area.x1, max: area.x2 }
                          }));
    	})
		 is_bind_select_event=true;
		 }
		
		is_init_radar=true;
		document.getElementById("content_radar").style.visibility="visible";
	}
	
}
var itrend=null;
function draw_trends(data)
{
	if(itrend==null)
	{
		itrend=new trend_stock();
		itrend.draw($("#trend_holder"),data);
	}
	else
	{
		itrend.setdata(data);
	}
}

//*----------start canvas draw----------*///
function trend_stock()
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
	///set data not re draw
	this.setdata=function(idata)
	{
	   data=parseInt(idata+0.5);
	   ctx.save();
       ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	   if(data<=5)
	   {
	     ctx.fillStyle =  'rgb(102,204,0)';
		  ctx.fillRect(2,0,145,def_w);
	     for (i=0;i<10-data;i++)
	     {
    		ctx.fillStyle = 'rgba(255,255,255,'+(i+1)/10+')';
    		for (j=0;j<2;j++)
			{
      			ctx.fillRect(i*14+1,j*def_w+1,14,17.5)
			}
         }
	   	ctx.save();
	   	ctx.fillStyle = 'rgb(255,0,0)';
  	   	ctx.fillRect(2,def_w,145,def_w);
	   	for (i=0;i<(data);i++)
	   	{
    		ctx.fillStyle = 'rgba(255,255,255,'+(i+1)/10+')';
    		for (j=0;j<2;j++)
			{
      			ctx.fillRect(i*14+1,j*def_w+1,14,17.5)
			}
       	}
	   ctx.save();
	   }
	   else
	   {
		  ctx.fillStyle = 'rgb(255,0,0)';
  	      ctx.fillRect(2,0,145,def_w);
	  	   for (i=0;i<data;i++)
	  	   {
    			ctx.fillStyle = 'rgba(255,255,255,'+(i+1)/10+')';
    			for (j=0;j<2;j++)
				{
      				ctx.fillRect(i*14+1,j*def_w+1,14,17.5)
				}
       		}
		   ctx.save();
		   ctx.fillStyle = 'rgb(102,204,0)';
  	   	   ctx.fillRect(2,def_w,145,def_w);
		   for (i=0;i<(10-data);i++)
		   {
    		ctx.fillStyle = 'rgba(255,255,255,'+(i+1)/10+')';
    		for (j=0;j<2;j++)
			{
      			ctx.fillRect(i*14+1,j*def_w+1,14,17.5)
			}
       	   }
	   	   ctx.save();
	   }
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
        target.css("position", "relative"); // for positioning labels and overlay
        if (canvasWidth <= 0 || canvasHeight <= 0)
                throw "Invalid dimensions for plot, width = " + canvasWidth + ", height = " + canvasHeight;
            // the canvas
        canvas = $('<canvas width="' + canvasWidth + '" height="' + canvasHeight + '"></canvas>').appendTo(target).get(0);
        if ($.browser.msie) // excanvas hack
                canvas = window.G_vmlCanvasManager.initElement(canvas);
        ctx = canvas.getContext("2d");
	}
}
//*---------- canvas draw end----------*///

//*-----------canvas draw start----------*///
var all_value=null;
var up_heart=0,down_heart=0;
var is_heart_show=false;

function start_heart()
{
		$.get("http://localhost:3001/stock/stock_radar", function(data){
			  draw_heart(parse_heart_data(data));
		});
}

function draw_heart(data)
{
	 if(all_value==null)
	 {
		all_value=new All_Value_stock();
		all_value.draw($("#all_value_holder"),data);
		is_heart_show=true;
	 }
	 else
	 {
		all_value.setdata(data);
	 }
}

function parse_heart_data(data)
{
	var i=0;
	var t=[];
	var t2=[];
	if(data.length<=0)
	{
		alert("sorry no data!");
		return;
	}	
	up_heart=0;
	down_heart=0;
	var radar_list=data.split(';');
	for(i=0;i<radar_list.length;i++)
	{
		t=radar_list[i].split(',');
		t2.push([t[2],t[3],t[1],t[0]]);
		if((t[2]/t[3])>1)
		{
			up_heart++;
		}
		else
		{
			down_heart++;
		}
	}
	return up_heart/radar_list.length;
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



///Arc percetage
function Arc_draw()
{
	var canvasWidth=0;
	var canvasHeight=0;
	var canvas;
	var ctx;
	var target=null;
	var data;
	var startAngle,endAngle;
	///Initial Draw
	this.draw=function(iobject,idata)
	{
		target=iobject;
		data=idata;
		initial_arc();
		this.setdata(idata);
	}
	///Set Data
	this.setdata=function(idata)
	{
		data=idata;
		var x=45,y=45,radius=30;
		startAngle=0;
		endAngle=(data)*Math.PI*2;
       	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.beginPath(); 
		ctx.moveTo(x,y);
  		ctx.fillStyle="rgb(255,0,0)";
		ctx.arc(x,y,radius,startAngle,endAngle, false);
		ctx.fill();
		ctx.save();
		ctx.fillStyle="rgb(0,0,255)";
		startAngle=endAngle;
		endAngle=1*Math.PI*2;
		ctx.beginPath(); 
		ctx.moveTo(x,y);
		ctx.arc(x,y,radius,startAngle,endAngle, false);
		ctx.fill();
		ctx.save();
	}
	/* draw stock trend */
	function initial_arc()
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
};
//*-----------canvas draw end----------*///


//*------------stock info---------------*//
var base_uri="http://localhost:3001/stock/rss_loader?uri=";
function stock_letsgo(i_url,i_target)
{
	var color=[];
	color[0]="#ececec";
	color[1]="#234390";
	var c="";
	var ii=0;
	$.ajax({
                 type: "GET",
                 url: base_uri+i_url,
                 dataType: "xml",
                 success: function(xml) {
                     $(xml).find('channel item').each(function(){
                        if(ii<8)
						{
						 var id_text = $(this).find('title').text();
                         var name_text = $(this).find('description').text();
						 var links = $(this).find('link').text();
						 c= ii%2==0?color[0]:color[1];
						 
						 var t='<div style="padding-top:1px;">'+
								 '<a href="'+links+'" target="_blank">'+
								 '<font style="font-size:14px; color:#000000;">'+id_text.substring(0,18)+'</font><br/>'+
								 '</a>'+hr_html+
							 '</div>';
						$(i_target).append(t);
						}
						else
						{
							return;
						}
						ii++;
                     }); //close each(
                 }
             }); //close $.ajax(
}

 function change_back(iobject,ischange)
 {
  if(ischange)
  {
     $(iobject).css("background-color","#CC9999"); 
   }
   else
   {
	  $(iobject).css("background-color","#ececec"); 
   }
 }
 var t_data=[];
 var i_index=0;
 function stock_t_view(i_url)
{
	var color=[];
	color[0]="#ececec";
	color[1]="#234390";
	var c="";
	var ii=0;
	$.ajax({
                 type: "GET",
                 url: base_uri+i_url,
                 dataType: "xml",
                 success: function(xml) {
                     $(xml).find('channel item').each(function(){
						 var id_text = $(this).find('title').text();
                         var name_text = $(this).find('description').text();
						 var links = $(this).find('link').text();
						 c= ii%2==0?color[0]:color[1];
						 
						 var t='<div onmouseover="change_back(this,true);" onmouseout="change_back(this,false);" style="padding-top:10px;">'+
								 '<a href="'+links+'" target="_blank">'+
								 '<font style="font-size:13px; color:#0066CC; font-weight:bold;">'+id_text+':</font>'+
								 '<font style="font-size:12px; color:#0066CC">'+name_text.substring(0,40).replace("&nbsp;","")+'...</font>'+
								 '</a>'+
							 '</div>';
						t_data.push(t);
                     }); //close each(
					 timeToDo();
                 }
             }); //close $.ajax(
}
///
function timeToDo()
{
	if(i_index==t_data.length)
	{
		i_index=0;
	}
	$("#t_view").html(t_data[i_index]);
	i_index++;
	setTimeout("timeToDo()",5000);
}

///
function load_financial_info()
{
	$.get("http://localhost:3001/stock/financial_loader?code="+code, function(data){
		  parse_financial_info(data);
		});
}
var htm_en=[];
function parse_financial_info(idata)
{
  var gd=idata.split('<g_lz>');
  if(gd.length>=5)
  {
	//events,summary,management,newstabsgroup_initial,related,keyratios
	htm_en=gd[1].split("/");
	var t_html="";
	var g=0;
	var len=htm_en.length;
	//alert("len:"+len);
	for(g=0;g<len;g+=2)
	{
		if(htm_en[g+1]!=null)
			t_html+="<div style='width:100%'>"+htm_en[g]+"-"+htm_en[g+1]+"</div>"+hr_html;
	}
	
	$("#event").html(t_html);
	t_html=gd[2];
	$("#summary").html(t_html);
	t_html=hr_html+gd[3];
	$("#managements").html(t_html);
	t_html="<div><font style='font-size:14px;font-weight:bold;'>技术指标</font></div>";
	htm_en=gd[6].split('/');
	if(htm_en.length>0)
	{
		t_html+="<div style='width:100%'>指标,"+htm_en[1]+","+htm_en[2]+","+htm_en[3]+"</div>";
		for(g=4;g<htm_en.length;g+=4)
		{
			if(htm_en[g+3]!=null)
				t_html+=hr_html+"<div style='width:100%'>"+htm_en[g]+","+htm_en[g+1]+","+htm_en[g+2]+","+htm_en[g+3]+"</div>";
		}
	}
	$("#keyratios").html(t_html+hr_html);
  }
}

var ttcode_show=0;
///*---------stock day info--------*///
function stock_load_day()
{
	if(ttcode_show!=code)
	{
		$.get("http://localhost:3001/stock/stock_day?code="+code, function(data){
		  initial_day_chart(parse_day_data(data));
		});
	}
}
var e_day=[];
var t_day=[];
var a_day=[];
var day_amount=[];
var day_max=0,day_min=1000000;
var day_tick_size=0;
var day_holder=null;
var day_holder_aomount=null;
var day_date_date=[];
var day_last;
///parse day data
function parse_day_data(idata)
{
	a_day=idata.split('_');	
	e_day=[];
	t_day=[];
	//a_day=[];
	day_max=0;
	day_min=1000000;
	day_tick_size=0;
	day_amount=[];
	for(var c=0;c<a_day.length;c++)
	{
		t_day=a_day[c].split('/');
		if(t_day.length>1)
		{
		e_day.push([c,t_day[2],t_day[3],t_day[4],t_day[5],t_day[6]]);
		day_amount.push([c,t_day[6]]);
		day_date_date[c]=[t_day[7]];
		if(t_day[2]>day_max)
		{
			day_max=t_day[2];
		}
		if(t_day[3]<day_min)
		{
			day_min=t_day[3];
		}
		day_last=t_day;
		}
	}
	day_tick_size=(day_max-day_min)*0.3;
	$("#day_name").html(day_last[1]);
	$("#day_max_price").html(day_last[2]);
	$("#day_min_price").html(day_last[3]);
	$("#open_price").html(day_last[4]);
	$("#close_price").html(day_last[5]);
	$("#day_iamount").html(day_last[6]);
	return e_day;
}
///initial day data
function initial_day_chart(day_data)
{
	if(day_holder==null)
	{
		var options = {
			grid: { zmoveable: true },
			candles:
			{
		    	show: true
			},
			xaxis:{
				tickFormatter: function (val, axis) {
					 	return (day_date_date[parseInt(val)]+"").substring(5,10);
					}
			},
			yaxis:{min:day_min,max:day_max,tickFormatter: function (val, axis) { return (parseFloat(val)+"").substring(0, 5);}}
    	};
		var h=[];
	     day_holder=$.plot($("#dayholder"), [day_data], options);
		 $("#dayholder").bind("moveclick", function (e, pos) {
				h=pos.y.split('-');
				$("#day_max_price").html(h[0]);
			    $("#day_min_price").html(h[1]);
				$("#open_price").html(h[2]);
				$("#close_price").html(h[3]);
				$("#day_iamount").html(h[4]);
   		 });
		day_holder.def_width=665;
		day_holder.def_height=180;
		 
		var options = {
			xaxis:{
				tickFormatter: function (val, axis) {return (day_date_date[parseInt(val)]+"").substring(5,10);}
			},
			yaxis:{tickFormatter: function (val, axis) { return (parseFloat(val)+"").substring(0, 5);}},
			lines: {
		    show: true,
		    lineWidth: 1,
		    fill: true,
		    fillColor: "#e67976"
		 	}
    	};
	    day_holder_aomount=$.plot($("#dayholder_aomount"), [day_amount], options);
		day_holder_aomount.def_width=665;
		day_holder_aomount.def_height=90;
		
	}
	else
	{
		//day holder
		day_holder.setData([day_data]);
		day_holder.get_y().min=day_min;
		day_holder.get_y().max=day_max;
		day_holder.get_y().tickSize=day_tick_size;
		day_holder.setupGrid();
		day_holder.draw();
		///amount
		day_holder_aomount.setData([day_amount]);
		day_holder_aomount.setupGrid();
		day_holder_aomount.draw();
	}
	ttcode_show=code;
}
var is_post=false;

//------------commments--------
function register_ajax_comments(){setTimeout("commemt_load_data()",3500)}function commemt_load_data(){$("#commentText").load(decodeURI('http://localhost:3001/stock/comment_read?code='+code))}function send_comment(){if(is_post){alert("您已经发表过文章了！");return}var url_c="http://localhost:3001/stock/comment_add?name="+encodeURI($("#name").val())+"&code="+(code)+"&content="+encodeURI($("#comment_content").val());$.post(url_c);register_ajax_comments();is_post=true;alert("评论成功！");return true}function validate(formData,jqForm,options){for(var i=0;i<formData.length;i++){if(!formData[i].value){alert('填写不完整!');return false}}return true}
