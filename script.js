document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "5f56d525d1619d0a2cd2eac4ce55588e";

  const cityInput = document.getElementById("city-input");
  const getWeatherBtn = document.getElementById("get-weather-btn");
  const toggleUnitBtn = document.getElementById("toggle-unit");
  const weatherInfo = document.getElementById("weather-info");
  const cityNameDisplay = document.getElementById("city-name");
  const temperatureDisplay = document.getElementById("temperature");
  const descriptionDisplay = document.getElementById("description");
  const iconDisplay = document.getElementById("icon");
  const localTimeDisplay = document.getElementById("local-time");
  const errorMessage = document.getElementById("error-message");
  const themeToggleBtn = document.getElementById("toggle-theme");
  const loadingSpinner = document.getElementById("loading");
  const forecastContainer = document.getElementById("forecast");
  const forecastCards = document.getElementById("forecast-cards");
  const tipText = document.getElementById("tip-text");
  const tipContainer = document.getElementById("weather-tip");

  let isCelsius = true;
  const html = document.documentElement;

  // Load theme
  html.dataset.theme = localStorage.getItem("theme") || "dark";
  themeToggleBtn.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", html.dataset.theme);
  });

  getWeatherBtn.addEventListener("click", handleWeather);
  toggleUnitBtn.addEventListener("click", () => {
    isCelsius = !isCelsius;
    if (lastWeatherData) displayWeatherData(lastWeatherData);
  });

  cityInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleWeather();
  });

  let lastWeatherData = null;

  async function handleWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    weatherInfo.classList.add("hidden");
    errorMessage.classList.add("hidden");
    forecastContainer.classList.add("hidden");
    tipContainer.classList.add("hidden");
    loadingSpinner.classList.remove("hidden");

    try {
      const data = await fetchWeatherData(city);
      const forecast = await fetchForecastData(city);
      displayWeatherData(data);
      displayForecastData(forecast);
    } catch (error) {
      showError();
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  }

  async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    return await res.json();
  }

  async function fetchForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Forecast not found");
    return await res.json();
  }

  function displayWeatherData(data) {
    lastWeatherData = data;
    const { name, main, weather, timezone, dt } = data;
    const tempC = main.temp;
    const temp = isCelsius
      ? `${tempC.toFixed(1)} °C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)} °F`;

    cityNameDisplay.textContent = name;
    temperatureDisplay.textContent = `🌡 Temperature: ${temp}`;
    descriptionDisplay.textContent = `🌤 Weather: ${weather[0].description}`;
    iconDisplay.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" />`;

    const localTime = getLocalTime(dt, timezone);
    localTimeDisplay.textContent = `🕒 Local Time: ${localTime}`;

    setDynamicBackground(weather[0].main.toLowerCase());
    startWeatherTips(weather[0].main.toLowerCase());

    weatherInfo.classList.remove("hidden");
    tipContainer.classList.remove("hidden");
  }

  function displayForecastData(forecast) {
    forecastCards.innerHTML = "";
    const dailyMap = new Map();

    forecast.list.forEach(entry => {
      const date = entry.dt_txt.split(" ")[0];
      if (!dailyMap.has(date)) dailyMap.set(date, entry);
    });

    for (let [date, entry] of [...dailyMap.entries()].slice(0, 5)) {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const temp = isCelsius
        ? `${entry.main.temp.toFixed(0)}°C`
        : `${((entry.main.temp * 9) / 5 + 32).toFixed(0)}°F`;

      card.innerHTML = `
        <h4>${new Date(date).toDateString().split(" ").slice(0, 3).join(" ")}</h4>
        <img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="${entry.weather[0].main}" />
        <p>${temp}</p>
        <p>${entry.weather[0].main}</p>
      `;
      forecastCards.appendChild(card);
    }

    forecastContainer.classList.remove("hidden");
  }

  function getLocalTime(dt, timezone) {
    const localTime = new Date((dt + timezone) * 1000);
    return localTime.toUTCString().split(" ")[4];
  }

  function showError() {
    errorMessage.classList.remove("hidden");
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

  const tips = {
    clear: [
      "😎 Don’t forget your shades – the sun called in!",
      "☀️ Sunscreen now, lobster later.",
      "🐱 A purr-fect day to nap in the sun!"
    ],
    clouds: [
      "🌥 Overcast? Perfect time to overthink things!",
      "☁️ Those clouds aren't judging you. Maybe.",
      "🧁 Cloudy days are for cake. Science says so."
    ],
    rain: [
      "☔ Dance like no one's watching – but bring an umbrella just in case.",
      "🦆 It's a quack-tastic day!", 
      "🌧 Smell that rain? That’s nature’s cologne."
    ],
    drizzle: [
      "🌦 Meh rain. Still counts as an excuse for hot chocolate.",
      "🍜 Soup weather activated.",
      "🌂 Keep calm and carry a tiny umbrella."
    ],
    thunderstorm: [
      "⚡ Zeus is angry. Stay indoors.",
      "⛈ Time to binge that show you lied about watching.",
      "📺 Thunderstorms = cozy chaos."
    ],
    snow: [
      "☃️ Build a snowman. Name it Gary.",
      "❄️ Catch snowflakes on your tongue (but not yellow ones).",
      "🔥 Stay warm. Be the burrito."
    ],
    mist: [
      "🌫 Mysterious weather = mysterious vibes.",
      "🧟 If zombies appear, act natural.",
      "🔦 Keep your flashlight handy... just in case."
    ],
    fog: [
      "👓 Foggy? Pretend you're in a movie intro.",
      "🚗 Fog lights ON. Eyes forward.",
      "🎬 This is your moody cinematic moment."
    ]
  };

  function startWeatherTips(condition) {
    const selectedTips = tips[condition] || tips.clear;
    const randomIndex = Math.floor(Math.random() * selectedTips.length);

    tipText.textContent = "";
    tipText.style.animation = "none";
    tipText.offsetHeight; // trigger reflow
    tipText.style.animation = null;

    tipText.textContent = selectedTips[randomIndex];
  }
});
