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
    const [loading, setLoading] = useState(false);
    const [bgColor, setBgColor] = useState('#fff');
    const [recentSearches, setRecentSearches] = useState([]);

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
            color = isNight ? "#0e3482" : "#00509E";
        } else if (temp < 20) {
            color = isNight ? "#12274A" : "#4A90E2";
        } else if (temp < 30) {
            color = isNight ? "#1C3D2C" : "#28A745";
        } else if (temp < 40) {
            color = isNight ? "#9A5900" : "#F39C12";
        } else {
            color = isNight ? "#5B0E0E" : "#D7263D";
        }
        setBgColor(color);
    };

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
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
                fetchWeatherByCoords(latitude, longitude);
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
            fetchWeatherByCoords(lat, lon);
        }
    }, []);

    return (
        <motion.div
            className='weather'
            style={{ backgroundColor: bgColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className='search-b0x'>
                <input
                    ref={inputRef}
                    type='text'
                    placeholder='Search'
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setDebouncedSearch(e.target.value);
                    }}
                />
            </div>
            <button className='location-btn' onClick={getWeatherByLocation}>Use My Location</button>

            {recentSearches.length > 0 && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
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
                </div>
            )}

            {loading && <p>Loading...</p>}

            <AnimatePresence>
                {weatherData && (
                    <motion.div
                        key="weather"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
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
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Weather;