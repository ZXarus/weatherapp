import React, { useEffect, useRef, useState } from 'react';
import './Weather.css';
import humidity_icon from '../assets/humidity.png';
import wind_icon from '../assets/wind.png';
import clear_night_icon from '../assets/01n@2x.png';
import few_clouds_night_icon from '../assets/02n@2x.png';
import scattered_clouds_night_icon from '../assets/03n@2x.png';
import shower_rain_night_icon from '../assets/09n@2x.png';
import thunderstorm_icon from '../assets/11d@2x.png';
import snow_icon from '../assets/13d@2x.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import clear_icon from '../assets/clear.png';
import { motion, AnimatePresence } from 'framer-motion';

function Weather() {
  const inputRef = useRef();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]); // 🔁 Added for 5-day forecast
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState('#fff');
  const [recentSearches, setRecentSearches] = useState([]);
  const [quote, setQuote] = useState('');

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_night_icon,
    "02d": cloud_icon,
    "02n": few_clouds_night_icon,
    "03d": cloud_icon,
    "03n": scattered_clouds_night_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": shower_rain_night_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "11d": thunderstorm_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const changeBackground = (temp, isNight) => {
    let color;
    if (temp < 10) {
      color = isNight ? "#0D47A1" : "#4FC3F7";
    } else if (temp < 20) {
      color = isNight ? "#1E88E5" : "#64B5F6";
    } else if (temp < 30) {
      color = isNight ? "#388E3C" : "#81C784";
    } else if (temp < 40) {
      color = isNight ? "#BF360C" : "#FF8F00";
    } else {
      color = isNight ? "#B71C1C" : "#E53935";
    }
    setBgColor(color);
  };

  const quotes = [
    "Weather is a great metaphor for life – it’s unpredictable.",
    "There is no such thing as bad weather, only different kinds of good weather.",
    "Sunshine is delicious, rain is refreshing, wind braces us up.",
    "Some people feel the rain. Others just get wet.",
    "Climate is what we expect, weather is what we get.",
    "Rain is grace; rain is the sky descending to the earth.",
    "Wherever you go, no matter what the weather, always bring your own sunshine.",
    "Nature is so powerful, so strong. Capturing its essence is not easy."
  ];

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const clearCookies = () => {
    document.cookie = 'lat=; path=/; max-age=0';
    document.cookie = 'lon=; path=/; max-age=0';
  };

  const resetLocation = () => {
    clearCookies();
    setWeatherData(null);
    setForecastData([]);
    setSearchInput('');
    setDebouncedSearch('');
    setQuote('');
  };

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveToRecentSearches = (city) => {
    let updated = [...recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase())];
    updated.unshift(city);
    if (updated.length > 5) updated = updated.slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Location data not found.");
        return;
      }

      const isNight = data.weather[0]?.icon?.includes('n');
      const icon = allIcons[data.weather[0]?.icon] || cloud_icon;

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon
      });

      changeBackground(data.main.temp, isNight);

      // 🔁 Fetch 5-day forecast after fetching current weather data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const forecastRes = await fetch(forecastUrl);
      const forecastJson = await forecastRes.json();

      if (forecastRes.ok) {
        const dailyForecasts = forecastJson.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
        setForecastData(dailyForecasts);
      }
      const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);


    } catch (error) {
      console.error("Error fetching weather by coords", error);
    } finally {
      setLoading(false);
    }
  };

  const search = async (city) => {
    if (city.trim() === "") return;
    setLoading(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const isNight = data.weather[0]?.icon?.includes('n');
      const defaultIcon = isNight ? clear_night_icon : clear_icon;
      const icon = allIcons[data.weather[0]?.icon] || defaultIcon;

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon
      });

      changeBackground(data.main.temp, isNight);
      saveToRecentSearches(data.name);

      if (data.coord?.lat && data.coord?.lon) {
        document.cookie = `lat=${data.coord.lat}; path=/; max-age=86400`;
        document.cookie = `lon=${data.coord.lon}; path=/; max-age=86400`;
      }

      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);

      // 🔁 Fetch 5-day forecast after fetching current weather data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const forecastRes = await fetch(forecastUrl);
      const forecastJson = await forecastRes.json();

      if (forecastRes.ok) {
        const dailyForecasts = forecastJson.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
        setForecastData(dailyForecasts);
      }

    } catch (error) {
      setWeatherData(null);
      console.error("Error in fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch) {
        search(debouncedSearch);
      }
    }, 700);
    return () => clearTimeout(handler);
  }, [debouncedSearch]);

  const getWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        document.cookie = `lat=${latitude}; path=/; max-age=86400`;
        document.cookie = `lon=${longitude}; path=/; max-age=86400`;
        fetchWeatherByCoords(latitude, longitude); // Fetch current weather and forecast
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleRecentClick = (city) => {
    setSearchInput(city);
    setDebouncedSearch(city);
  };

  useEffect(() => {
    const lat = getCookie('lat');
    const lon = getCookie('lon');
    if (lat && lon) {
      fetchWeatherByCoords(lat, lon); // Fetch weather and forecast by location on page load
    }
  }, []);

  return (
    <motion.div className='weather' style={{ backgroundColor: bgColor, alignItems: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <motion.div className='search-b0x' initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <input
          ref={inputRef}
          type='text'
          placeholder='Search'
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setDebouncedSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setDebouncedSearch(searchInput);
            }
          }}
        />
      </motion.div>

      <motion.button
        style={{
          marginTop: '10px',
          padding: '8px 14px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
        onClick={getWeatherByLocation}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Use My Location
      </motion.button>

      <motion.button
        style={{
          marginTop: '10px',
          padding: '8px 14px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
        onClick={resetLocation}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Reset Location
      </motion.button>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <motion.div style={{ marginTop: '10px', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <strong style={{ color: 'white' }}>Recent:</strong>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
            {recentSearches.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleRecentClick(city)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quote */}
      {quote && (
        <motion.p style={{ color: 'white', marginTop: '15px', fontStyle: 'italic' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          "{quote}"
        </motion.p>
      )}

      {loading && <motion.p animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>Loading...</motion.p>}

      {weatherData && (
        <AnimatePresence>
          <motion.div
            key="weather"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <img src={weatherData.icon} alt='' className='weather-icon' />
            <p className='temperature'>{weatherData.temperature}°C</p>
            <p className='location'>{weatherData.location}</p>
            <div className='weather-data'>
              <div className="col">
                <img src={humidity_icon} alt="" />
                <div>
                  <p>{weatherData.humidity}%</p>
                  <span>Humidity</span>
                </div>
              </div>
              <div className="col">
                <img src={wind_icon} alt="" />
                <div>
                  <p>{weatherData.windSpeed}Km/H</p>
                  <span>Wind Speed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* 5-Day Forecast */}
      {forecastData.length > 0 && (
        <motion.div className="forecast-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 style={{ color: 'white', textAlign: 'center' }}>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecastData.map((item, idx) => (
              <div key={idx} className="forecast-item">
                <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
                <img src={allIcons[item.weather[0].icon] || cloud_icon} alt="icon" />
                <p>{Math.round(item.main.temp)}°C</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Weather;
