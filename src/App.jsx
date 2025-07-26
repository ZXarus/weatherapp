import React from 'react'
import Weather from './components/Weather'
import background from './assets/background.jpg'

const App = () => {
  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
        color: 'white'
      }}
    >
      
      <h1 className="title"> ZXARUS </h1>
      <Weather />
    </div>
  )
}

export default App
