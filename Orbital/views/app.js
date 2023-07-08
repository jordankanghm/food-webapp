//Improvements
//Styled pac card


//Require
//A database to store user's saved lists
//A database to store food trends
//A database to store event trends
//A database to store user's past search history

//Things to work on
//Find out why marker icons relative paths not working
//Sharing options (requires secure server)
//More filter options?
//Implement Creating, Reading, Editing, Deleting functionalities for the lists

//Find out why these are not working
// const express = require("express");
// console.dir(express)
// const app = express();
// const path = require("path");
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "/views"));
// app.use(express.static(path.join(__dirname, "/public")));

let map, currentLocation, currentMarker, currentInfoWindow, currentClosableTab;
let searchRadius = 50000;
let markers = [];

//Replicating saved lists in a database
let savedList1 = {
    name: "first list",
    placeIds: ["ChIJk_idN3oU2jEReqhHxnv3lgI", "ChIJXUuzLyMZ2jERs9wAeqqPlAQ"]
}
let savedList2 = {
    name: "second list",
    placeIds: []
}
let savedLists = [savedList1, savedList2];

// Replicating event trends in a database
// All event trends should  have the following properties
// name, description, duration, price range, website, distance away, placeId, share button
let eventTrends = [
        {
            eventName: "GastroBeats",
            duration: "1st June - 25th June",
            placeId: "ChIJYy7wMQQZ2jERyKMayWIDOgk",
            priceRange: "$$",
            website: "https://www.timeout.com/singapore/things-to-do/gastrobeats-2023",
            description: "Marrying food, music and fun is Gastrobeats, coming back this June to Bayfront Event Space. Held in conjunction with i Light Singapore from June 1 to 25, the festival will bring three weeks of gastro treats, live performances, and family-friendly activities."
        },
        {
            eventName: "GastroBeats",
            duration: "1st June - 25th June",
            placeId: "ChIJYy7wMQQZ2jERyKMayWIDOgk",
            priceRange: "$$",
            website: "https://www.timeout.com/singapore/things-to-do/gastrobeats-2023",
            description: "Marrying food, music and fun is Gastrobeats, coming back this June to Bayfront Event Space. Held in conjunction with i Light Singapore from June 1 to 25, the festival will bring three weeks of gastro treats, live performances, and family-friendly activities."
        }
    ]

// Replicating food trends in a database
// All food trends have the following properties
// name, description, history, benefits(if any), disbenefits(if any), share button
// placeIds array, containing food places that sell such food
//
// Default HTML div to display all the current food trends
// Markers should be displayed at places that sell such food and clicking will open their infoWindow normally.
let foodTrends = [
        {
            foodName: "Veganism",
            description: "Veganism is a lifestyle and dietary choice that seeks to exclude the use of animal products in all aspects of life. It goes beyond just avoiding meat and fish, extending to abstaining from consuming or using any animal-derived products, such as dairy, eggs, honey, and gelatin.",
            history: "The primary motivation behind veganism is often driven by ethical, environmental, and health concerns. Ethically, vegans believe in the inherent value and rights of animals, considering their use for human purposes as exploitation. They aim to minimize animal suffering and promote compassion towards all living beings.",
            benefits: "Improved Health, Environmental Sustainability, Animal Welfare",
            disbenefits: "Nutritional Deficiencies, Increased Meal Planning and Preparation, Social and Practical Challenges",
            placeIds: ["ChIJrUA94JEZ2jER7UGcBJwIwNM"]
        },
        {
            foodName: "Veganism",
            description: "Veganism is a lifestyle and dietary choice that seeks to exclude the use of animal products in all aspects of life. It goes beyond just avoiding meat and fish, extending to abstaining from consuming or using any animal-derived products, such as dairy, eggs, honey, and gelatin.",
            history: "The primary motivation behind veganism is often driven by ethical, environmental, and health concerns. Ethically, vegans believe in the inherent value and rights of animals, considering their use for human purposes as exploitation. They aim to minimize animal suffering and promote compassion towards all living beings.",
            benefits: "Improved Health, Environmental Sustainability, Animal Welfare",
            disbenefits: "Nutritional Deficiencies, Increased Meal Planning and Preparation, Social and Practical Challenges",
            placeIds: ["ChIJrUA94JEZ2jER7UGcBJwIwNM"]
        }
    ]

