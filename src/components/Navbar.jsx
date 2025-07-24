import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-600 shadow-lg"> {/* Changed from transparent to solid color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-white font-bold text-xl"
            >
              Packing App
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/orders"
              className="text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300"
            >
              Orders
            </Link>
            <Link
              to="/packing"
              className="text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300"
            >
              Packing
            </Link>
            <Link
              to="/manifest"
              className="text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300"
            >
              Manifest

            </Link>

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none transition-all duration-300"
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
        <div className="md:hidden px-4 pb-3 pt-2 space-y-1 bg-blue-600">
          <Link
            to="/packing"
            className="block px-3 py-3 rounded-md text-white hover:bg-blue-700 transition-all duration-300"
            onClick={() => setOpen(false)}
          >
            Packing
          </Link>
          <Link
            to="/manifest"
            className="block px-3 py-3 rounded-md text-white hover:bg-blue-700 transition-all duration-300"
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