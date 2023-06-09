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
let map, currentLocation, bounds, currentInfoWindow;
let markers = [];

/**
 * Initialises the map.
 *
 * Links Google Maps search box to the search input element.
 * The website will ask for user's current location and adjust the map accordingly such that the map
 * is focussed on the user's current location
 */
function initMap() {
    const singapore = { lat: 1.3521, lng: 103.8198 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: singapore,
        zoom: 11.5,
        mapTypeControl: false,
    });

    // Create the search box and link it to the input element
    const searchInput = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(searchInput);

    const searchButton = document.getElementById("search-button");
    // Adds an event listener such that hitting the search button performs a search
    searchButton.addEventListener("click", showSearchResults);

    // Adds an event listener such that hitting enter performs a search
    searchInput.addEventListener("keydown", function (event) {
        // Check if the Enter key was pressed (key code 13)
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent form submission
          showSearchResults();
        }
    });

    setCurrentLocation(3000);

    /**
     * Sets the map viewport centered around the user's current location.
     *
     * Autocomplete suggestions are also restricted according to the radius argument.
     * 
     * @param {} radius - The search radius 
     */
    function setCurrentLocation(radius) {
        // Try to retrieve the user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
    
                // Create a LatLng object with the user's coordinates
                currentLocation = new google.maps.LatLng(latitude, longitude);
    
                //Sets the bounds of the search
                bounds = new google.maps.Circle({
                    center: currentLocation,
                    radius
                });

                // Calculate the southwest and northeast corners of the square
                const sw = google.maps.geometry.spherical.computeOffset(currentLocation, radius, 225);
                const ne = google.maps.geometry.spherical.computeOffset(currentLocation, radius, 45);

                // Create a LatLngBounds object with the southwest and northeast corners
                const bound = new google.maps.LatLngBounds(sw, ne);
                //Set the bounds of autocomplete suggestions to the bound
                searchBox.setBounds(bound);
    
                // Place a marker at the user's location on the map
                new google.maps.Marker({
                    position: currentLocation,
                    map,
                    title: "Your Location",
                });
    
                // Center the map on the user's location
                map.setCenter(currentLocation);
            }, error => {
                    console.error("Error retrieving location:", error);
                });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }
}

/**
 * Displays markers at locations which match the user's search.
 *
 * Removes all current markers. Then searches for all places that match the user's input and the bounds.
 * Clickable markers are shown at each place which show details about the place.
 */
async function showSearchResults() {
    // Remove all current markers
    removeMarkers(map);

    // Get the search input
    const searchInput = document.getElementById('pac-input').value;
  
    // Create a PlacesService object
    const service = new google.maps.places.PlacesService(document.createElement('div'));
  
    // Define the search request
    const searchRequest = {
      query: searchInput,
      //Restricts the search to only food-related places
      types: ["restaurant", "cafe", "bakery", "bar", "meal_delivery", "meal_takeaway", "grocery_or_supermarket", "convenience_store", "liquor_store"]
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
      // Initialising the bounds which represents the users' viewport after the search
      const viewbounds = new google.maps.LatLngBounds();
      //Set the bounds to include the user's current location
      viewbounds.extend(currentLocation);
      const searchResultsInfo = results.filter(result => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(bounds.getCenter(), result.geometry.location);
        return distance <= bounds.getRadius();  // Check if the result is within the bounds
      }).map(result => {
        const zIndex = counter++;
        // Sets the bounds to include the search result
        viewbounds.extend(result.geometry.location);
        return {...result, zIndex};
      });
  
      // Call the setMarkers function to display the markers on the map
      setMarkers(map, searchResultsInfo);
      // Finalises the bounds based on all the search results
      map.fitBounds(viewbounds);
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
}

/**
 * Places a marker at all places in the array.
 *
 * Each place in the array is given a marker with a listener which displays information about the place
 * when clicked.
 * 
 * @param {} map - The map being used.
 * @param {} array - The array containing places. Each element contains information about the place as shown in the DOM
 *                   and its z-index, to deal with overlapping info windows.
 */
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

    array.forEach(result => {
        // Create a marker
        const marker = new google.maps.Marker({
            position: result.geometry.location,
            map,
            icon: image,
            shape: shape,
            title: result.name,
            zIndex: result.zIndex,
        });

        // Adds the marker to the array of currently displayed markers
        markers.push(marker);

        const placeRequest = {
            placeId: result.place_id,
            // Specifying the place details to retrieve
            fields: ["name", "formatted_address", "formatted_phone_number", "website", "rating", "opening_hours", "reviews", "photos", "price_level"]
        };
  
        const service = new google.maps.places.PlacesService(map); // Assuming you have a 'map' instance
        let infoWindow = null;

        // Retrieve additional information about the place using the Places API
        service.getDetails(placeRequest, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Create an info window or a custom HTML element to display the place information
                const infoWindowContent = `
                <h3>${place.name}</h3>
                <p>Address: ${place.formatted_address}</p>
                <p>Phone Number: ${place.formatted_phone_number}</p>
                <p>Website: <a href="${place.website}" target="_blank">${place.website}</a></p>
                <p>Rating: ${place.rating}</p>
                <p>Reviews: ${place.reviews}</p>
                <p>Opening Hours: ${place.opening_hours}</p>
                <p>Photos: ${place.photos}</p>
                <p>Price Level: ${place.price_level}</p>
                `;

                // Display the place information in an info window or a custom HTML element
                infoWindow = new google.maps.InfoWindow({
                    content: infoWindowContent
                });
            } else {
                console.error("PlacesServiceStatus:", status);
            }
        });

        // Add a click listener to each marker which will show its details upon click
        marker.addListener("click", () => {
            // Close the currently open info window, if any
            if (currentInfoWindow) {
                currentInfoWindow.close();
            }

            // Open the info window at the clicked marker's position
            infoWindow.open(map, marker);

            // Update the currentInfoWindow variable
            currentInfoWindow = infoWindow;
        });
    });
}

/**
 * Removes all current markers on the map
 *
 * @param {} map - The map being used.
 */
function removeMarkers(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

window.initMap = initMap;