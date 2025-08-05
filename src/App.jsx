import React from 'react'
import Navbar from './components/Navbar'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import Homepage from './pages/Home'
import PackingPage from './pages/PackingPage'
import FetchOrders from './pages/FetchOrders'
import Manifest from './pages/Manifest'
import UploadOrders from './pages/UploadOrders'
import Orders from './pages/Orders'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/packing" element={<PackingPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/manifest" element={<Manifest />} />
        <Route path='/upload' element={<UploadOrders />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App