//Replicating search history in a database
let pastSearches = ["chinese", "chinese", "korean", "chinese", "western", "korean"]

/**
 * Initialises the map.
 *
 * Links Google Maps search box to the search input element.
 * The website will ask for user's current location and adjust the map accordingly such that the map
 * is focussed on the user's current location
 */
function initMap() {
    const singapore = { lat: 1.3521, lng: 103.8198 };
    // Initialises the map
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
    searchButton.addEventListener("click", () => {
        showSearchResults(searchInput.value, "search", null, null);
    })

    // Adds an event listener such that hitting enter performs a search
    searchInput.addEventListener("keydown", event => {
        // Check if the Enter key was pressed (key code 13)
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent form submission
          showSearchResults(searchInput.value, "search", null, null);
        }
    });

    // Add event listener to close the dropdown for the search box
    const closeButton = document.getElementById("close-dropdown-button");
    const filterContainer = document.getElementById("filter-container");
    closeButton.addEventListener("click", () => {
        if (filterContainer.style.display === "none") {
            filterContainer.style.display = "inline-block";
            closeButton.innerHTML = "▲";
            closeButton.style.margin = "0"
        } else {
            filterContainer.style.display = "none";
            closeButton.innerHTML = "▼";
            closeButton.style.margin = "5px 0 0 0"
        }
    });

    //Show user's saved lists when saved button is clicked
    const savedButton = document.getElementById("saved-button")
    savedButton.addEventListener("click", () => makeArrayWindow(savedLists, "list"))

    // Show trending events when event trend button is clicked
    const eventTrendButton = document.getElementById("event-trend-button");
    eventTrendButton.addEventListener("click", showEventTrends);

    //Show trending food when food trend button is clicked
    const foodTrendButton = document.getElementById("food-trend-button");
    foodTrendButton.addEventListener("click", () => makeArrayWindow(foodTrends, "foodList"));

    //Show recommended places when recommendations button is clicked
    const recommendationsButton = document.getElementById("recommendations-button");
    recommendationsButton.addEventListener("click", showRecommendations)

    // Retrives the user's current location and sets the bounds of autocomplete suggestions
    setCurrentLocation();

    /**
     * Sets the map viewport centered around the user's current location.
     *
     * Autocomplete suggestions are also restricted according to the radius argument.
     */
    function setCurrentLocation() {
        // Try to retrieve the user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
    
                // Create a LatLng object with the user's coordinates
                currentLocation = new google.maps.LatLng(latitude, longitude);

                // Calculate the southwest and northeast corners of the square
                const sw = google.maps.geometry.spherical.computeOffset(currentLocation, searchRadius, 225);
                const ne = google.maps.geometry.spherical.computeOffset(currentLocation, searchRadius, 45);

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
 * Removes all current markers. Then searches for all places that match the user's input, filters and search bounds.
 * Clickable markers are shown at each place which show details about the place when clicked.
 * 
 * @param {} query - The value inputted by the user in the search box
 * @param {} purpose - The reason for triggering the search
 */
async function showSearchResults(query, purpose, places, viewbound) {
    //Do not remove the markers if purpose is "recommendations"
    if (purpose === "search") {
        removeMarkers(map);
    }

    //Getting information about users' filters
    let filters = document.querySelectorAll(".type");
    filters.forEach(filter => {
        if (filter.checked) {
            query+= ` ${filter.name}`
        }
    })
    
    let priceRanges = [];
    let prices = document.querySelectorAll(".price-range")
    prices.forEach(price => {
        if (price.checked) {
            let priceLevel = price.id.length - 1;
            priceRanges.push(priceLevel);
        }
    })

    let distanceAway = document.querySelectorAll(".distance-away")
    distanceAway.forEach(distance => {
        if (distance.checked) {
            searchRadius = distance.id;
        }
    })

    // Create a PlacesService object
    const service = new google.maps.places.PlacesService(document.createElement('div'));
  
    // Define the search request
    const searchRequest = {
      query,
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
      // Set the bounds to include the user's current location
      viewbounds.extend(currentLocation);

      let searchResultsInfo = await Promise.all(
        results.filter(result => {  
        // Filter results by user's price range and distance
        const distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, result.geometry.location);
        if (priceRanges.length > 0) {
            for (let price of priceRanges) {
                if (result.price_level === price) {
                    return distance <= searchRadius; 
                }
            }
            return false;
        } else {
            return distance <= searchRadius;
        }
      }).map(async result => {
        const reviews = await new Promise((resolve, reject) => {
            // Create a new request for place reviews as textSearch() is unable to access place reviews
            const request = {
                placeId: result.place_id,
                fields: ["reviews"]
            };

            service.getDetails(request, (place, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(place.reviews);
              } else {
                reject(new Error(`PlacesServiceStatus: ${status}`));
              }
            })
        });
        
        const zIndex = counter++;
        // Sets the bounds to include the search result
        if (viewbound) {
            places.push(result);
            viewbound.extend(result.geometry.location);
        }
        viewbounds.extend(result.geometry.location);
        return {...result, reviews, zIndex};
      }));

      // If there are any open tabs, close them
      if (currentClosableTab) {
        currentClosableTab.remove()
      }

      if (viewbound) {
        return {places, viewbound};
      }

      if (searchResultsInfo.length === 0) {
        let content = document.createElement("p");
        content.innerHTML =`
            <h3>No places found<h3>
        `;
        let searchBox = document.getElementById("pac-card");
        currentClosableTab = createClosableTab(searchBox, content);
      } else {
        // Call the setMarkers function to display the markers on the map
        searchResultsInfo = await setMarkers(map, searchResultsInfo, "place");
        // Create a window listing the search results
        makeArrayWindow(searchResultsInfo, "place");
        // Finalises the bounds based on all the search results
        map.fitBounds(viewbounds);
        return searchResultsInfo;
      }
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
}

