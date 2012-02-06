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

 //Initial Data
 $(document).ready(function() { 
 	max_P=null;
	min_P=null;
	code=Request["code"];
	if(code==null)
	{
		code="600000";
	}
	$.get("http://chao.tl50.com:3001/stock/stock_view?code="+code, function(data){
		  initial_chart(parse_data(data));
		});
	 //one minute load 1 times
	 setInterval("timer_load()",60000);	 
 });
 ///定时读取
 function timer_load()
 {
	if(CheckTime())
	{
		max_P=null;
		min_P=null;
		$.get("http://chao.tl50.com:3001/stock/stock_view?code="+code, function(data){
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
	var ttt=data.split('-');
	var d1 = ttt[0].split(';');
	var d2;
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
			 }
			}
			else
			{
				last_P=parseFloat(d2[0]);
			}

			r.push([d2[1],d2[0]]);
		}
	  }
	  current_P=r[r.length-1][1];
	} 
	$("#max_price").html(max_P+"元");
	$("#min_price").html(min_P+"元");
	$("#current_price").html(current_P+"元");
	$("#sname").html(ttt[1]);
	return r;
 }

//Draw Data 
function draw_chart(data)
{
	var mid=(max_P+min_P)/2;
	var e=Math.abs(1-max_P/last_P);
	var t=Math.abs(1-min_P/last_P);
	var n=0;
	if(e>t)
	{
		n=e;
	}
	else
	{
	    n=t;
	}
	plot.setData([data]);
	plot.get_y().min=last_P*(1-n-0.005);
	plot.get_y().max=last_P*(1+n+0.005);
	plot.setupGrid();
	plot.draw();
}
 
//initial Chart
function initial_chart(data)
{
	var mid=(max_P+min_P)/2;
	var e=Math.abs(1-max_P/last_P);
	var t=Math.abs(1-min_P/last_P);
	var yspan
	var n=0;
	if(e>t)
	{
		n=e;
		yspan=Math.abs(last_P-max_P)
	}
	else
	{
	    n=t;
		yspan=Math.abs(last_P-min_P)
	}
	yspan=yspan*0.3;
	/* initial Chart */
	plot=$.plot($("#placeholder"), [data], { 
		//grid: { clickable: true },
	  	xaxis: {
            	min: 0,
	            max: 241,
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
	  yaxis:{min: (last_P*(1-n-0.005)),max:(last_P*(1+n+0.005)),tickSize:(yspan),tickFormatter: function (val, axis) { return (parseFloat(val)+"").substring(0, 4);}}
		 });//end Plot initial
	 /* bind event */	 
    /* $("#placeholder").bind("plotclick", function (e, pos) {
        // the values are in pos.x and pos.y
        $("#result").text('(' + pos.x.toFixed(2) +  ', ' + pos.y.toFixed(2) + ')');
   	 });*/
};
//End initial Funcion
function load_data()
{
	var scode=$("#scode").val();
	if(scode.length>0)
	{
		code=scode;
		max_P=null;
		min_P=null;
		$.get("http://chao.tl50.com:3001/stock/stock_view?code="+code, function(data){
			  initial_chart(parse_data(data));
		});
	}
}