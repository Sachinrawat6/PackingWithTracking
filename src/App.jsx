import React from 'react'
import Navbar from './components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Home'
import PackingPage from './pages/PackingPage'
import FetchOrders from './pages/FetchOrders'
import Manifest from './pages/Manifest'
import UploadOrders from './pages/UploadOrders'
import Orders from './pages/Orders'
import PrivateRoute from './components/PrivateRoute'
import Register from './components/Register'
import Login from './components/Login'
import Tag from './pages/Tag'



const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/manifest" element={<Manifest />} />
          <Route path="/upload" element={<UploadOrders />} />
          <Route path='/tag' element={<Tag />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
