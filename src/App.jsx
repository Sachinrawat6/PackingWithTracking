import React from 'react'
import Navbar from './components/Navbar'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import Homepage from './pages/Home'
import PackingPage from './pages/PackingPage'
import FetchOrders from './pages/FetchOrders'
import Manifest from './pages/Manifest'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/packing" element={<PackingPage />} />
        <Route path="/orders" element={<FetchOrders />} />
        <Route path="/manifest" element={<Manifest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App