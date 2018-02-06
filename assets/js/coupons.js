var CouponsApi = function() {
	//http://api.sqoot.com/v2/deals?api_key=&location=37.7915,-122.3936&query=coffee&radius=500

	var instance = this;
	var api_key = 'QJFzFGfHV32jEeuRaud5';
	var api_url = 'https://api.sqoot.com/v2/deals';

	this.find = function (o) {
		o = $.extend({
			lon: 36.2421212,
			lat: -113.7499198,
			query: '',
			radius: 100,
			per_page: 100,
			success: function(){}
		}, o);

		$.ajax({
			url: api_url,
			dataType: 'JSON',
			data: {
				api_key,
				location: o.lon + ',' + o.lat,
				query: o.query,
				radious: o.radius,
				per_page: o.per_page
			}
		}).then(function(resp){
			if(typeof o.success === 'function') {
				o.success(resp);
			}
		});
	}
}