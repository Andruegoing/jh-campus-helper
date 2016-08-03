chrome.extension.onMessage.addListener(
  	function(request, sender, sendResponse) {
  		if(request.action=="get_setting")
	  	{	
	  		sendResponse(
	  			get_options()
	  		);
	  	}
	}
);

if(get_option('grade_check') == 'on' && get_option('grade_check_time') != 0)
{
	setInterval(function() {
		var username = get_option('yc_account');
		var password = get_option('yc_password');
		var term = get_option('grade_term');
		if(username && password)
		{
			console.log(username);
			get_yc_grade(username, password, term, function(new_grade) {
				if(new_grade != get_option('old_grade'))
				{
					set_option('old_grade', new_grade);
					grade_notify();
				}
			});
		}
		
	}, 1000*60*get_option('grade_check_time'));
}


function get_yc_grade(username, password, term, callback) {
	//$("div[id='query_yc_grade'] button").siblings('.status').show();
	$.ajax({
		url: 'http://api.zjut.com/student/scores.php',
		async: true,
		dataType: 'json',
		type: 'GET',
		data: {username:username, password:password, term:term, ip:get_option("insider_net")},

		success: function(data, status){
			$("#grade_list").html("");
			if (!data['status']) {
				//alert("服务器错误，请尝试在常规设置中切换服务器");
			}
			else if(data['status'] == "error" && data['msg'] == "用户名或密码错误") {
				//alert("用户名或密码错误");
			}
			else if(data['status'] == "error") {
				//alert("用户名或者密码错误服务器错误，请尝试在常规设置中切换服务器");
			}
			else if(data['status'] == "success" && data['msg'] == "没有相关信息") {
				//$("#grade_list").html("没有相关信息");
				callback('没有相关信息');
			}
			else if (data['status'] == "success") {
				var grades = "";
				zcj = 0;
        		zxf = 0;
		        grades += '<table><tbody>';
		        grades += '<tr><td>'+'名称'+'</td><td>'+'学分'+'</td><td>'+'成绩'+'</td></tr>';
	            for(i = 0; i < data['msg'].length; i++) {
	            	var lists = new Array();
	            	lists['学期'] = data['msg'][i]['term'];
	            	lists['名称'] = data['msg'][i]['name'];
		            lists['考试性质'] = data['msg'][i]['classprop'];
		            lists['成绩'] = data['msg'][i]['classscore'];
		            lists['学时'] = data['msg'][i]['classhuor'];
		            lists['学分'] = data['msg'][i]['classcredit'];

		            var b = lists['成绩'];

		            if(isNaN(b)) {
		            	switch(b) {
		                    case "优秀":
		                        b=4.5;
		                        break;
		                    case "良好":
		                        b=3.5;
		                        break;
		                    case "中等":
		                        b=2.5;
		                        break;
		                    case "及格":
		                        b=1.5;
		                        break;
		                    default:
		                        b=0;
		                }
		            }
		            else {
		            	b=60<=b?(b-50)/10:0;
		            }
		            lists['学分'] *= 1;
		            zcj += b*lists['学分'];
            		zxf += lists['学分'];

		            grades += '<tr><td>'+lists['名称']+'</td><td>'+lists['学分']+'</td><td>'+lists['成绩']+'</td></tr>';
	            }
	            jd = (zcj/zxf).toFixed(3);
	            if(!isNaN(jd)) {
	            	grades += '<tr><td colspan="2">'+'本学期平均绩点为'+'</td><td>'+jd+'</td></tr>';
	            }
	            grades += '</tbody></table>';
	            callback(grades);
			}
			//$("div[id='query_yc_grade'] button").siblings('.status').hide();
		},

		error: function() {
			alert("服务器错误，请尝试在常规设置中切换服务器");return -3;
		},

	});
}