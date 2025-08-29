import axios from 'axios'
import React, { useEffect , useState} from 'react'

function ShopKepperDashboard({setUpdate, shopKepperStatus, setUpdateAppjs}) {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const token = localStorage.getItem("token")

useEffect(()=>{
setUpdateAppjs(true)
},[])

 



  return (
    <div>
      <h2>{shopKepperStatus ? ("I am Online") : ("I am Offline")}</h2>

                
    </div>
  )
}

export default ShopKepperDashboard
