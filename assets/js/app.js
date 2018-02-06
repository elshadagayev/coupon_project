$(document).ready(function(){

	var coupons = new CouponsApi();

	var api = new GoogleApi({
		mapId: 'map',
		autocompleteInput: document.getElementById('search'),
		onAutocomplete: function(resp) {
			var userLocation = resp.userLocation;
			
			var option = {
				lat: userLocation.geometry.location.lng(),
				lon: userLocation.geometry.location.lat(),
				formatted_address: userLocation.formatted_address,
				place_types: $('#place_type').val(),
				found: true,
			};

			api.reInit(option);
		},
		onInit: function (resp) {
			var places = resp.places;
			var userLocation = resp.userLocation;

			if(userLocation.formatted_address) {
				$('#search').val(userLocation.formatted_address);
			} else {
				$('#search').val(userLocation.city + ', ' + userLocation.region + ', ' + userLocation.country + ', ' + userLocation.postal);
			}

			coupons.find({
				lon: userLocation.lon,
				lat: userLocation.lat,
				query: $('#search2').val(),
				success: storePlaces
			});
			

			/*for(var i in places) {
				var {place, map, marker} = places[i];

				var div = $('<div class="place">').html('<img class="icon" src="' + place.icon + '">');
				var a = $('<a href="javascript:void(0)">').text(place.name);
				div.append($('<strong>').html(a));
				a[0].onclick = function(place,map,marker){
					return function(){
						api.zoomMarker(place, map, marker);
					}
				}(place,map,marker);
				$('.places-wrapper').append(div);
			}*/

			/*var div2 = $('<div class="place">');
			var a2 = $('<a href="javascript:void(0)">').text('Show All');
			div2.append($('<strong>').html(a2));
			a2.on('click', function(){
				api.reInit();
			});
			$('.places-wrapper').prepend(div2);*/
		}
	});


	var search2TimeoutHandler;
	$('#search2').on('input', function(){
		clearTimeout(search2TimeoutHandler);
		search2TimeoutHandler = setTimeout(function(){
			var userLocation = api.getLocation();
			coupons.find({
				lon: userLocation.lon,
				lat: userLocation.lat,
				query: $('#search2').val(),
				success: storePlaces
			})
		}, 1500);
	});

	var placesMarkers = [];

	function storePlaces (resp) {
		if(!resp.deals || !Array.isArray(resp.deals))
			return;

		$('.places-wrapper').empty();
		for(var i in placesMarkers) {
			var marker = placesMarkers[i];
			marker.setMap(null);
		}

		placesMarkers = [];

		for(var i in resp.deals) {
			var deal = resp.deals[i].deal;
			deal.discount_percentage *= 100;
			var merchant = deal.merchant;
			var wrapper = $('<div class="place">');
			var fine_print = null;
			if(deal.fine_print) {
				fine_print = $('<div style="color:#666;font-style:italic;font-weight:normal;padding-bottom:10px;">').html('Note: ' + deal.fine_print);
			}
			var title = $('<h2>').html($('<a>').attr({
				href: deal.untracked_url,
				target: '_blank'
			}).html(merchant.name + ' - ' + deal.title));
			var show_on_map = $('<a href="javascript:void(0);">').html('show on map');
			var small = $('<div>').append($('<i>').html(deal.short_title + ' | ' + deal.category_name + ' | ').append(show_on_map));
			var img = $('<img>').attr('src', deal.image_url);
			var expires_at = moment(deal.expires_at);
			if(expires_at.isValid()) {
				expires_at = $('<strong>').html('Expires at ' + expires_at.format("dddd, MMMM Do YYYY, h:mm:ss a"));
			} else {
				expires_at = null;
			}

			var price = [
				'Price: ' + deal.price + '$', 
				'Discount amount: ' + deal.discount_amount + '$',
				'Discount percentage: ' + deal.discount_percentage + '%',
			];

			if(deal.commission)
				price.push('Commission: ' + deal.commission);

			if(deal.number_sold)
				price.push('Number sold: ' + deal.number_sold);

			var price = $('<strong>').html(price.join(' | '));

			wrapper
			.append(title)
			.append(img)
			.append(price)
			.append(expires_at)
			.append(small)
			.append($('<div>').html(deal.description))
			.append($('<div>').css({
				clear: 'both',
				float: 'none'
			}))
			.append(fine_print);
			$('.places-wrapper').append(wrapper);

			var content = '<h3><a target="_blank" href="' + deal.untracked_url + '">' + merchant.name + '</a></h3><strong>' + deal.title + '</strong><br><strong>' + price.html() + '</strong>';
			content += $('<div>').append(img.clone().css({
				maxWidth: '100%'
			})).html();

			var marker = api.addMarker({
				lon: merchant.longitude,
				lat: merchant.latitude,
				title: merchant.name + ' - ' + deal.title,
				content
			});

			placesMarkers.push(marker);

			(function(marker,merchantName, untracked_url, title, price,img){
				show_on_map.on('click', function(){
					var content = '<h3><a target="_blank" href="' + untracked_url + '">' + merchantName + '</a></h3><strong>' + title + '</strong><br><strong>' + price + '</strong>';
					content += $('<div style="margin-top:20px;">').append(img).html();
					api.zoomMarker(marker, content);
					$("html, body").animate({ scrollTop: $('#map').position().top }, "slow");
				});
			})(marker,merchant.name, deal.untracked_url, deal.title, price.html(), img.clone().css({
				maxWidth: '100%'
			}));
		}
	}
});