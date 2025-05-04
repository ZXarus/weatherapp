import React from 'react'
import Weather from './components/Weather'
import background from './assets/background.jpeg'

const App = () => {
  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="title">Team Shamrock</h1>
      <Weather />
    </div>
  )
}

export default App
