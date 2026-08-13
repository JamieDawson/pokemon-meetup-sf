import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { WhosThatPokemonPage } from './pages/WhosThatPokemonPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/whos-that-pokemon" element={<WhosThatPokemonPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
