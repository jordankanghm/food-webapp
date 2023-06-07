let map;

async function initMap() {
    // The location of Uluru
    const position = {lat: 37.7749, lng: -122.4194};
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");

    var pyrmont = new google.maps.LatLng(37.7749, -122.4194);

  
    map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: position,
        mapId: "DEMO_MAP_ID",
        draggable: true, // Enable map dragging
        zoomControl: true, // Enable zoom controls
        mapTypeControl: true, // Enable map type controls (e.g., satellite, terrain)
        scaleControl: true, // Enable scale control
        streetViewControl: true, // Enable street view control
        rotateControl: true // Enable rotate control
    });

}



function searchPlaces() {
    // var formData = new FormData(this); 
    // var k = keywordd.get(keyword);

    console.log(document.getElementById('search-input').value);

    var pyrmont = new google.maps.LatLng(37.7749, -122.4194);

    var request = {
      location: pyrmont,
      radius: 500,
      type: ['restaurant', 'cafe']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
    
    
    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }
      }
    }

    fetch('/saved', {
      method: 'POST',
      body: document.getElementById('search-input').value
    });

}

function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
    });

}



google.maps.event.addDomListener(window, 'load', initMap);

document.getElementById('search-button').addEventListener('submit', function(event) {
  // event.preventDefault(); // Prevent default form submission
  searchPlaces();
});

