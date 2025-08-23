import axios from 'axios'
import React, { useEffect , useState} from 'react'

function ShopKepperDashboard({setUpdate, shopKepperStatus}) {
    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")



 



  return (
    <div>
      <h2>{shopKepperStatus ? ("I am Online") : ("I am Offline")}</h2>
                
    </div>
  )
}

export default ShopKepperDashboard
