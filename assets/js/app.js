$(document).ready(function(){

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
			

			for(var i in places) {
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
			}

			var div2 = $('<div class="place">');
			var a2 = $('<a href="javascript:void(0)">').text('Show All');
			div2.append($('<strong>').html(a2));
			a2.on('click', function(){
				api.reInit();
			});
			$('.places-wrapper').prepend(div2);
		}
	});

	$('#place_type').empty();
	$('#place_type').append($('<option id="deselect_opt">').html('Deselect All'));
	for(var i in placeTypes) {
		var placeType = placeTypes[i];
		$('#place_type').append($('<option selected>').html(placeType));
	}

	$('.selectpicker').selectpicker('refresh');

	$('#place_type').on('change', function(){
		
		var deselected = $(this).find('option#deselect_opt').prop('selected');
		if(deselected) {
			$(this).find('option').prop('selected', false);
			$(this).selectpicker('refresh');
		}
	});
});