var myDate = new Date();
var year = myDate.getFullYear();
var lastYear = (myDate.getFullYear()-1);
var month = myDate.getMonth()+1;
if(month > 0 && month < 6) {
	select_term = lastYear + "/" + year + "(1)";
}	
else {
	select_term = lastYear + "/" + year + "(2)";
}

var defaultOptions = {
    insider_net: "86",
    script_function: "on",
    display_bbs: "on",
    display_outsider_net: "on",
    display_insider_net: "on",
    grade_check: "off",
    grade_check_time: "10",
    save_class_table: "on",
    class_table: "",
    page: "#index",
    yc_account: "",
    yc_password: "",
    old_grade: "",
    grade_term: select_term,
    class_term: select_term,
};

function get_button(name, onclick, json_value) {
	var button = document.createElement("button");

	button.innerHTML = name;
	button.onclick = onclick;

	var obj = $.parseJSON(json_value);
    for(var key in obj)
    {
        button.setAttribute(key, obj[key]);
    }
    return button;
}

function set_primary(t) {
    t.removeClass("btn-default");
    t.addClass("btn-primary");
}

function set_default(t) {
    t.removeClass("btn-primary");
    t.addClass("btn-default");
}

function get_option(t) {
    if (localStorage.getItem(t) === null) {
        localStorage.setItem(t, defaultOptions[t])
    }
    return localStorage.getItem(t);
}

function set_option(t, o, e) {
    localStorage.setItem(t, o);
    if (e) updateAll()
}

function get_options() {
    return window.localStorage;
}

function grade_notify(title = '成绩更新通知', content = '您有新的成绩更新！') {
    chrome.notifications.create("grade-update", {
            type : "basic",
            title : title,
            message : content,
            iconUrl: 'imgs/icon.png',
            isClickable : true,
            buttons : [{
                    title: '查看内容'
            	}]
    	}, function () {}
    );
    set_option("lastDyn", content.ctime);
    chrome.notifications.onButtonClicked.addListener(function (notificationId, index) {
        if (notificationId == 'grade-update') {
	        chrome.tabs.create({
	            url: chrome.extension.getURL("options.html#grade")
	        });
    	}
	});
}

function fix_yc_class(class_info) {
	var pattern = /([^:]+):([^:]*)/;
	var result = class_info['课程名称'].match(pattern);
    class_info['名称'] = result[1];
    class_info['老师'] = result[2];

    pattern = /\d\d?-\d\d?(周)?:星期\d\(\d\d?-\d\d?\)([^;]+|[^;]?)/g;
    result = class_info['课程信息'].match(pattern);

    class_info['信息'] = new Array();

    for(var key in result) {
        var one = new Array();

        preg = /[^:周]+/g;
        arr = result[key].match(preg);
        one['周'] = arr[0];

        preg = /(\d+)-(\d+)/;
        arr = one['周'].match(preg);
        if ( arr != null ) {
		    one['开始周'] = arr[1];
			one['结束周'] = arr[2];
		}
		else {
			one['开始周'] = one['周'];
			one['结束周'] = one['周'];
		}

		preg = /星期(\d)/;
		arr = result[key].match(preg);
		one['星期'] = arr[1];

		preg = /\((\d+)/;
		arr = result[key].match(preg);
		one['开始节'] = arr[1];

		preg = /(\d+)\)/;
		arr = result[key].match(preg);
		one['结束节'] = arr[1];

		preg = /\)\s([^;]*)/;
		arr = result[key].match(preg);
		if ( arr != null ) {
		    one['地点'] = arr[1];
		}
		else {
			one['地点'] = "";
		}

		class_info['信息'].push(one);
    }

    return class_info;
}

function make_table(class_lists) {
	table = '<tbody><tr bgcolor="#dedede" align="center"><td><font size="2"><b>节</b></font></td><td><font size="2"><b>周一</b></font></td><td><font size="2"><b>周二</b></font></td><td><font size="2"><b>周三</b></font></td><td><font size="2"><b>周四</b></font></td><td><font size="2"><b>周五</b></font></td><td><font size="2"><b>周六</b></font></td><td><font size="2"><b>周日</b></font></td></tr>';

	var day = new Array();
	for (var i = 0; i < 7; i++) {
		day[i] = 0;
	}

	for (var jie = 2; jie < 14; jie++) {
		table +="<tr>";
		table += "<td><font size=\"2\"><span id=\"DG_GXK__ctl"+jie+"_LblXiaoQU\">"+(jie-1)+"</span></font></td>";
		for (var zhou = 1; zhou < 8; zhou++) {
			if(day[zhou-1] < 0) {
                day[zhou-1]++;
                continue;
            }
            find = false;
            rowspan = 0;
            var course = new Array();
            for(var k in class_lists) {
            	if(find == false) {
                    for(var key in class_lists[k]['信息']) {
                        if(class_lists[k]['信息'][key]['开始节'] == jie-1 && class_lists[k]['信息'][key]['星期'] == zhou) {
                            course.push(class_lists[k]['名称']+"/("+class_lists[k]['信息'][key]['周']+")|"+class_lists[k]['信息'][key]['地点']+"/"+class_lists[k]['老师']);
                            rowspan = (class_lists[k]['信息'][key]['结束节']-class_lists[k]['信息'][key]['开始节']+1);
                        }
                    }
                }
            }
            if(rowspan == 0) {
                table += "<td><font size=\"2\"><span id=\"DG_GXK__ctl"+jie+"_XQ"+zhou+"\">";
            }
            else {
                table += "<td rowspan="+rowspan+"><font size=\"2\"><span id=\"DG_GXK__ctl"+jie+"_XQ"+zhou+"\">";
                for(var key in course) {
                	table += course[key]+"<br>";
                }
                day[zhou-1] -= rowspan-1;
            }
            table += "</span></font></td>";
		}
		table += "</tr>";
	}
	table += "</tbody>";

    return table;
}

function Base64() {
 
	// private property
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
 
	// public method for encoding
	this.encode = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}
 
	// public method for decoding
	this.decode = function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}
 
	// private method for UTF-8 encoding
	_utf8_encode = function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
		return utftext;
	}
 
	// private method for UTF-8 decoding
	_utf8_decode = function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}