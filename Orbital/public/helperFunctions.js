/**
 * Sets the map viewport centered around the user's current location.
 *
 * Autocomplete suggestions are also restricted according to the radius argument.
 */
export function setCurrentLocation() {
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

/**
 * Creates a window which displays information from the elements in the array
 * 
 * @param {*} array - The array containing elements whose information we wish to display
 * @param {*} purpose - Specifies how the information should be displayed
 */
export function makeArrayWindow(array, purpose) {
    // If there there is currently an open tab, close it first
   if (currentClosableTab) {
       currentClosableTab.remove()
   }

   // Create an information window showing all places in th array, below the search container
   let container = document.createElement("ul")
   container.style.maxHeight = "300px";
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
       let createListButton = document.createElement("h4");
       createListButton.innerHTML = "+ Create a new List";
       createListButton.style.marginBottom = "5px";
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
               <p>${eventTrend.description}</p>
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
                ${foodTrend.description}</p>
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

//IMAGES STILL NOT WORKING!!
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
export async function setMarkers(map, array, purpose) {
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
            size: new google.maps.Size(50, 50),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32),
        };

        // Changing the marker icon depending on the purpose
        if (purpose === "place" || purpose === "foodTrend" || purpose === "recommendations") {
            // Need to find out why image not loading
            // image.url = "https://www.wwe.com/f/styles/wwe_large/public/all/2019/10/RAW_06202016rf_1606--3d3997f53e6f3e9277cd5a67fbd8f31f.jpg"
            image.url = "https://image.pngaaa.com/184/1912184-middle.png";
        } else if (purpose === "eventTrend") {
            image.url = "https://www.clipartmax.com/png/middle/295-2953301_google-map-marker-green.png";
        }
        marker.setIcon(image);
        console.log(image.url);
        
        // Adds the marker to the array of currently displayed markers
        markers.push(marker);

        // Add a click listener to each marker which will show its details upon click
        marker.addListener("click", async () => {
            // Close the currently open info window and change its marker icon back to normal, if any
            if (currentInfoWindow) {
                currentInfoWindow.close();
                currentMarker.setIcon(image);
                console.log(`Old marker icon url is set back to: ${currentMarker.icon.url}`)
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
            if (purpose === "place" || purpose === "foodTrend" || purpose === "recommendations") {
                infoWindow = makePlaceInfoWindow(result);
            } else if (purpose === "eventTrend") {
                infoWindow = makeEventTrendInfoWindow(result);
            } 
            infoWindow.open(map, marker);
            marker.setIcon(chosenImage);
            console.log(`New marker icon url is set to: ${marker.icon.url}`)

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
export function removeMarkers(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

/**
 * Creates a tab which can be closed by clicking the "X" button
 * 
 * @param {*} elementToAppendTo - The element which the tab should be appended to
 * @param {*} content - The contents of the tab
 * @returns The closable tab
 */
export function createClosableTab(elementToAppendTo, content) {
    let container = document.createElement("div");
    let buttonContainer = document.createElement("div");
    let closeButton = document.createElement("button");
    closeButton.innerText = "X";
    buttonContainer.append(closeButton);
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "end";

    closeButton.addEventListener("click", () => {
        container.remove();
        const tabs = document.querySelectorAll(".tabs button");
        // Remove 'active' class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
    })
    container.append(buttonContainer, content);
    container.style.marginTop = "5px"
    elementToAppendTo.appendChild(container);
    // elementToAppendTo.insertAdjacentElement("afterend", container)
    return container;
}

/**
 * Creates an info window containing details about "result"
 *
 * 
 * @param {} result - The place which we require details about
 * @returns The info window containing all the information regarding the place
 */
export function makePlaceInfoWindow(result) {
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