var loc = [
{
	name: 'CANBERRA',
	foursquareId: '4b058762f964a5205c8f22e3',
	lat: -35.2809,
	lng: 149.1300,
	selected: false,
	show: true
},
{
	name: 'SYDNEY',
	foursquareId: '4b058762f964a5201b8f22e3',
	lat: -33.86785,
	lng: 151.20732,
	selected: false,
	show: true
},
{
	name: 'MELBOURNE',
	foursquareId: '4b05874bf964a520988922e3',
	lat: -37.814,
	lng: 144.96332,
	selected: false,
	show: true
},
{
	name: 'BRISBANE',
	foursquareId: '4b203cedf964a520292f24e3',
	lat: -27.4674,
	lng: 153.02809,
	selected: false,
	show: true
},
{
	name: 'PERTH',
	foursquareId: '4b5e4272f964a520868629e3',
	lat: -31.95224,
	lng: 115.8614,
	selected: false,
	show: true
}];
//end of location json
var locations = [];
var viewmodel = function()
{
	var default_Marker = makeMarkerIcon('0091ff');
	var highlightedMarker = makeMarkerIcon('FFFFFF');
	var Infowindow = new google.maps.InfoWindow();

	function makeMarkerIcon(markerColor)
	{
		var markerImage = new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
			'|40|_|%E2%80%A2',
			new google.maps.Size(21, 34),
			new google.maps.Point(0, 0),
			new google.maps.Point(10, 34),
			new google.maps.Size(21, 34));
		return markerImage;
	}
	for (i = 0; i < loc.length; i++)
	{
		var marker = new google.maps.Marker(
		{
			position:
			{
				lat: loc[i].lat,
				lng: loc[i].lng
			},

			icon: default_Marker,
			map: map,
			title: loc[i].name,
			rating: '0',
			venue: loc[i].foursquareId,
			selected: loc[i].selected,
			image: 'img/no.png',
			show: ko.observable(true)
		});

		locations.push(marker);
		marker.addListener('mouseover', function()
		{ //when we take mouse on marker we change color of it to
			this.setIcon(highlightedMarker); // calling setIcon() color of highlighted icon
		});

		marker.addListener('mouseout', function()
		{
			this.setIcon(default_Marker); //when we take are mouse away from marker calling function setIcon color changes back to default
		});

		var make_Bounce = null;
		var clickListener = function()
		{
			if (make_Bounce !== null)
				make_Bounce.setAnimation(null);
			if (make_Bounce != this)
			{
				this.setAnimation(
					google.maps.Animation.BOUNCE);
				setTimeout(function()
				{
					make_Bounce.setAnimation(null);
				}, 1400);
				make_Bounce = this;
			}
			else
				make_Bounce = null;
		};

		google.maps.event.addListener(
			marker, 'click', clickListener);
		marker.addListener('click', function()
		{
			openInfoWindow(this, Infowindow); //on clicking marker calling function openInfoWindow()
		});

	}

	locations.forEach(function(mm)
	{
		$.ajax(
		{
			//foursquare api
			method: 'GET',
			datatype: "json",
			url: "https://api.foursquare.com/v2/venues/" + mm.venue + "?client_id=2JYEJY5E54SCTS2TJRILIIVLFPXCLQFXF0MPWI2YS2UQCJY3&client_secret=TH4C4MYFH44B2V02JS3YZEXYTKND5IEI4CTX0U51UT4JTKZ4&v=20170303",
			success: function(data)
			{
				var venue = data.response.venue;
				var imgurl = data.response.venue.photos.groups[0].items[0];
				if ((venue.hasOwnProperty('rating')))
				{
					mm.rating = venue.rating;
				}
				else
				{
					mm.rating = "N.A.";
					mm.imgurl = '';
				}

				if ((imgurl.hasOwnProperty('prefix')) && (imgurl.hasOwnProperty('suffix')))
					mm.image = imgurl.prefix + "125x100" + imgurl.suffix;
			},
			error: function(e)
			{ //if any error occur in fetching data
				alert('Error occured');
			}

		});

	});

	function openInfoWindow(marker, infowindow)
	{
		if (infowindow.marker != marker)
		{
			infowindow.marker = marker;
			infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3><h4>Ratings: ' + marker.rating + '</h4><img src="' + marker.image + '"></div>');
				infowindow.open(map, marker);
			infowindow.addListener('closeclick', function()
			{
				infowindow.marker = null;
			});

		}
	}

	this.selectAll = function(marker)
	{
		openInfoWindow(marker, Infowindow);
		marker.selected = true;
		marker.setAnimation(
			google.maps.Animation.BOUNCE);
		setTimeout(
			function()
			{
				marker.setAnimation(null);
			}, 1500);
	};

	this.inputText = ko.observable('');
	this.filtersearch = function()
	{
		Infowindow.close();
		var inputSearch =
			this.inputText();
		if (inputSearch.length === 0)
		{
			this.showAll(true);
		}
		else
		{
			for (i = 0; i < locations.length; i++)
			{
				if (locations[i].title.toLowerCase().indexOf(inputSearch.toLowerCase()) > -1)
				{
					locations[i].show(true);
					locations[i].setVisible(true);
				}
				else
				{
					locations[i].show(false);
					locations[i].setVisible(false);
				}
			}
		}
		Infowindow.close();
	};

	this.showAll = function(variable)
	{
		for (i = 0; i < locations.length; i++)
		{
			locations[i].show(variable);
			locations[i].setVisible(variable);
		}
	};
};
