if(get_option("display_bbs")=="on") {
	document.body.appendChild(get_button("精弘论坛", function(){window.open('http://bbs.zjut.edu.cn/');}, '{ "id": "option", "class": "btn btn-default"}'));
}
if(get_option("display_outsider_net")=="on") {
	document.body.appendChild(get_button("原创(外网)", function(){window.open('http://www.ycjw.zjut.edu.cn//logon.aspx');}, '{ "id": "option", "class": "btn btn-default"}'));
}
if(get_option("display_insider_net")=="on") {
	document.body.appendChild(get_button("原创(内网)", function(){window.open('http://172.16.7.'+get_option('insider_net')+'//logon.aspx');}, '{ "id": "option", "class": "btn btn-default"}'));
}
document.body.appendChild(get_button("更多选项", function(){chrome.tabs.create({url:chrome.extension.getURL("options.html")});}, '{ "id": "option", "class": "btn btn-default"}'));