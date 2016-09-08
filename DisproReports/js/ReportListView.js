var ReportListView = function() {
	
	var reportListView = this;
	
	this.initialize = function() {
		var serviceUrl = app.serviceUrl + "report";
		$.ajax({
			url: serviceUrl,
			type: 'get'
		}).done(function(data) {
			reportListView.reports = data;
			reportListView.displayFilteredList();
		}).fail(function(xhr, status, error) {
			app.showAlert("Error desconocido. Estado: " + status + ". Error: " + error);
		});
		
		this.el = $('<div/>');
		this.el.on('keyup', '.search-key', this.displayFilteredList);
	};
	
	this.render = function() {
		this.el.html(ReportListView.template());
		return this;
	};
	
	this.findByDateTitle = function(searchKey, callback) {
		var reports = reportListView.reports.filter(function(element) {
			var stringToSearch = element.date + " " + element.title;
			return stringToSearch.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
		});
		callLater(callback, reports);
	};
	
	this.displayFilteredList = function() {
		reportListView.findByDateTitle($(".search-key").val(), function(reports) {
			$('.report-list').html(ReportListView.liTemplate(reports));
		});
	};
	
	var callLater = function(callback, data) {
		if(callback) {
			setTimeout(function() {
				callback(data);
			});
		}
	}
	
	this.initialize();
}

ReportListView.template = Handlebars.compile($("#report-list-tpl").html());
ReportListView.liTemplate = Handlebars.compile($("#report-li-tpl").html());