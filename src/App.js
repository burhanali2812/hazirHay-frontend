
import './App.css';
import AdminFooter1 from './components/AdminFooter1';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Main from './pages/Main';
import {Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import ShopForm from './pages/ShopForm';

function App() {
  return (
   <>
   
      <Routes>
        <Route path="/" element={<Main/>} />
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/shop" element={<ShopForm/>}></Route>
        <Route path="/admin/*" element={<AdminFooter1 />}>
        <Route path="dashboard" element={<Dashboard />}/>
       
        </Route>
      </Routes>
   
 
   </>
  );
}

export default App;
