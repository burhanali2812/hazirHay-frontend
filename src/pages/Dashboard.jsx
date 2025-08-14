import React, { useEffect } from 'react'

function Dashboard({setTopText}) {

  useEffect(()=>{
    setTopText("Dashboard")
  },[setTopText])
  return (
    <div>
      <h1>Hello i am dashboard</h1>
    </div>
  )
}

export default Dashboard
