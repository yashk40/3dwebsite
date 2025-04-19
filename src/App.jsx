import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ModelViewer from './Model'
import Navbar from './Navbar'
import OptimizedModelLoader from './loader'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <OptimizedModelLoader/>
    </>
  )
}

export default App
