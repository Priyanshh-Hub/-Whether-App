document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city-input");
  const getWeatherBtn = document.getElementById("get-weather-btn");
  const weatherInfo = document.getElementById("weather-info");
  const cityNameDisplay = document.getElementById("city-name");
  const temperatureDisplay = document.getElementById("temperature");
  const descriptionDisplay = document.getElementById("description");
  const iconDisplay = document.getElementById("icon"); // ✅ FIXED
  const localTimeDisplay = document.getElementById("local-time");
  const errorMessage = document.getElementById("error-message");
  const themeToggleBtn = document.getElementById("toggle-theme"); // ✅ FIXED
  const loadingSpinner = document.getElementById("loading");


  const html = document.documentElement;

  const API_KEY = "5f56d525d1619d0a2cd2eac4ce55588e"; // Replace with your API key

  // Set theme on load
  html.dataset.theme = localStorage.getItem("theme") || "dark";

  themeToggleBtn.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", html.dataset.theme);
  });

  getWeatherBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  weatherInfo.classList.add("hidden");
  errorMessage.classList.add("hidden");
  loadingSpinner.classList.remove("hidden"); // Show spinner

  try {
    const data = await fetchWeatherData(city);
    displayWeatherData(data);
  } catch (error) {
    showError();
  } finally {
    loadingSpinner.classList.add("hidden"); // Hide spinner
    
  }
});

  async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("City not found");
    }

    return await response.json();
  }

  function displayWeatherData(data) {
    const { name, main, weather, timezone, dt } = data;

    const temperature = main.temp;
    const description = weather[0].description;
    const icon = weather[0].icon;

    cityNameDisplay.textContent = name;
    temperatureDisplay.textContent = `🌡 Temperature: ${temperature.toFixed(1)} °C`;
    descriptionDisplay.textContent = `🌤 Weather: ${description}`;
    iconDisplay.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />`;

    const localTime = getLocalTime(dt, timezone);
    localTimeDisplay.textContent = `🕒 Local Time: ${localTime}`;

    setDynamicBackground(weather[0].main.toLowerCase());

    errorMessage.classList.add("hidden");
    weatherInfo.classList.remove("hidden");
  }

  function showError() {
    weatherInfo.classList.add("hidden");
    errorMessage.classList.remove("hidden");
  }

  function getLocalTime(dt, timezone) {
    const localTime = new Date((dt + timezone) * 1000);
    return localTime.toUTCString().split(" ")[4]; // HH:MM:SS
  }

  function setDynamicBackground(condition) {
    const bg = document.querySelector(".background");
    let color;

    switch (condition) {
      case "clear":
        color = "linear-gradient(to right, #fceabb, #f8b500)";
        break;
      case "clouds":
        color = "linear-gradient(to right, #bdc3c7, #2c3e50)";
        break;
      case "rain":
      case "drizzle":
        color = "linear-gradient(to right, #4b79a1, #283e51)";
        break;
      case "thunderstorm":
        color = "linear-gradient(to right, #141e30, #243b55)";
        break;
      case "snow":
        color = "linear-gradient(to right, #e0eafc, #cfdef3)";
        break;
      case "mist":
      case "fog":
        color = "linear-gradient(to right, #757f9a, #d7dde8)";
        break;
      default:
        color = "linear-gradient(to right, #1e1e1e, #3b3b3b)";
    }

    bg.style.background = color;
  }
});
