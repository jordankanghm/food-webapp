// let map;

// async function initMap() {
//     // The location of Uluru
//     const position = {lat: 37.7749, lng: -122.4194};
//     // Request needed libraries.
//     //@ts-ignore
//     const { Map } = await google.maps.importLibrary("maps");

//     var pyrmont = new google.maps.LatLng(37.7749, -122.4194);

  
//     map = new Map(document.getElementById("map"), {
//         zoom: 12,
//         center: position,
//         mapId: "DEMO_MAP_ID",
//         draggable: true, // Enable map dragging
//         zoomControl: true, // Enable zoom controls
//         mapTypeControl: true, // Enable map type controls (e.g., satellite, terrain)
//         scaleControl: true, // Enable scale control
//         streetViewControl: true, // Enable street view control
//         rotateControl: true // Enable rotate control
//     });

// }



// function searchPlaces() {
//     // var formData = new FormData(this); 
//     // var k = keywordd.get(keyword);

//     console.log(document.getElementById('search-input').value);

//     var pyrmont = new google.maps.LatLng(37.7749, -122.4194);

//     var request = {
//       location: pyrmont,
//       radius: 500,
//       type: ['restaurant', 'cafe']
//     };

//     service = new google.maps.places.PlacesService(map);
//     service.nearbySearch(request, callback);
    
    
//     function callback(results, status) {
//       if (status == google.maps.places.PlacesServiceStatus.OK) {
//         for (var i = 0; i < results.length; i++) {
//           createMarker(results[i]);
//         }
//       }
//     }

//     fetch('/saved', {
//       method: 'POST',
//       body: document.getElementById('search-input').value
//     });

// }

// function createMarker(place) {
//     if (!place.geometry || !place.geometry.location) return;

//     const marker = new google.maps.Marker({
//       map: map,
//       position: place.geometry.location,
//     });

// }



// google.maps.event.addDomListener(window, 'load', initMap);

// document.getElementById('search-button').addEventListener('submit', function(event) {
//   // event.preventDefault(); // Prevent default form submission
//   searchPlaces();
// });

// Search functionalities
let map, infoWindow;
let markers = [];

//Initialises the Map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 1.3521, lng: 103.8198 },
        zoom: 11.5,
        mapTypeControl: false,
    });
    infoWindow = new google.maps.InfoWindow();

    setAutoComplete();
    setMarkers(map, []);
    setCurrentLocation();
}

async function showSearchResults() {
    //Remove all current markers
    removeMarkers(map);

    // Get the search input
    const searchInput = document.getElementById('search-input').value;
  
    // Create a PlacesService object
    const service = new google.maps.places.PlacesService(document.createElement('div'));
  
    // Define the search request
    const searchRequest = {
      query: searchInput
    };
  
    try {
      // Perform the search
      const results = await new Promise((resolve, reject) => {
        service.textSearch(searchRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject(new Error(`PlacesServiceStatus: ${status}`));
          }
        });
      });
  
      let counter = 1;
      const searchResultsGeometry = results.map(result => {
        const name = result.name;
        const lat = result.geometry.location.lat();
        const long = result.geometry.location.lng();
        const zIndex = counter++;
        return [name, lat, long, zIndex];
      });
  
      // Call the setMarkers function to display the markers on the map
      setMarkers(map, searchResultsGeometry);
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
}
  
//Allows user searches to have autocomplete options
function setAutoComplete() {
    const card = document.getElementById("pac-card");
    const input = document.getElementById("search-input");
    const biasInputElement = document.getElementById("use-location-bias");
    const strictBoundsInputElement =
    document.getElementById("use-strict-bounds");
    const options = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
    types: ["establishment"],
    };

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

    const autocomplete = new google.maps.places.Autocomplete(
    input,
    options
    );

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo("bounds", map);

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert(
        "No details available for input: '" + place.name + "'"
        );
        return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    }

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent =
        place.formatted_address;
    infowindow.open(map, marker);
    });

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    function setupClickListener(id, types) {
    const radioButton = document.getElementById(id);

    radioButton.addEventListener("click", () => {
        autocomplete.setTypes(types);
        input.value = "";
    });
    }

    setupClickListener("changetype-all", []);
    setupClickListener("changetype-address", ["address"]);
    setupClickListener("changetype-establishment", ["establishment"]);
    setupClickListener("changetype-geocode", ["geocode"]);
    setupClickListener("changetype-cities", ["(cities)"]);
    setupClickListener("changetype-regions", ["(regions)"]);
    biasInputElement.addEventListener("change", () => {
    if (biasInputElement.checked) {
        autocomplete.bindTo("bounds", map);
    } else {
        // User wants to turn off location bias, so three things need to happen:
        // 1. Unbind from map
        // 2. Reset the bounds to whole world
        // 3. Uncheck the strict bounds checkbox UI (which also disables strict bounds)
        autocomplete.unbind("bounds");
        autocomplete.setBounds({
        east: 180,
        west: -180,
        north: 90,
        south: -90,
        });
        strictBoundsInputElement.checked = biasInputElement.checked;
    }

    input.value = "";
    });
    strictBoundsInputElement.addEventListener("change", () => {
    autocomplete.setOptions({
        strictBounds: strictBoundsInputElement.checked,
    });
    if (strictBoundsInputElement.checked) {
        biasInputElement.checked = strictBoundsInputElement.checked;
        autocomplete.bindTo("bounds", map);
    }

    input.value = "";
    });
}

//Changes the appearance of markers on the Map
function setMarkers(map, array) {

    // Adds markers to the map.
    // Marker sizes are expressed as a Size of X,Y where the origin of the image
    // (0,0) is located in the top left of the image.
    // Origins, anchor positions and coordinates of the marker increase in the X
    // direction to the right and in the Y direction down.
    const image = {
      url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(20, 32),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(0, 32),
    };
    // Shapes define the clickable region of the icon. The type defines an HTML
    // <area> element 'poly' which traces out a polygon as a series of X,Y points.
    // The final coordinate closes the poly by connecting to the first coordinate.
    const shape = {
      coords: [1, 1, 1, 20, 18, 20, 18, 1],
      type: "poly",
    };

    for (let i = 0; i < array.length; i++) {
      const result = array[i];

      const marker = new google.maps.Marker({
        position: { lat: result[1], lng: result[2] },
        map,
        icon: image,
        shape: shape,
        title: result[0],
        zIndex: result[3],
      });

      markers.push(marker);
    }
}

function removeMarkers(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

//Creates a button which allows users to pan to their current location
function setCurrentLocation() {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        locationButton
    );
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent("Location found.");
            infoWindow.open(map);
            map.setCenter(pos);
            },
            () => {
            handleLocationError(true, infoWindow, map.getCenter());
            }
        );
        } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
        }
        });

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }
}

window.initMap = initMap;
