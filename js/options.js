$(document).ready(function(){   
    $('#my-tab li a[href="'+get_option("page")+'"]').tab('show');

    $("#yc_account").attr("value",get_option("yc_account"));
	$("#yc_password").attr("value",get_option("yc_password"));

	if(get_option("yc_account") != "") {
		$('.top-nav a').html('<i class="fa fa-user"></i> '+get_option("yc_account"));
	}

    for(var key in defaultOptions) {
        set_primary($('div[id="'+key+'"]').find('button[option="'+get_option(key)+'"]'));
    }
    

    $("#version").html("v" + chrome.app.getDetails().version);

    load_term(document.getElementById("grade_term"));
    load_term(document.getElementById("class_term"));

    $("#grade_term").val(get_option("grade_term"));
    $("#class_term").val(get_option("class_term"));

    $("#class_list").html(get_option("class_table"));
})

$('#my-tab a').click(function (e) {
    set_option("page", $(this)[0].hash);
    e.preventDefault();
    $(this).tab('show');
})

$("select").change(function (e) {
    set_option($(this).attr("id"), $(this).val());
})

$('.top-nav a').click(function (e) {
    $('#my-tab li a[href="#account"]').tab('show');
})

$('.navbar-brand').click(function (e) {
    $('#my-tab li a[href="#index"]').tab('show');
})

$("div[class='col-lg-12'] button").click(function() {
    if ($(this).hasClass("btn-primary") || !$(this).attr("option")) return false;

    if($(this).parent().attr("id") == "save_class_table" && $(this).attr("option") == "off") {
    	$("#class_list").html("");
    }

    set_default($(this).siblings('button'));
    set_primary($(this));

    set_option($(this).parent().attr("id"), $(this).attr("option"))
});

$("div[id='yc_bindng'] button").click(function() {
    check_binding($("#yc_account").val(), $("#yc_password").val());
});

$("div[id='query_yc_grade'] button").click(function() {
	if(get_option("yc_account") == "" || get_option("yc_password") == "" ) {
		alert("请先绑定账号！");
		$('#my-tab li a[href="#account"]').tab('show');
	}
	else {
		get_yc_grade(get_option("yc_account"), get_option("yc_password"), get_option("grade_term"));
	}
    
});

$("div[id='query_yc_class'] button").click(function() {
	if(get_option("yc_account") == "" || get_option("yc_password") == "" ) {
		alert("请先绑定账号！");
		$('#my-tab li a[href="#account"]').tab('show');
	}
	else {
    	get_yc_class(get_option("yc_account"), get_option("yc_password"), get_option("class_term"));
    	$(this).siblings('.status').hide();
	}
});

function load_term(obj) {
	for(var i = 2011; i < myDate.getFullYear()+1; i++)
	{
		if((i == lastYear) && (month > 0 && month < 7))
		{
			obj.options.add(new Option("＝当前学期＝","＝当前学期＝"));
			obj.options[(i-2011)*2+1].disabled="true";
		}
		obj.options.add(new Option(i+"/"+(i+1)+"(1)",i+"/"+(i+1)+"(1)"));
		if((i==lastYear)&&(month>6&&month<13))
		{
			obj.options.add(new Option("＝当前学期＝","＝当前学期＝"));
			obj.options[(i-2011)*2+2].disabled="true";
		}
		obj.options.add(new Option(i+"/"+(i+1)+"(2)",i+"/"+(i+1)+"(2)"));
	}
}


function get_yc_grade(username, password, term) {
	$("div[id='query_yc_grade'] button").siblings('.status').show();
	$.ajax({
		//url: 'http://api.zjut.com/student/scores.php',
		url: 'http://bbs.zjut.edu.cn/api/jhapi.php?url=http://api.zjut.com/student/scores.php',
		async: true,
		dataType: 'json',
		type: 'GET',
		data: {username:username, password:password, term:term, ip:get_option("insider_net")},

		success: function(data, status){
			$("#grade_list").html("");
			if (!data['status']) {
				alert("服务器错误，请尝试在常规设置中切换服务器");
			}
			else if(data['status'] == "error" && data['msg'] == "用户名或密码错误") {
				alert("用户名或密码错误");
			}
			else if(data['status'] == "error") {
				//alert("用户名或者密码错误服务器错误，请尝试在常规设置中切换服务器");
				if(get_option("insider_net") != '86') {
					set_option("insider_net", parseInt(get_option("insider_net"))+1);
					get_yc_grade(username, password, term);
				}
				else {
					alert("用户名或者密码错误服务器错误，请尝试在常规设置中切换服务器");
				}
			}
			else if(data['status'] == "success" && data['msg'] == "没有相关信息") {
				$("#grade_list").html("没有相关信息");
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
		        $("#grade_list").html(grades);
			}
			$("div[id='query_yc_grade'] button").siblings('.status').hide();
		},

		error: function() {
			alert("服务器错误，请尝试在常规设置中切换服务器");
		},

	});
}

