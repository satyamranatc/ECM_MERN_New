import React from 'react'

import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";


import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";

import { BrowserRouter,Routes,Route } from 'react-router-dom'




export default function App() 
{
  return (

    <>
    
      <BrowserRouter>
        <NavBar/>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/products' element={<Products/>} />
          <Route path='/products/:id' element={<ProductDetails/>} />
          <Route path='/cart' element={<Cart/>} />
          <Route path='/profile' element={<Profile/>} />
        </Routes>
        <Footer/>
      </BrowserRouter>
    
    
    </>
    
  )
}
