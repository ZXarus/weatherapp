import React, {  useEffect,useRef, useState } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import humidity_icon from '../assets/humidity.png'
import wind_icon from '../assets/wind.png'
import clear_night_icon from '../assets/01n@2x.png';
import few_clouds_night_icon from '../assets/02n@2x.png';
import scattered_clouds_night_icon from '../assets/03n@2x.png';
import shower_rain_night_icon from '../assets/09n@2x.png';
import thunderstorm_icon from '../assets/11d@2x.png';
import snow_icon from '../assets/13d@2x.png';
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import clear_icon from '../assets/clear.png'

function Weather() {
    const inputRef = useRef() 
    const [weatherData, SetWeatherData] = useState(false)
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
        "50d": cloud_icon,
        "50n": scattered_clouds_night_icon,
    }
    const search = async (city) => {
        if(city ===""){
            alert("Enter City Name");
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&limit=1&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url)
            const data = await response.json()
            if (!data || !data.main || !data.weather) {
                alert("City not found or invalid data.");
                return;
            }
            console.log(data)
            console.log('API Key:', import.meta.env.VITE_APP_ID);
            const icon = allIcons[data.weather[0]?.icon] || cloud_icon;
            SetWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon
            })
        }
        catch (error) {
            SetWeatherData(false);
            console.error("error in fetching data");
        }
    }
    return (
        <div className='weather'>
            <div className='search-b0x'>
                <input ref = {inputRef} type='text' placeholder='search' />
                <img src={search_icon} alt="" onClick={()=>search(inputRef.current.value)} />
            </div>
            {weatherData?<>
            <img src={weatherData.icon} alt='' className='weather-icon' />
            
            <p className='temperature'>{weatherData.temperature}°C</p>
            <p className='location'> {weatherData.location}</p>
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
            </>:<></>}
            
        </div>
    )
}

export default Weather