import React from 'react'
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-md rounded-xl  overflow-hidden">
        <div className="p-8 md:p-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Order Packing Management System
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your fulfillment process with real-time order tracking and inventory management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition duration-300 shadow-lg hover:shadow-xl">
              Get Started
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-6 text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Inventory Management</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Automated Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home