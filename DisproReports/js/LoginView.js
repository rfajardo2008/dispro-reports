var LoginView = function(service) {
	
	this.initialize = function() {
		this.el = $("<div/>");
		this.el.on('click', '#change-url', this.changeUrl);
	};
	
	this.render = function() {
		this.el.html(LoginView.template());
		return this;
	};
	
	this.changeUrl = function() {
		if(localStorage) {
			localStorage.removeItem('serviceUrl');
		}
		window.location.hash = "";
		window.location.search = "";
	};
	
	this.tryLogin = function() {
		var userName = $("#username").val();
		var password = $("#password").val();
		
		if(!userName || userName.trim().length === 0 || !password || password.trim().length === 0) {
			$("h3.fs-message").addClass("fs-error");
			$("h3.fs-message").text("El nombre de usuario o contraseña no pueden estar vacíos");
			return;
		}
		
		var serviceUrl = app.serviceUrl + "login";
		$.ajax({
			url: serviceUrl,
			type: 'post',
			data: JSON.stringify({ 'userName': userName, 'password': password }),
			headers: { 'Content-Type': 'application/json; charset=utf-8'},
			dataType: 'json'
		}).done(function(data){
			if(data.response == null){
				window.location.search = "?view=list";
				return;
			}
			
			$("h3.fs-message").addClass("fs-error");
			$("h3.fs-message").text(data.response);
			return;
		}).fail(function(xhr, status, error) {
			$("h3.fs-message").addClass("fs-error");
			$("h3.fs-message").text("Error de conexión. Estado: " + status + 
					". Error: " + error + ", responseText: " + xhr.responseText +
					", responseXML: " + xhr.responseXML + ", status: " + xhr.status +
					", statusText: " + xhr.statusText);

			return;
		});
	};
	
	this.initialize();
}

LoginView.template = Handlebars.compile($("#login-tpl").html());