var url=location.search; 
	var Request = new Object(); 
	if(url.indexOf("?")!=-1) { 
		var str = url.substr(1); 
		strs = str.split("&"); 
		for(var i=0;i<strs.length;i++) { 
			Request[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]); 
		  } 
	 } 
	 
 var plot;
 var max_P=null,min_P=null,current_P;
 var last_P=null;
 var startDate;
 var code;
 var up_down_per;
 var amount_plot;
 var jg_doc;
 var vt_list;
 var aomount_list;
 var amount_max;
 var radar_holder;
 var is_init_timeline=false;
 var is_init_amount=false;
 var is_init_radar=false;
 
 //Initial Data
 $(document).ready(function() { 
 	max_P=null;
	min_P=null;
	code=Request["code"];
	if(code==null)
	{
		code="600000";
	}
	$.get("/stock/stock_view_all?code="+code, function(data){
		  initial_chart(parse_data(data));
		});
     //$("#content").css('opacity', 0.85);
	 //one minute load 1 times
	 $("#stock_id").autocomplete("/stock/autocomplete_s",{width:100});
	 setInterval("timer_load()",60000);	 
 });
 ///定时读取
 function timer_load()
 {
	if(CheckTime())
	{
		max_P=null;
		min_P=null;
		$.get("/stock/stock_view_all?code="+code, function(data){
			  draw_chart(parse_data(data));
		});
	}
 }
 ///检查是否是在开盘时间
 function CheckTime()
 {
	startDate = new Date();
	//上午
	var up_start_time=new Date();
	up_start_time.setHours(9);
	up_start_time.setMinutes(32);
	var up_end_time=new Date();
	up_end_time.setHours(11);
	up_end_time.setMinutes(35);
	//下午
	var down_start_time=new Date();
	down_start_time.setHours(13);
	down_start_time.setMinutes(1);
	var down_end_time=new Date();
	down_end_time.setHours(15);
	down_end_time.setMinutes(5);
	
	if((startDate>=up_start_time && startDate<=up_end_time) || (startDate>=down_start_time && startDate<=down_end_time) )
	{
		return true;
	}
	else
	{
		return false;
	}
 }
 ///解析数据
 function parse_data(data)
 {
 	var r=[];
	var a=[];
	var last_d2=0;
	var ttt=data.split('-');
	var d1 = ttt[0].split(';');
	var d2;
	amount_max=0;
    for (var i = 0; i < d1.length; i++)
	{
	  d2=d1[i].split(',');
	  if(d2!=null)
	  {
		if(d2[1]!=null)
		{
			if(i>0)
			{
			 if(max_P==null)
			 {
				max_P=min_P=parseFloat(d2[0]);
			 }
			 else
			 {
				if(parseFloat(max_P)<parseFloat(d2[0]))
				{
					max_P=parseFloat(d2[0]);
				}
				if(parseFloat(min_P)>parseFloat(d2[0]))
				{
					min_P=parseFloat(d2[0]);
				}
				if(parseFloat(amount_max)<parseFloat(d2[2]-last_d2))
				{
					amount_max=parseFloat(d2[2]-last_d2);
				}
			 }
			}
			else
			{
				last_P=parseFloat(d2[0]);
			}
			
			var t_value=(d2[2]-last_d2);
			if(parseInt(t_value)<0)
			{
				t_value=0;
			}
			a.push([d2[1],t_value]);
			r.push([d2[1],d2[0]]);
			if(parseInt(d2[2])>0)
			{
				last_d2=d2[2];
			}
		}
	  }
	  current_P=r[r.length-1][1];
	} 
        up_down_per=current_P/last_P;
        up_down_per=up_down_per-1;
        up_down_per=up_down_per*100;
        //up_down_per=up_down_per/100;
	$("#max_price").html(max_P+"元");
	$("#min_price").html(min_P+"元");
	$("#current_price").html(current_P+"元");
	$("#sname").html(ttt[1]);
    $("#up_down").html((up_down_per+"").substring(0,4)+"%");
    $("#y_price").html(last_P+"元");
	///Draw Chart
	aomount_list=a;
	setTimeout("draw_amount()",2500);
	///Draw Chart
	vt_list=ttt[2].split('\t');
	calc_vt();
	//setTimeout("()",5000);
	
	return r;
 }
 
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
	jg_doc=new jsGraphics("arc_holder");
	DrawArc(tt);
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
function load_data()
{
	var scode=$("#stock_id").val();
	if(scode.length>0)
	{
		code=scode;
		max_P=null;
		min_P=null;
		$.get("/stock/stock_view_all?code="+code, function(data){
			  initial_chart(parse_data(data));
		});
	}
}



/*----------Draw-----------*/
function DrawArc(percentagePositive)
{
		var divided=360;
		var start=0;
		var end=percentagePositive*divided;
		
		jg_doc.setColor("#ff0000");
		jg_doc.fillArc(15,2,60,60,start,end);
		
		start=end;
		end=divided;
		jg_doc.setColor("#0033ff");
		jg_doc.fillArc(15,2,60,60,start,end);
		jg_doc.paint();
		var up_v=parseInt(Math.ceil(percentagePositive*10));
		var down_v=10-up_v;
		var v_u_d="<font color='#ff0000'>"+up_v+"</font>:<font color='#00CC66'>"+down_v+"</font>";
		$("#vt_value").html(v_u_d);
}

///move
var x1;
function handlerMM(e)
{
	x1 = (document.layers) ? e.pageX : document.body.scrollLeft+event.clientX;
	if(x1>0)
	{
		document.getElementById("c_price").style.posLeft=x1-40;
	}
}

///Total Load

function t_load(icode)
{
		code=icode;
		max_P=null;
		min_P=null;
		$.get("/stock/stock_view_all?code="+code, function(data){
			  initial_chart(parse_data(data));
		});
}

function validateStockCode(obj)
{
	if (/\D/.test(obj.value)) {
        obj.value = obj.value.replace(/\D/g, '');
    }
    if (/\d{6}/g.test(obj.value)) {
        t_load(obj.value);
    }
}

///-----------radar-------------

function start_radar()
{
	$.get("/stock/stock_radar", function(data){
			  draw_radar(parse_radar_data(data,20));
		});
	///2 minutes loade4
	is_init_radar=false;
	setTimeout("start_radar()",120000);
	setTimeout("clear_select()",500);
	
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
	else
	{
		if(document.getElementById("content_radar").style.visibility=="visible")
		{
			document.getElementById("content_radar").style.visibility="hidden";
		}
		else
		{
			document.getElementById("content_radar").style.visibility="visible";
		}
	}
}