function get_yc_class(username, password, term) {
	$("div[id='query_yc_class'] button").siblings('.status').show();
	$.ajax({
		url: 'http://bbs.zjut.edu.cn/api/jhapi.php?url=http://api.zjut.com/student/class.php',
		async: true,
		dataType: 'json',
		type: 'GET',
		data: {username:username, password:password, grade:term, ip:get_option("insider_net")},

		success: function(data, status){
			$("#class_list").html("");
			if (!data['status']) {
				alert("服务器错误，请尝试在常规设置中切换服务器");
			}
			else if(data['status'] == "error" && data['msg'] == "用户名或密码错误") {
				alert("用户名或密码错误");
			}
			else if(data['status'] == "error") {
				alert("服务器错误，请尝试在常规设置中切换服务器");
			}
			else if(data['status'] == "success" && data['msg'] == "没有相关信息") {
				$("#grade_list").html("没有相关信息");
			}
			else if (data['status'] == "success") {
				var lists = new Array();
	            for(i = 0; i < data['msg'].length; i++) {
	            	var class_info = new Array();
	            	class_info['课程名称'] = data['msg'][i]['name'];
	            	class_info['开课学院'] = data['msg'][i]['collage'];
		            class_info['课程信息'] = data['msg'][i]['classinfo'];
		            class_info['课程类型'] = data['msg'][i]['classtype'];
		            class_info['学时'] = data['msg'][i]['classhuor'];
		            class_info['学分'] = data['msg'][i]['classscore'];

		            class_info = fix_yc_class(class_info);

		            lists.push(class_info);
	            }

	            $("#class_list").html(make_table(lists));
	            if(get_option('save_class_table') == "on") {
	            	set_option('class_table', make_table(lists));
	            }
	            else {
	            	set_option('class_table', '');
	            }
			}
			$("div[id='query_yc_class'] button").siblings('.status').hide();
		},

		error: function() {
			alert("服务器错误，请尝试在常规设置中切换服务器");return -3;
		},

	});
}



function check_binding(username, password) {
	$("div[id='yc_bindng'] button").siblings('.status').show();
	$.ajax({
		url: 'http://bbs.zjut.edu.cn/api/jhapi.php?url=http://api.zjut.com/student/scores.php',
		async: true,
		dataType: 'json',
		type: 'GET',
		data: {username:username, password:password, ip:get_option("insider_net")},

		success: function(data, status){
			if (!data['status']) {
				//alert("服务器错误，请尝试在常规设置中切换服务器");
				if(get_option("insider_net") != '86') {
					set_option("insider_net", parseInt(get_option("insider_net"))+1);
					check_binding(username, password);
				}
				else {
					alert("用户名或者密码错误服务器错误，请尝试在常规设置中切换服务器");
				}
			}
			else if(data['status'] == "error" && data['msg'] == "用户名或密码错误") {
				alert("用户名或密码错误");
			}
			else if(data['status'] == "error") {
				//alert("服务器错误，请尝试在常规设置中切换服务器");
				if(get_option("insider_net") != '86') {
					set_option("insider_net", parseInt(get_option("insider_net"))+1);
					check_binding(username, password);
				}
				else {
					alert("用户名或者密码错误服务器错误，请尝试在常规设置中切换服务器");
				}
			}
			else if(data['status'] == "success") {
				alert("绑定成功");
				set_option("yc_account", $("#yc_account").val());
    			set_option("yc_password", $("#yc_password").val());
			}

    		$("div[id='yc_bindng'] button").siblings('.status').hide();
		},

		error: function() {
			//alert("服务器错误，请尝试在常规设置中切换服务器");
			if(get_option("insider_net") != '86') {
				set_option("insider_net", parseInt(get_option("insider_net"))+1);
				check_binding(username, password);
			}
			else {
				alert("用户名或者密码错误服务器错误，请尝试在常规设置中切换服务器");
			}
		},

	});
}