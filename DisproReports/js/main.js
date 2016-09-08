var app = {
	
	showAlert: function(message, title) {
		if(navigator.notification) {
			navigator.notification.alert(message, null, title, 'OK');
		} else {
			alert(title ? (title + ": " + message) : message);
		}
	},
	
	registerEvents: function() {

		if(document.documentElement.hasOwnProperty('ontouchstart')) {
			$('body').on('touchstart', 'a', function(event) {
				$(event.target).addClass('tappable-active');
			});
			$('body').on('touchend', 'a', function(event) {
				$(event.target).removeClass('tappable-active');
			});
		} else {
			$('body').on('mousedown', 'a', function(event) {
				$(event.target).addClass('tappable-active');
			});
			$('body').on('mouseup', 'a', function(event) {
				$(event.target).removeClass('tappable-active');
			});
		}
		
		$(window).on('hashchange', $.proxy(this.route, this));

		$(document).on('submit', 'form', function(event) {
			if(event.target.id == 'url-form') {
				event.preventDefault();
				app.urlView.storeUrl();
				$("#url-field").focus();
				return false;
			}
			
			if(event.target.id == 'login-form') {
				event.preventDefault();
				var returnValue = app.loginView.tryLogin();
				$("#username").focus();
				return false;
			}
		});
	},
	
	route: function() {
		var hash = window.location.hash;
		if(!hash) {
			return;
		}
		
		var match = hash.match(app.detailsURL);
		if(match){
			app.reportView = new ReportView(match[1]);
		}

		match = hash.match(app.editURL);
		if(match) {
			app.reportView.enableFieldEdition(hash.substring(6));
		}
		
		match = hash.match(app.enableURL);
		if(match) {
			$('#switch-enable, #switch-disable').toggle();
			$('#description').prop('disabled', false);
			app.reportView.disableControls();
			$(".enabler").removeClass("disabled");
		}
		
		match = hash.match(app.disableURL);
		if(match) {
			app.reportView.updateReport();
		}
	},
			
	getServiceUrl: function() {
		
		if(localStorage && localStorage.getItem('serviceUrl')) {
			return localStorage.getItem('serviceUrl');
		}
		
		var queryString = window.location.search;
		if(!queryString) {
			return null;
		}
		
		var i = queryString.indexOf('serviceUrl');
		if(i < 0) {
			return null;
		}
		
		i += 11;
		if(i >= queryString.length) {
			return null;
		}
		
		return queryString.substring(i);
	},

	initialize: function() {
		this.registerEvents();
		
		this.serviceUrl = app.getServiceUrl();

		this.detailsURL = /^#reports\/(\d{1,})/;
		this.editURL = /^#edit\//;
		this.enableURL = /^#enable/
		this.disableURL = /^#disable/
		this.textInEdition = "";
		
		if(window.location.search.includes("view=list")){
			this.reportListView = new ReportListView();
			$("body").html(this.reportListView.render().el);
			return this;
		}

		if(this.serviceUrl){
			this.loginView = new LoginView();
			$("body").html(this.loginView.render().el);
			return this;
		}
		
		this.urlView = new UrlView();
		$("body").html(this.urlView.render().el);
	}
};

app.initialize();