var UrlView = function() {
	
	var urlView = this;
	
	this.initialize = function() {
		this.el = $("<div/>");
		this.el.on('keyup', '#url-field', this.checkToEnable);
	};
	
	this.render = function() {
		this.el.html(UrlView.template());
		return this;
	};
	
	this.validUrl = function() {
		var rxValidUrl = /^(http|https|ftp)\:\/\/([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$/i;
		var match = $("#url-field").val().match(rxValidUrl);
		if(match) {
			return true;
		}
		return false;
	}
		
	this.checkToEnable = function() {
		$("#store-url").prop("disabled", !urlView.validUrl());
	};
	
	this.storeUrl = function() {
		if(!urlView.validUrl()) {
			return;
		}
		
		var serviceUrl = $("#url-field").val();
		
		if(!serviceUrl.endsWith("/")){
			serviceUrl += "/";
		}
		
		if(localStorage) {
			localStorage.setItem('serviceUrl', serviceUrl);
		}
		window.location.search = "?serviceUrl=" + serviceUrl;
	};
	
	this.initialize();
}

UrlView.template = Handlebars.compile($("#url-tpl").html());