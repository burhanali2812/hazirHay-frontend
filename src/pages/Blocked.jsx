import React from 'react'
import { useNavigate } from 'react-router-dom';

function Blocked() {
    const navigate = useNavigate();
      const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("key");
    localStorage.removeItem("shopKepperStatus");
    navigate("/login");
  };
  return (
    <div>    <button className='btn btn-danger' onClick={logOut}>Log Out</button>
</div>
  )
}

export default Blocked