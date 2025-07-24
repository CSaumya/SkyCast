const cityInput = document.querySelector(".input-city");
const searchBtn = document.querySelector(".input-btn");

const weatherInfo = document.querySelector(".weather-info");
const notFound = document.querySelector(".not-found");
const searchCity = document.querySelector(".search-city");

const countryName = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityTxt = document.querySelector(".humidity-value-txt");
const windTxt = document.querySelector(".wind-value-txt");
const weatherImg = document.querySelector(".weather-summary-container");
const currDate = document.querySelector(".curr-date-txt"); 

const forecastItems = document.querySelector(".forecast-items-container");

const loader = document.querySelector(".loader");

const apiKey = "e5a0e12431cdc564a9728302da8ba672";

searchBtn.addEventListener("click", () => {
    if (cityInput.value.trim() != "") {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = "";
        cityInput.blur();
    }
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && cityInput.value.trim() != "") {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = "";
        cityInput.blur();
    }
});

// Get lat/lon from city name
async function getCoordinates(city) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const response = await fetch(geoUrl);
    const data = await response.json();

    if (!data.length) {
        throw new Error("City not found");
    }

    return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name,
        country: data[0].country,
        state: data[0].state
    };
}

// Get weather icon by condition ID
function getWeatherIcon(id) {
    if (id <= 232) return "thunderstrom.jpeg";
    if (id <= 321) return "drizzle.jpeg";
    if (id <= 531) return "rainy.jpeg";
    if (id <= 622) return "snow.jpeg";
    if (id <= 781) return "atmosphere.jpeg";
    if (id === 800) return "clear.jpeg";
    if (id >= 801 && id <= 804) return "cloudy.jpg";
}

// Get current date
function getCurrDate() {
    const currentDate = new Date();
    const options = {
        weekday: "short",
        day: "2-digit",
        month: "short"
    };
    return currentDate.toLocaleDateString("en-GB", options);
}

// Main weather update function

async function updateWeatherInfo(city) {
    try {
        loader.style.display = "flex";
        weatherInfo.style.display = "none";
        notFound.style.display = "none";

        const location = await getCoordinates(city);

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const {
            main: { temp, humidity },
            weather: [{ id, main, description }],
            wind: { speed }
        } = weatherData;

        countryName.textContent = `${location.name} ${getCountryFlag(location.country)}`;
        tempTxt.textContent = Math.round(temp) + "°C";
        conditionTxt.textContent = description.charAt(0).toUpperCase() + description.slice(1);
        humidityTxt.textContent = humidity + "%";
        windTxt.textContent = speed + " M/s";
        currDate.textContent = getCurrDate();
        weatherImg.style.backgroundImage = `url('./assets/weather/${getWeatherIcon(id)}')`;

        await updateForecastInfo(location.lat, location.lon);
        showDisplaySection(weatherInfo);
    } catch (error) {
        console.error("Error fetching weather info:", error);
        showDisplaySection(notFound);
    } finally {
        loader.style.display = "none";
    }
}

//Gets Flag
function getCountryFlag(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Get forecast data using lat/lon
async function updateForecastInfo(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastData = await fetch(forecastUrl).then(res => res.json());

    const timeTaken = "12:00:00";
    const todayDate = new Date().toISOString().split("T")[0];

    forecastItems.innerHTML = ""; // Clear previous

    forecastData.list.forEach(forecastWeather => {
        if (
            forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)
        ) {
            updateForecastItems(forecastWeather);
        }
    });
}

// Update forecast display
function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id, main }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: "2-digit",
        month: "short"
    };
    const dateResult = dateTaken.toLocaleDateString("en-US", dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="./assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-condition">${main}</h5>
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    forecastItems.insertAdjacentHTML("beforeend", forecastItem);
}

// Control visible section
function showDisplaySection(section) {
    [weatherInfo, searchCity, notFound].forEach(sec =>
        sec.style.display = "none"
    );
    section.style.display = "flex";
}
