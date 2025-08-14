
import './App.css';
import AdminFooter1 from './components/AdminFooter1';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Main from './pages/Main';
import {Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import ShopForm from './pages/ShopForm';
import Requests from './pages/Requests';
import { useState } from 'react';

function App() {
  const[topText, setTopText] = useState("Hello")
  return (
   <>
   
      <Routes>
        <Route path="/" element={<Main/>} />
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/shop" element={<ShopForm/>}></Route>
        <Route path="/admin/*" element={<AdminFooter1 topText={topText}/>}>
        <Route path="dashboard" element={<Dashboard  setTopText= {setTopText}/>}/>
        <Route path="requests" element={<Requests  setTopText= {setTopText}/>}/>
       
        </Route>
      </Routes>
   
 
   </>
  );
}

export default App;
