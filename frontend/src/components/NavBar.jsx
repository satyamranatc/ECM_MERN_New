import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Sparkles,
  Layers
} from 'lucide-react'

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-all duration-200 py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
      isActive
        ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
    }`

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 group-hover:scale-105 transition-all duration-200">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                Cart<span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Nest</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase -mt-0.5">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              <Layers className="w-4 h-4 text-teal-600" />
              All Products
            </NavLink>
          </nav>

          {/* Desktop Right Action / Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 group"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {/* Vibrant Teal Notification Badge */}
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-teal-500 rounded-full px-1 shadow-xs ring-2 ring-white">
                0
              </span>
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* Clerk Authentication States */}
            <div id="nav-auth-section" className="flex items-center gap-2.5">
              <Show when="signed-in">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Account</span>
                </Link>

                <div className="flex items-center pl-1">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 ring-2 ring-indigo-500/20 hover:ring-indigo-500 transition-all"
                      }
                    }}
                  />
                </div>
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="cursor-pointer text-sm font-medium text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-all">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 px-4 py-2 rounded-xl shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 active:scale-[0.98]">
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                    <span>Get Started</span>
                  </button>
                </SignUpButton>
              </Show>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-slate-600 hover:text-indigo-600"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white bg-teal-500 rounded-full ring-2 ring-white">
                0
              </span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              All Products
            </NavLink>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <Show when="signed-in">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>My Profile & Orders</span>
              </Link>
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Account</span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>

            <Show when="signed-out">
              <div className="grid grid-cols-2 gap-2 pt-1">
                <SignInButton mode="modal">
                  <button className="w-full cursor-pointer text-center text-sm font-medium text-slate-700 border border-slate-200 py-2 rounded-xl hover:bg-slate-50 transition-all">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="w-full cursor-pointer text-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-teal-600 py-2 rounded-xl shadow-xs transition-all">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      )}
    </header>
  )
}
