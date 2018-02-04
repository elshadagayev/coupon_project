var GoogleApi = function (globalOpt) {
	var instance = this;
	globalOpt = $.extend({
		mapId: '',
		onInit: function(){},
		radius: 500
	}, globalOpt);

	var radius = globalOpt.radius;

	var initOpt = {};

	var mapId = globalOpt.mapId;

	var infoWindows = [], placesArr = [];

	getUserLocation();

	function init (o) {
		var infowindow;
		var map;
		var service;
		o = $.extend({
			lon: 36.2421212,
			lat: -113.7499198,
			ip: null,
			city: '',
			country: '',
			region: '',
			postal: '',
			formatted_address: '',
			place_types: placeTypes,
			found: false,
		}, o);

		initializeMap(o);

		function initializeMap() {
		  var pyrmont = new google.maps.LatLng(o.lon,o.lat);

		  map = new google.maps.Map(document.getElementById(mapId), {
		      center: pyrmont,
		      zoom: o.found ? 15 : 3,
		    });

		  var request = {
		    location: pyrmont,
		    radius,
		    type: o.place_types
		  };

		  service = new google.maps.places.PlacesService(map);
		  service.nearbySearch(request, callback);
		}

		function callback(results, status) {
		  $('.places-wrapper').empty();
		  placesArr = [];
		  if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {
		      var place = results[i];
		      var marker = createMarker(results[i]);
		      placesArr.push({place,map,marker});
		  	}
		  }
		
		  globalOpt.onInit({
			places: placesArr,
			userLocation: initOpt
		  });
		}

		function createMarker(place) {
		    var marker = new google.maps.Marker({
		      position: {
		        lat: place.geometry.location.lat(),
		        lng: place.geometry.location.lng()
		      },
		      map,
		      title: place.name + ' | click to zoom'
		    });

		    marker.addListener('click', function(){
		    	instance.zoomMarker(place, map, marker);
		    });

		    return marker;


	  }
	}

	this.zoomMarker = function(place, map, marker) {
		for(var i in infoWindows) {
			infoWindows[i].close();
		}

		var content = createContent(place);
    	var infowindow = new google.maps.InfoWindow({
          content
        });
    	map.setZoom(8);
		map.setCenter(marker.getPosition());
		infowindow.open(map, marker);
		infoWindows.push(infowindow);
	}

	function createContent (place) {
		var photo = place.photos && place.photos.length ? place.photos[0] : null;
		if(photo) {
			photo = photo.getUrl({
				maxWidth: photo.width,
				maxHeight: photo.height
			});
		}
		// name of place
	    var content = '<h1 style="margin-bottom:3px;">' + place.name + '</h1>';

	    // vicinity
	    content += '<i>' + place.vicinity + '</i><br>'


	    // photo if exists
	    if(photo) {
	    	content += '<img src="' + photo + '" style="width:300px;margin-top:10px;">';
	    }

	    // object type
	    content += '<hr><strong>Types: </strong>';
	    for(var i in place.types) {
	    	content += '<span style="margin-right:5px;">' + place.types[i] + ',</span>'
	    }
	    content += '<br>';

	    // openin hours
	    content += '<strong>Open now:</strong> ';
	    if(typeof place.opening_hours !== 'undefined' && place.opening_hours.open_now) {
	    	content += 'Yes';
	    } else {
	    	content += 'No';
	    }

	    return content;
	}

	this.reInit = function (o) {
		if(typeof o === 'undefined')
			init(initOpt);
		else {
			initOpt = o;
			init(initOpt);
		}
	}

	function importJS (o) {
		initOpt = o;
		var url = "https://maps.googleapis.com/maps/api/js?key=" + api_key  + "&libraries=places";
		var script = document.createElement('script');
		script.src = url;
		script.onload = function(){
			bindAutocomplete();
			init(o);
		}
		script.async = false;
		script.defer = false;

		document.getElementsByTagName('head')[0].appendChild(script);
	}

	function getUserLocation () {
	    $.ajax({
	    	url: "https://ipinfo.io",
	    	dataType: 'JSON'
	    }).then(function(resp) {
	    	var opt = resp;
	    	opt.loc = opt.loc.split(',');
	    	opt.lon = opt.loc[0];
	    	opt.lat = opt.loc[1];
	    	opt.found = true;
	    	importJS(opt);
	    }).fail(function(error){
	    	importJS();
	    });
	}

	function bindAutocomplete () {
		var defaultBounds = new google.maps.LatLngBounds(
  			new google.maps.LatLng(initOpt.loc, initOpt.lan)
  		);

  		var options = {
  			bounds: defaultBounds,
  			type: placeTypes,
  			radius,
  			componentRestrictions: {country: 'US'}
  		}

		autocomplete = new google.maps.places.Autocomplete(globalOpt.autocompleteInput, defaultBounds);
		autocomplete.addListener('place_changed', function() {
			var place = autocomplete.getPlace();

			globalOpt.onAutocomplete({
				userLocation: place
			});
		});
	}
}