/**
 * Creates a window which displays information from the elements in the array
 * 
 * @param {*} array - The array containing elements whose information we wish to display
 * @param {*} purpose - Specifies how the information should be displayed
 */
function makeArrayWindow(array, purpose) {
    // If there there is currently an open tab, close it first
   if (currentClosableTab) {
       currentClosableTab.remove()
   }

   // Create an information window showing all places in th array, below the search container
   let container = document.createElement("ul")
   container.style.height = "300px";
   container.style.overflow = "auto";
   container.innerHTML = "";

   if (purpose === "place") {
       for (let place of array) {
           let placeItem = document.createElement("li");
           placeItem.innerHTML = `
               <h3>${place.name}</h3>
               <hr>
           `;
           placeItem.style.cursor = "pointer";

           //Add an event listener which opens the information window of the place upon clicking
           placeItem.addEventListener("click", () => {
            google.maps.event.trigger(place.marker, "click");
           });
           container.appendChild(placeItem);
       }
   } else if (purpose === "list") {
       // Create the button to create new lists
       let createListButton = document.createElement("h3");
       createListButton.innerHTML = "+Create a new List";
       createListButton.addEventListener("click", () => createNewList(container));
       createListButton.style.cursor = "pointer";
       container.appendChild(createListButton);

       for (let list of savedLists) {
           let listItem = document.createElement("li");
           listItem.innerHTML = `
           <h3>${list.name}</h3>
           `
           listItem.style.cursor = "pointer";

           listItem.addEventListener("click", () => showSavedListPlaces(list));
           container.appendChild(listItem);
       }
   } else if (purpose === "eventTrend") {
       for (let eventTrend of array) {
           let eventTrendItem = document.createElement("li");
           eventTrendItem.innerHTML = `
               <h3>${eventTrend.eventName}</h3>
               <p>Description: ${eventTrend.description}</p>
               <hr>
           `;
           eventTrendItem.style.cursor = "pointer";

           eventTrendItem.addEventListener("click", () => {
            google.maps.event.trigger(eventTrend.marker, "click");
           })
           container.appendChild(eventTrendItem);
       }
   } else if (purpose === "foodList") {
       for (let foodTrend of foodTrends) {
           let foodTrendItem = document.createElement("li");
           foodTrendItem.innerHTML = `
                <h3>${foodTrend.foodName}</h3>
                <p>Description: ${foodTrend.description}</p>
                <p>History: ${foodTrend.history}</p>
                <p>Benefits: ${foodTrend.benefits}</p>
                <p>Disbenefits: ${foodTrend.disbenefits}</p>
                <hr>
           `
           foodTrendItem.style.cursor = "pointer";

           foodTrendItem.addEventListener("click", () => showFoodTrendPlaces(foodTrend));
           container.appendChild(foodTrendItem);
       }
   }
   let searchContainer = document.getElementById("pac-card");
   currentClosableTab = createClosableTab(searchContainer, container);;
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
 * @param {} purpose - Specifies the type of markers to be created
 */
async function setMarkers(map, array, purpose) {
    // Shapes define the clickable region of the icon. The type defines an HTML
    // <area> element 'poly' which traces out a polygon as a series of X,Y points.
    // The final coordinate closes the poly by connecting to the first coordinate.
    const shape = {
      coords: [1, 1, 1, 20, 18, 20, 18, 1],
      type: "poly",
    };

    // Create a marker for each place
    for (let i = 0; i < array.length; i++) {
        const result = await array[i]
        const marker = new google.maps.Marker({
            position: result.geometry.location,
            map,
            shape: shape,
            title: result.name,
            zIndex: result.zIndex,
        });

        let image = {
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(20, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32),
        };

        // Changing the marker icon depending on the purpose
        if (purpose === "place" || purpose === "foodTrend") {
            // Need to find out why image not loading
            image.url = "./images/food-location.png";
        } else if (purpose === "eventTrend") {
            image.url = "./images/trending-location.png";
        }
        marker.icon = image;
        
        // Adds the marker to the array of currently displayed markers
        markers.push(marker);

        // Add a click listener to each marker which will show its details upon click
        marker.addListener("click", async () => {
            // Close the currently open info window and change its marker icon back to normal, if any
            if (currentInfoWindow) {
                currentInfoWindow.close();
                currentMarker.setIcon(image);
            }

            const chosenImage = {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(20, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(0, 32),
            };

            let infoWindow;
            // Create an info window depending on the purpose at the clicked marker's position 
            // and change the marker icon
            if (purpose === "place" || purpose === "foodTrend") {
                infoWindow = makePlaceInfoWindow(result);
            } else if (purpose === "eventTrend") {
                infoWindow = makeEventTrendInfoWindow(result);
            } 
            infoWindow.open(map, marker);
            marker.setIcon(chosenImage);

            // Update the currentInfoWindow and currentMarker variable
            currentInfoWindow = infoWindow;
            currentMarker = marker;
        });
        array[i] = {...array[i], marker};
    }
    return array;
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

/**
 * Creates an info window containing details about "result"
 *
 * 
 * @param {} result - The place which we require details about
 * @returns The info window containing all the information regarding the place
 */
function makePlaceInfoWindow(result) {
    let shareButton = document.createElement("button");
    shareButton.innerText = "Share";
    shareButton.addEventListener("click", () => {
         // Check if the Web Share API is supported by the browser
        if (navigator.share) {
            navigator.share({
            title: "Place Title",
            text: "Check out this amazing place!",
            url: "https://example.com/place"
            })
            .then(() => console.log("Place shared successfully."))
            .catch((error) => console.log("Error sharing place:", error));
        } else {
            console.log("Web Share API is not supported in this browser.");
            // Provide an alternative sharing method or display an error message
        }
    });

    // If the place has a phone number, retrieve it
    let phoneNumber = "";
    if (result.formatted_phone_number) {
        phoneNumber = `Phone Number: ${result.formatted_phone_number}`
    }

    // If the place has a website, retrieve it
    let website = "";
    if (result.website !== undefined) {
        website = `Website: ${result.website}`
    }

    // If the place has a price level, retrieve it
    let priceLevel = ""
    if (result.price_level !== undefined) {
        priceLevel = `Price Level: ${result.price_level}`
    }

    // If the place has reviews, retrieve them
    let reviewsContent = "";

    if (result.reviews && result.reviews.length > 0) {
        result.reviews.forEach(review => {
            reviewsContent += `
                <p>Review: ${review.text}</p>
                <p>Rating: ${review.rating}/5</p>
                <p>Author: ${review.author_name}</p>
                <hr>
            `;
        });
    }

    // If the place has photos, retrieve them
    let photoContent = "";
    if (result.photos && result.photos.length > 0) {
        photoContent = document.createElement("div")
        result.photos.forEach(photo => {
            const img = document.createElement("img");
            img.src = photo.getUrl({ maxWidth: 400, maxHeight: 400 });
            photoContent.appendChild(img);
        });
        photoContent = photoContent.innerHTML;
    }

    //The content to be displayed in the info window
    const infoWindowContent = `
        <h3>${result.name}</h3>
        ${shareButton.outerHTML}
        <p>Address: ${result.formatted_address}</p>
        ${phoneNumber}
        <p>Distance: ${(google.maps.geometry.spherical.computeDistanceBetween(currentLocation, result.geometry.location) / 1000).toFixed(1)}km away</p>
        ${website}
        ${priceLevel}
        <p>Rating: ${result.rating} stars</p>
        <p>Number of ratings: ${result.user_ratings_total}</p>
        ${reviewsContent}
        ${photoContent}
        `

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    return infoWindow;
}

function createNewList(lists) {
    // Inquire the list name from the user
    let form = document.createElement("form")
    let input = document.createElement("input")
    input.type = "text";
    form.innerHTML = `
        What is the name of this list?
        ${input.outerHTML}
    `
    let name = input.value;

    // Create a new list element
    let newList = document.createElement("li");
    newList.innerHTML = `
    <button>New List</button>
    `;

    // Append the new list to the current list
    lists.appendChild(newList);
    let list = {
        name,
        placeIds: []
    };
    newList.addEventListener("click", () => showSavedListPlaces(list));
}

/**
 * Shows the user's saved places in a given list
 * 
 * The places in the list are displayed in an information window.
 * Clickable markers show the place show details of the place when clicked
 * 
 * @param {*} list - The list which want to display information about
 */
async function showSavedListPlaces(list) {
    // Remove all current markers on the map
    removeMarkers(map);

    //If there are no places in the list
    if (list.placeIds.length === 0) {
        let content = document.createElement("h3");
        content.innerHTML = "There are no places in this list";

        // If there there is currently an open tab, close it first
        if (currentClosableTab) {
            currentClosableTab.remove()
        }
        let searchContainer = document.getElementById("pac-card");
        currentClosableTab = createClosableTab(searchContainer, content);
    } else {
        let counter = 1;
        const viewbounds = new google.maps.LatLngBounds();
        // Set the current viewport to include the user's current location
        viewbounds.extend(currentLocation);
    
        const promises = list.placeIds.map(async placeId => {
            const zIndex = counter++;
        
            // Create a request object
            const request = {
            placeId
            };
    
            // Create a Places Service object
            const service = new google.maps.places.PlacesService(map);
        
            return new Promise((resolve, reject) => {
            //Retrieve required details from place
            service.getDetails(request, function (place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                viewbounds.extend(place.geometry.location);
                resolve({...place, zIndex });
                } else {
                reject(new Error(`PlacesServiceStatus: ${status}`));
                }
            });
            });
        });
        
        try {
            //Wait for all details to be retrieved
            let results = await Promise.all(promises);
            results = await setMarkers(map, results, "place");
            makeArrayWindow(results, "place")
            //Finalise the user's viewport to fit all the places
            map.fitBounds(viewbounds);
        } catch (error) {
            console.error('Error occurred during show list places:', error);
        }
    }  
}

/**
 * Shows the current trending food events
 * 
 * Current trending events to be retrieved from our database. 
 * Clickable markers shows all information about the event upon click
 */
async function showEventTrends() {
    // Removes all current markers
    removeMarkers(map);

    let counter = 1;
    const viewbounds = new google.maps.LatLngBounds();
    // Set the current viewport to include the user's current location
    viewbounds.extend(currentLocation);
  
    const promises = eventTrends.map(async result => {
      const zIndex = counter++;
  
      // Create a request object
      const request = {
        placeId: result.placeId
      };

      // Create a Places Service object
      const service = new google.maps.places.PlacesService(map);
  
      return new Promise((resolve, reject) => {
        //Retrieve required details from place
        service.getDetails(request, function (place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            viewbounds.extend(place.geometry.location);
            resolve({ ...result, ...place, zIndex });
          } else {
            reject(new Error(`PlacesServiceStatus: ${status}`));
          }
        });
      });
    });
  
    try {
        //Wait for all details to be retrieved
        let results = await Promise.all(promises);
        results = await setMarkers(map, results, "eventTrend");
        makeArrayWindow(results, "eventTrend")
        //Finalise the user's viewport to fit all the places
        map.fitBounds(viewbounds);
    } catch (error) {
      console.error('Error occurred during trending events:', error);
    }
}

/**
 * Creates an info window containing the information regarding the trending food event
 * 
 * @param {} result - The place which we require details about
 * @returns The info window containing all the information about the trending food event
 */
function makeEventTrendInfoWindow(result) {
    // event name, event duration, location, price range(if available), 
    // distance away, description, share button
    const infoWindowContent = `
        <h3>${result.eventName}</h3>
        <button>Share</button>
        <p>Duration: ${result.duration}</p>
        <p>Address: ${result.formatted_address}</p>
        <p>Distance: ${(google.maps.geometry.spherical.computeDistanceBetween(currentLocation, result.geometry.location) / 1000).toFixed(1)}km away</p>
        <p>Price Level: ${result.priceRange}</p>
        <p>${result.description}</p>
        <a>${result.website}</a>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    return infoWindow
}

/**
 * Shows the current food trends
 * 
 * Current food trends to be retrieved from our database.
 * Clickable markers shows all information about the the places which sell such food
 * 
 * @param {} index - The food trend of interest currently
 */
async function showFoodTrendPlaces(foodTrend) {
    // Remove all existing markers
    removeMarkers(map)

    let counter = 1;
    const viewbounds = new google.maps.LatLngBounds();
    viewbounds.extend(currentLocation);

    const placePromises = foodTrend.placeIds.map(placeId => {
        const zIndex = counter++;

        const placeRequest = {
            placeId
        };

        const service = new google.maps.places.PlacesService(map);
        return new Promise((resolve, reject) => {
            service.getDetails(placeRequest, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    viewbounds.extend(place.geometry.location)
                    resolve(
                        {...place,
                         zIndex
                        }
                    )
                } else {
                    reject(new Error(`PlacesServiceStatus: ${status}`));
                }
            })
        });
    });

    let places = await Promise.all(placePromises);

    places = await setMarkers(map, places, "foodTrend");
    makeArrayWindow(places, "place")
    // Finalises the bounds based on all the search results
    map.fitBounds(viewbounds);
}

/**
 * Creates a tab which can be closed by clicking the "X" button
 * 
 * @param {*} elementToAppendTo - The element which the tab should be appended to
 * @param {*} content - The contents of the tab
 * @returns The closable tab
 */
function createClosableTab(elementToAppendTo, content) {
    let container = document.createElement("div");
    let closeButton = document.createElement("button");
    closeButton.innerText = "X";
    closeButton.style.textAlign= "end";
    closeButton.addEventListener("click", () => {
        container.remove();
    })
    container.append(closeButton, content);
    container.style.margin = "5px 0 0 0"
    elementToAppendTo.appendChild(container);
    // elementToAppendTo.insertAdjacentElement("afterend", container)
    return container;
}

/**
 * Takes the user's latest ten searches and returns places related to these searches
 * 
 * Only three searches will be done based on their latest searches.
 * The queries will be chosen from highest recurring word in descending order.
 * If any of the top 3 words only occur once, then the latest user query will be selected instead.
 */
async function showRecommendations() {
    // Remove all current markers on the map
    removeMarkers(map)

    const numSearches = pastSearches.length;
    let pastTenSearches = "";
    let counter = 1;
    for (let i = numSearches - 1; i >= 0; i--) {
        // Check that the query contains letters
        if (counter <= 10 && /[a-zA-Z]/.test(pastSearches[i])) {
            pastTenSearches += pastSearches[i] + " ";
            counter++;
        }
        if (counter > 10) {
            break;
        }
    }

    // Convert the string to lowercase and remove punctuations
    const normalizedText = pastTenSearches.toLowerCase().replace(/[^\w\s]/g, "");
    // Separate the words into an array
    const words = normalizedText.split(" ");
    // Remove the last element which is an empty space
    words.pop();

    // Storing word-count pairs
    const wordFrequencies = new Map();

    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let currentCount;

        // If the table does not contain the word, initialise its count to 1
        if (!wordFrequencies.has(word)) {
            wordFrequencies.set(word, 1)
            currentCount = 1;
        } else {  // If the table contains the word, increment its count by 1
            currentCount = wordFrequencies.get(word);
            currentCount++;
            wordFrequencies.set(word, currentCount);
        }
    };

     // Create an array of [key, value] pairs from the map
    const pairs = Array.from(wordFrequencies);

    // Sort the pairs in descending order based on frequencies
    pairs.sort((a, b) => b[1] - a[1]);

    // Get the keys of the top 3 pairs
    const topThreeKeys = pairs.slice(0, 3).map(pair => pair[0]);

    const firstWord = pairs[0];
    const secondWord = pairs[1];
    const thirdWord = pairs[2];

    let viewbound = new google.maps.LatLngBounds();
    viewbound.extend(currentLocation);
    let places = [];
    
    // If there is no firstWord, show the default search results
    // If there is no secondWord, show only results for the firstWord
    if (!firstWord || !secondWord) {
        showSearchResults(firstWord, "recommendations", null, null);
    // If there is no thirdWord, show only results for the first and second words
    } else if (!thirdWord) {
        let results = await showSearchResults(firstWord, "recommendations", places, viewbound)
        results = await showSearchResults(secondWord, "recommendations", results.places, results.viewbound)
        places = results.places;
        // Finalises the bounds based on all the search results
        map.fitBounds(results.viewbound);
    // If all three words are present, show their search results
    } else {
        let results = await showSearchResults(firstWord, "recommendations", places, viewbound)
        results = await showSearchResults(secondWord, "recommendations", results.places, results.viewbound)
        results = await showSearchResults(thirdWord, "recommendations", results.places, results.viewbound)
        places = results.places;
        // Finalises the bounds based on all the search results
        map.fitBounds(results.viewbound);
    }

    if (places.length === 0) {
        let content = document.createElement("p");
        content.innerHTML =`
            <h3>No places found<h3>
        `;
        let searchBox = document.getElementById("pac-card");
        currentClosableTab = createClosableTab(searchBox, content);
    } else {
        // Call the setMarkers function to display the markers on the map
        places = await setMarkers(map, places, "place");
        // Create a window listing the search results
        makeArrayWindow(places, "place");
    }
      
}

window.initMap = initMap;