// 4 pages :-

// 1. Grant location access
// 2. User weather info (user-location or searched-location)
// 3. Loading screen
// 4. Search screen

// (all page HTML written.. will edit their visibility through JS.. add & remove a .active class)



// API Key ------------------------------------- :-

const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

// Fetch elements --------------------------- :-

// Following 2 elements, either visible or not
//     (visible --> i.e. search bar gets visible)
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchInput = document.querySelector("[data-searchInput]");

// Top level container (of diff. views)
const userContainer = document.querySelector(".weather-container");

// 4 diff. views.. only 1-visible at a time
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorScreen = document.querySelector(".error-screen");

const grantAccessButton = document.querySelector("[data-grantAccess]");

// Elements needed for switching tabs (views)
let currentTab = userTab;
currentTab.classList.add("current-tab");
// By default --> loads user-weather (userTab)
// ..that was set in the last command



// Switching will happen.. if clicked on a tab
//    --> Event listener needed (to switch tabs)

userTab.addEventListener("click", () => {
    // pass clicked tab as input to following funct
    switchTab(userTab);
    searchInput.value = ""; // unset the value
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
})


// Program tab switching ------------------ :-

function switchTab(clickedTab) {
    if(clickedTab != currentTab) {
        // then only switching will happen
        // First remove the properties from old current-tab
        currentTab.classList.remove("current-tab");
        // now switch the tabs
        currentTab = clickedTab;
        // Add the properties to new current-tab
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            // Currently visible tag has "active" class
            // And, we've clicked into a different tab
            // Means we have to go to search-tab
            // Hide grant-access & user-info
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            // Start showint the search-tab
            searchForm.classList.add("active");
        }
        else {
            // Hide the search-tab & user-info
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // If location granted --> show user-location weather
            // Else --> show grant access tab
            getFromSessionStorage();
        }
    }
    else { // clicked tab already open
        return; // No need to do anything
    }
}


// Checks if user-coordinates are already present in session storage
// To show grant-location OR user-location tab
function getFromSessionStorage() {
    // As we're going to save user-coordinates variable with location coordinates (later)
    // Therefore searching that item here !!
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        // local-coordinates not saved
        // --> show grant access tab
        grantAccessContainer.classList.add("active");
    }
    else {
        // Find user-location weather using latitude & longitudes.
        const coordinates = JSON.parse(localCoordinates);
        // API call :-
        fetchUserWeatherInfo(coordinates);
    }
}


// Get user's-location weather
//   (from lat, lon --> API call)
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // Also make grant-access invisible
    grantAccessContainer.classList.remove("active");
    // Also we have to show loading page
    //    (till the weather gets loaded)
    loadingScreen.classList.add("active");
    // API call -------- :-
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        let cityName = data?.name;
        if(cityName === undefined) { // invalid search
            // Remove loading screen
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // Keep Error Screen hidden (only 1 case to show this)
            errorScreen.classList.add("active");
        }
        else {
            // Remove loading screen now
            loadingScreen.classList.remove("active");
            // Keep Error Screen hidden (only 1 case to show this)
            errorScreen.classList.remove("active");
            // Start showing user-info container
            userInfoContainer.classList.add("active");
            // Show these data on UI
            renderWeatherInfo(data);
            // console.log(data);
        }
    }
    catch(err) {
        // On error too.. hide loading screen & user-weather info
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        // Keep Error Screen hidden (only 1 case to show this)
        errorScreen.classList.remove("active");
        // Show an error message on screen
        errorScreen.classList.add("active");
        // For now, printing msg on console
        console.log("Error in lat-lon API call");
    }
}

// let lat = 15.6333;
// let lon = 18.3333;
// let coordinates = {lat, lon};
// fetchUserWeatherInfo(coordinates);


function renderWeatherInfo(data) {
    // Show weather info on screen
    // Get page elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // ?.  =>  Optional chaining operator
    //    (if exists.. gets value, else undefined)
    //    (used to access a JSON property)

    // Get city name
    cityName.innerText = data?.name;
    // Get country name
    let country = data?.sys?.country.toLowerCase();
    // console.log(country);
    countryIcon.src = `https://flagcdn.com/144x108/${country}.png`;
    // console.log(countryIcon.src);
    // Get temperature
    temp.innerText = `${data?.main?.temp} °C`;
    // Get wind speed
    windspeed.innerText = `${data?.wind?.speed}m/s`;
    // Get cloud %
    cloudiness.innerText = `${data?.clouds?.all}%`;
    // Get Humidity
    humidity.innerText =  `${data?.main?.humidity}%`;
    // Get weather desc
    desc.innerText = data?.weather?.[0]?.main;
    // Get weather icon
    let summaryIcon = data?.weather?.[0]?.icon;
    // console.log(summaryIcon);
    weatherIcon.src = `http://openweathermap.org/img/w/${summaryIcon}.png`;

    console.log("API call response details :-");
    console.log(cityName.innerText , country,  countryIcon.src, temp.innerText, windspeed.innerText, cloudiness.innerText, humidity.innerText, desc.innerText, weatherIcon.src);
}



// Grant access Button --> Click

grantAccessButton.addEventListener("click", getLocation);


// Using Geolocation API
function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else { // location-support not available
        // Show an alert for no geolocation support available

    }
}



function showPosition(position) {
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }

    // Coordinates saved in current-session
    // Name --> user-coordinates
    //   (because that's what we'll search this item with)
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // Show weather on UI :-
    fetchUserWeatherInfo(userCoordinates);
}



searchForm.addEventListener("submit", (e) => {
    // Prevent default action
    e.preventDefault();
    // Retrieve cityName
    // let cityName = searchInput.ariaValueMax;
    let cityName = searchInput.value;
    // console.log(cityName);
    if(cityName === "") {
        return; // No city input given
    }
    // Else :-  (some city name is present) ..
    // City based API call :-
    fetchSearchWeatherInfo(cityName);
})



// City name  -->  API call  -->  weather

async function fetchSearchWeatherInfo(city) {
    // Start showing loading screen
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    // Keep Error Screen hidden (only 1 case to show this)
    errorScreen.classList.remove("active");
    try{
        // API call :-
        const apiCallLink = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        console.log(apiCallLink);
        const response = await fetch(apiCallLink);
        // console.log(response);
        const data = await response.json();
        // console.log(data);
        let cityName = data?.name;
        if(cityName === undefined) { // invalid search
            // Remove loading screen
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // Keep Error Screen hidden (only 1 case to show this)
            errorScreen.classList.add("active");
        }
        else {
            // Remove loading screen now
            loadingScreen.classList.remove("active");
            // Keep Error Screen hidden (only 1 case to show this)
            errorScreen.classList.remove("active");
            // Start showing user-info container
            userInfoContainer.classList.add("active");
            // Show these data on UI
            renderWeatherInfo(data);
            // console.log(data);
        }
    }
    catch(err) {
        // Remove loading screen
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        // Print an error message on UI.
        // Keep Error Screen hidden (only 1 case to show this)
        errorScreen.classList.add("active");
        // For now, printing it on console :-
        console.log("Error in City-API call");
    }
}

// fetchSearchWeatherInfo("goa");



// Function calls in initialization :-

// If user-location granted, weather info gets added in user-weather page
getFromSessionStorage();