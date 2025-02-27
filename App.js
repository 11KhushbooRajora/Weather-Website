import React, { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

// Weather Dashboard with Enhanced UI
function WeatherDashboard() {
  const [location, setLocation] = useState({ 
    latitude: 40.7128, // Default to New York City
    longitude: -74.0060,
    name: "New York City"
  });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        const response = await fetch(
          https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability,weathercode&daily=sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto
        );
        
        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }
        
        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, [location]);

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!weatherData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
            <WeatherIcon 
              weatherCode={weatherData.current_weather.weathercode} 
              temperature={weatherData.current_weather.temperature}
              className="mr-4 text-5xl"
            />
            {location.name} Weather
          </h1>
          <LocationSearch 
            onLocationChange={handleLocationChange} 
            className="w-full max-w-md"
          />
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Current Weather Card */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl transform transition hover:scale-105">
            <h2 className="text-2xl font-semibold mb-4 text-white">Current Conditions</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-6xl font-bold">
                  {weatherData.current_weather.temperature}°C
                </p>
                <p className="text-white/80 text-lg">
                  Wind: {weatherData.current_weather.windspeed} km/h
                </p>
              </div>
              <WeatherIcon 
                weatherCode={weatherData.current_weather.weathercode} 
                temperature={weatherData.current_weather.temperature}
                className="text-8xl"
              />
            </div>
          </div>

          {/* Daily Forecast Card */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl transform transition hover:scale-105">
            <h2 className="text-2xl font-semibold mb-4 text-white">Daily Overview</h2>
            <div className="space-y-2">
              <ForecastDetail 
                label="Max Temperature" 
                value={${weatherData.daily.temperature_2m_max[0]}°C} 
                icon="🔥"
              />
              <ForecastDetail 
                label="Min Temperature" 
                value={${weatherData.daily.temperature_2m_min[0]}°C} 
                icon="❄️"
              />
              <ForecastDetail 
                label="UV Index" 
                value={weatherData.daily.uv_index_max[0]} 
                icon="☀️"
              />
              <ForecastDetail 
                label="Sunrise" 
                value={new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                icon="🌅"
              />
              <ForecastDetail 
                label="Sunset" 
                value={new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                icon="🌇"
              />
            </div>
          </div>

          {/* Humidity and Wind Card */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl transform transition hover:scale-105">
            <h2 className="text-2xl font-semibold mb-4 text-white">Additional Details</h2>
            <div className="space-y-2">
              <ForecastDetail 
                label="Humidity" 
                value={${weatherData.hourly.relativehumidity_2m[0]}%} 
                icon="💧"
              />
              <ForecastDetail 
                label="Precipitation" 
                value={${weatherData.hourly.precipitation_probability[0]}%} 
                icon="🌧️"
              />
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                <span className="text-lg">🍃 Wind Direction</span>
                <span className="font-bold">
                  {getWindDirection(weatherData.current_weather.windspeed)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="mt-8 bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-white">Hourly Forecast</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {weatherData.hourly.time.slice(0, 12).map((time, index) => (
              <HourlyForecastCard 
                key={time}
                time={time}
                temperature={weatherData.hourly.temperature_2m[index]}
                precipitation={weatherData.hourly.precipitation_probability[index]}
                weatherCode={weatherData.hourly.weathercode[index]}
              />
            ))}
          </div>
        </div>
      </div>
      <footer className="text-center text-white/50 mt-8 text-sm">
        <a 
          href={import.meta.url.replace("esm.town", "val.town")} 
          target="_top" 
          className="hover:underline"
        >
          View Source
        </a>
      </footer>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin text-6xl mb-4">🌀</div>
        <p className="text-2xl">Loading Weather Data...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-2xl">Error: {message}</p>
      </div>
    </div>
  );
}

function LocationSearch({ onLocationChange, className }) {
  const [city, setCity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name } = data.results[0];
        onLocationChange({ latitude, longitude, name });
      }
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={flex ${className}}
    >
      <input 
        type="text" 
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Search City"
        className="flex-grow p-3 bg-white/20 backdrop-blur-lg text-white placeholder-white/50 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white/30"
      />
      <button 
        type="submit" 
        className="bg-white/30 text-white px-6 py-3 rounded-r-lg hover:bg-white/40 transition"
      >
        🔍
      </button>
    </form>
  );
}

function WeatherIcon({ weatherCode, temperature, className = '' }) {
  const getWeatherIcon = () => {
    // Detailed weather code mapping
    const weatherIcons = {
      0: '☀️',   // Clear sky
      1: '🌤️',   // Mainly clear
      2: '⛅',   // Partly cloudy
      3: '☁️',   // Overcast
      45: '🌫️',  // Foggy
      48: '🌫️',  // Depositing rime fog
      51: '🌧️',  // Light drizzle
      53: '🌧️',  // Moderate drizzle
      55: '🌧️',  // Dense drizzle
      61: '🌧️',  // Slight rain
      63: '🌧️',  // Moderate rain
      65: '🌧️',  // Heavy rain
      71: '❄️',  // Slight snow fall
      73: '❄️',  // Moderate snow fall
      75: '❄️',  // Heavy snow fall
      77: '❄️',  // Snow grains
      80: '🌧️',  // Slight rain showers
      81: '🌧️',  // Moderate rain showers
      82: '🌧️',  // Violent rain showers
      85: '❄️',  // Slight snow showers
      86: '❄️',  // Heavy snow showers
      95: '⛈️',  // Thunderstorm
      96: '⛈️',  // Thunderstorm with light hail
      99: '⛈️'   // Thunderstorm with heavy hail
    };

    return weatherIcons[weatherCode] || '🌈';
  };

  return (
    <div className={${className}}>
      {getWeatherIcon()}
    </div>
  );
}

function ForecastDetail({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
      <div className="flex items-center">
        <span className="mr-3 text-xl">{icon}</span>
        <span className="text-lg">{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function HourlyForecastCard({ time, temperature, precipitation, weatherCode }) {
  return (
    <div className="flex-shrink-0 bg-white/20 backdrop-blur-lg p-4 rounded-xl text-center space-y-2 transform transition hover:scale-105">
      <p className="font-semibold">
        {new Date(time).toLocaleTimeString([], {hour: '2-digit'})}
      </p>
      <WeatherIcon 
        weatherCode={weatherCode} 
        temperature={temperature}
        className="text-4xl"
      />
      <p>{temperature}°C</p>
      <p className="text-sm">💧 {precipitation}%</p>
    </div>
  );
}

function getWindDirection(speed) {
  if (speed < 1) return "Calm";
  if (speed < 5) return "Light Breeze";
  if (speed < 11) return "Gentle Breeze";
  if (speed < 19) return "Moderate Breeze";
  if (speed < 28) return "Fresh Breeze";
  if (speed < 38) return "Strong Breeze";
  return "High Wind";
}

function client() {
  createRoot(document.getElementById("root")).render(<WeatherDashboard />);
}

if (typeof document !== "undefined") { client(); }

export default async function server(request: Request): Promise<Response> {
  return new Response(`
    <html>
      <head>
        <title>Advanced Weather Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://esm.town/v/std/catch"></script>
        <style>
          body { 
            margin: 0; 
            font-family: 'Inter', system-ui, sans-serif; 
            overflow-x: hidden;
          }
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}
