var ReportView = function(reportId) {
	var reportView = this;
	
	this.initialize = function() {
		var serviceUrl = app.serviceUrl + "report/" + reportId;
		$.ajax({
			url: serviceUrl,
			type: 'get',
		}).done(function(data) {
			reportView.report = data;
			reportView.el = $("<div/>");
			$("body").html(reportView.render().el);
			reportView.listenToEvents();
			return;
		}).fail(function(xhr, status, error) {
			app.showAlert("Error al obtener reporte. Estado: " + status + ". Error: " + error);
			return;
		});
	};

	this.render = function() {
		reportView.el.html(ReportView.template(reportView.report));
		return this;
	};
	
	this.listenToEvents = function() {
		reportView.el.on('keypress', 'input:text', this.checkValue);
		reportView.el.on('click', ".next", reportView.nextFieldset);
		reportView.el.on('click', '.previous', reportView.previousFieldset);
		reportView.el.on('click', '#sign', reportView.enableSignature);
		reportView.el.on('click', '#cancel-signature', reportView.disableSignature);
		reportView.el.on('click', '#reset-canvas', function(){$('#signature').jSignature('reset')});
		reportView.el.on('click', '#capture', reportView.captureSignature);		
	};
	
	this.updateReport = function() {
		var serviceUrl = app.serviceUrl + "report/" + reportId;
		var reportData = {
				'id': reportId,
				'fmtDate': '',
				'title': $('#txt-title').val(),
				'location': $('#txt-location').val(),
				'contact': $('#txt-contact').val(),
				'description': $('#description').val(),
				'signature': reportView.report.signature
		};
		$.ajax({
			url: serviceUrl,
			type: 'post',
			data: JSON.stringify(reportData),
			headers: { 'Content-Type': 'application/json; charset=utf-8'},
			dataType: 'json'
		}).done(function () {
			reportView.initialize();
			return;
		}).fail(function(xhr, status, error) {
			app.showAlert("Error al actualizar reporte. Estado: " + status + ". Error: " + error);
			app.showAlert("responseText: " + xhr.responseText + 
					", responseXML: " + xhr.responseXML +
					", status: " + xhr.status +
					", statusText: " + xhr.statusText);
			return;
		});		
	};
	
	this.checkValue = function(e) {
		var field = e.target.id.substring(4);
		
		if(e.which == 13) {
			reportView.updateReport();
		}		
	};

	this.displaySignatureEnablers = function() {
		$('#sign').removeClass('hidden');
		$('#cancel-sign').removeClass('hidden');
	};
	
	this.hideSignatureEnablers = function() {
		$('#sign').addClass('hidden');
		$('#cancel-sign').addClass('hidden');
	};
	
	this.displaySignatureCapture = function() {
		$('#content').removeClass('hidden');
		$('#cancel-signature').removeClass('hidden');
		$('#reset-canvas').removeClass('hidden');
		$('#capture').removeClass('hidden');
		if($('#signature').html() == ''){
			$('#signature').jSignature();
			return;
		}
		$('#signature').jSignature('reset');
		return;		
	};
	
	this.hideSignatureCapture = function() {
		$('#content').addClass('hidden');
		$('#cancel-signature').addClass('hidden');
		$('#reset-canvas').addClass('hidden');
		$('#capture').addClass('hidden');
	};
	
	this.displaySignature = function() {
		if((reportView.report.signature == null) || (reportView.report.signature == "")){
			reportView.displaySignatureEnablers();
			return;
		}
		$("#signature-done").html(reportView.report.signature);
		$("#signature-done").removeClass('hidden');
		$("#sign-previous").removeClass('hidden');
		$("#sign-cancel").removeClass('hidden');
		return;
	};
	
	this.enableSignature = function() {
		reportView.hideSignatureEnablers();
		reportView.displaySignatureCapture();
	};
	
	this.disableSignature = function() {
		reportView.displaySignatureEnablers();
		reportView.hideSignatureCapture();
	};
	
	this.captureSignature = function() {
		var dataPair = $('#signature').jSignature('getData', 'svg');
		reportView.report.signature = dataPair[1];
		reportView.updateReport();
	};
	
	this.disableControls = function() {
		$(".general-form").find("a").addClass('disabled');
		$(".next").prop("disabled", true);			
		$(".previous").prop("disabled", true);
		$(".submit").prop("disabled", true);
	};
	
	this.enableFieldEdition = function(field) {
		$("#" + field).removeClass('hidden');
		$("#edit-" + field).addClass('hidden');
		reportView.disableControls();
		$("#txt-" + field).focus();
	};
	
	this.nextFieldset = function(e) {
		
		reportView.displaySignature();
		
		if(this.animating) {
			return false;
		}
		this.animating = true;
		
		var _this = this;
		
		this.current_fs = $(e.target).parent();
		this.next_fs = this.current_fs.next();
		$("#progressbar li").eq($("fieldset").index(this.next_fs)).addClass("active");
		
		this.next_fs.show();		
		this.current_fs.animate(
			{opacity: 0},
			{
				easing: 'easeInOutBack',
				duration: 800,
				complete: function() {
					_this.current_fs.hide();
					_this.animating = false;
				},
				step: function(now, mx) {
					this.scale = 1 - (1 - now) * 0.2;
					this.left = (now * 50)+"%";
					this.opacity = 1 - now;
					_this.current_fs.css({
						'transform': 'scale(' + this.scale + ')',
						'position': 'absolute'
					});
					_this.next_fs.css({
						'left': this.left,
						'opacity': this.opacity
					});
				}
		});
	};
	
	this.previousFieldset = function(e) {
		if(this.animating) {
			return false;
		}
		this.animating = true;
		
		var _this = this;
	
		this.current_fs = $(e.target).parent();
		this.previous_fs = this.current_fs.prev();
	
		//de-activate current step on progressbar
		$("#progressbar li").eq($("fieldset").index(this.current_fs)).removeClass("active");
	
		//show the previous fieldset
		this.previous_fs.show(); 
		//hide the current fieldset with style
		this.current_fs.animate({opacity: 0}, {
			step: function(now, mx) {
				//as the opacity of current_fs reduces to 0 - stored in "now"
				//1. scale previous_fs from 80% to 100%
				this.scale = 0.8 + (1 - now) * 0.2;
				//2. take current_fs to the right(50%) - from 0%
				this.left = ((1-now) * 50)+"%";
				//3. increase opacity of previous_fs to 1 as it moves in
				this.opacity = 1 - now;
				_this.current_fs.css({'left': this.left});
				_this.previous_fs.css({'transform': 'scale(' + this.scale + ')', 'opacity': this.opacity});
			}, 
			duration: 800, 
			complete: function(){
				_this.current_fs.hide();
				_this.animating = false;
			}, 
			//this comes from the custom easing plugin
			easing: 'easeInOutBack'
		});
	};

	this.initialize();
}

ReportView.template = Handlebars.compile($("#report-tpl").html());