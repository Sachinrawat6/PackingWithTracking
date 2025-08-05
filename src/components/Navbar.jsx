import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-black shadow-xl border-b border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-white font-bold text-xl hover:text-red-500 transition-colors duration-300"
            >
              <span className="text-red-600">Packing</span> App
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/upload"
              className="text-white hover:bg-red-600 px-4 py-2 rounded-md transition-all duration-300 font-medium"
            >
              Upload
            </Link>
            <Link
              to="/packing"
              className="text-white hover:bg-red-600 px-4 py-2 rounded-md transition-all duration-300 font-medium"
            >
              Packing
            </Link>
            <Link
              to="/orders"
              className="text-white hover:bg-red-600 px-4 py-2 rounded-md transition-all duration-300 font-medium"
            >
              Orders
            </Link>
            <Link
              to="/manifest"
              className="text-white hover:bg-red-600 px-4 py-2 rounded-md transition-all duration-300 font-medium"
            >
              Manifest
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-red-600 focus:outline-none transition-all duration-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden px-4 pb-3 pt-2 space-y-1 bg-black border-t border-red-600">
          <Link
            to="/upload"
            className="block px-3 py-3 rounded-md text-white hover:bg-red-600 transition-all duration-300 font-medium"
            onClick={() => setOpen(false)}
          >
            Upload
          </Link>
          <Link
            to="/packing"
            className="block px-3 py-3 rounded-md text-white hover:bg-red-600 transition-all duration-300 font-medium"
            onClick={() => setOpen(false)}
          >
            Packing
          </Link>
          <Link
            to="/orders"
            className="text-white hover:bg-red-600 px-4 py-2 rounded-md transition-all duration-300 font-medium"
          >
            Orders
          </Link>
          <Link
            to="/manifest"
            className="block px-3 py-3 rounded-md text-white hover:bg-red-600 transition-all duration-300 font-medium"
            onClick={() => setOpen(false)}
          >
            Manifest
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;