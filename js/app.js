var casinos = [
    {
        name: "ARIA Resort & Casino Las Vegas",
        location: {lat: 36.107424, lng: -115.176684},
    },
    {
        name: "Bally's Las Vegas Hotel & Casino",
        location: {lat: 36.114078, lng: -115.170638},
    },
    {
        name: "Bellagio Hotel and Casino",
        location: {lat: 36.112626, lng: -115.176705},
    },
    {
        name: "Caesars Palace",
        location: {lat: 36.116160, lng: -115.174531},
    },
    {
        name: "Excalibur Hotel & Casino",
        location: {lat: 36.098982, lng: -115.175462},
    },
    {
        name: "Flamingo Las Vegas",
        location: {lat: 36.116458, lng: -115.170738},
    },
    {
        name: "Harrah's Las Vegas Hotel & Casino",
        location: {lat: 36.119464, lng: -115.171618},
    },
    {
        name: "Mandalay Bay",
        location: {lat: 36.091852, lng: -115.175213},
    },
    {
        name: "MGM Grand",
        location: {lat: 36.102550, lng: -115.170253},
    },
    {
        name: "The Mirage",
        location: {lat: 36.121213, lng: -115.174084},
    },
    {
        name: "Planet Hollywood Resort & Casino",
        location: {lat: 36.109996, lng: -115.170097},
    },
    {
        name: "Rio All-Suites Hotel and Casino",
        location: {lat: 36.117515, lng: -115.188159},
    },
    {
        name: "Treasure Island",
        location: {lat: 36.124727, lng: -115.171866},
    },
    {
        name: "The Venetian",
        location: {lat: 36.121174, lng: -115.169653},
    },
    {
        name: "Wynn Las Vegas",
        location: {lat: 36.126498, lng: -115.165728},
    }
];

let map;
let currentInfoWindow;

var Casino = function(data) {
    var self = this;
    this.name = data.name;
    this.latlng = data.location;
    this.url;
    this.street;
    this.city;
    this.phone;

    this.visible = ko.observable(true);

    // Foursquare API settings
    var clientID = "UQ0HJFXHZPMA5250F4W02MASU2KHJ0QRLIXW01CVG0DCX31L";
    var clientSecret = "2NFTFJ3F0B0ZDYUEZ5MKB3AMI5B0CSTBPBJFYNQIAO2MMSFF";
    var foursquareurl = 'https://api.foursquare.com/v2/venues/search?ll='+ this.latlng.lat + ',' + this.latlng.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

    this.infoWindow = new google.maps.InfoWindow();

    //ajax call
    $.getJSON(foursquareurl).done(function(data) {
        console.log(data);
        var results = data.response.venues[0];
        self.url = results.url;
        if (typeof self.url === 'undefined'){
            self.url = "";
        }
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = results.contact.formattedPhone;

        self.infoWindow.setContent(
        '<div><b>' + self.name + "</b></div>" +
        '<div>' + self.street + "</div>" +
        '<div>' + self.city + "</div>" +
        '<div>' + self.phone + "</div></div>"+
        '<div><a href="' + self.url +'">' + self.url + "</a></div>"
    );
        }
    ).fail(function() {
        alert("Foursquare API call failed.");
    });

    this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.latlng.lat, this.latlng.lng),
            map: map,
            title: this.name,
            animation: google.maps.Animation.DROP
    });

    this.marker.addListener('click', function(){
        if (currentInfoWindow === undefined) {
            currentInfoWindow = self.infoWindow;
            currentInfoWindow.open(map, this);
        }else if(currentInfoWindow === self.infoWindow){
            currentInfoWindow.close();
            currentInfoWindow = undefined;
        }else {
            currentInfoWindow.close();
            currentInfoWindow = self.infoWindow;
            currentInfoWindow.open(map, this);
        }

        map.panTo(self.marker.getPosition())
        
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function viewModel() {
    var self = this;
    this.searchTerm = ko.observable("");
    this.locationList = ko.observableArray([]);
    var casino;

    var bounds = new google.maps.LatLngBounds();

    casinos.forEach(function(locationItem){
        bounds.extend(locationItem.location);
        self.locationList.push( new Casino(locationItem));
    });
    map.fitBounds(bounds);

    this.filteredList = ko.computed( function() {
        if (currentInfoWindow !== undefined) {
            currentInfoWindow.close();
        }
        var filter = self.searchTerm().toLowerCase();
        if(!filter){
            self.locationList().forEach(function(locationItem){
                locationItem.visible(true);
                locationItem.marker.setVisible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                locationItem.marker.setVisible(result);
                return result;
            });
        }
    }, self);

}

function startApp() {
    map = new google.maps.Map(document.getElementById('map'), {
        styles: [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#523735"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#c9b2a6"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#dcd2be"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ae9e90"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#93817c"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#a5b076"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#447530"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdfcf8"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f8c967"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#e9bc62"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e98d58"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#db8555"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#806b63"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8f7d77"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#b9d3c2"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#f398b8"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#92998d"
      }
    ]
  }
]
    });

    var bounds = new google.maps.LatLngBounds();

    ko.applyBindings(new viewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load.");
}