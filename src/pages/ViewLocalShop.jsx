import React from 'react'
import { useAppContext } from '../context/AppContext';
function ViewLocalShop() {
  const { selectedViewLocalShop } = useAppContext();
  return (
    <div className='container'>
      <h2>View Local Shop</h2>
        {selectedViewLocalShop ? (
           <>
         {/* Hero Banner */}
      <div
        className="position-relative rounded overflow-hidden shadow-sm"
        style={{
          height: "250px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "#6c757d",
        }}
      >
        {selectedViewLocalShop?.shopPicture ? (
          <img
            src={selectedViewLocalShop?.shopPicture}
            alt="Shop Banner"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Shop Banner</span>
        )}
      </div>

      {/* Floating Card */}
      <div
        className="card  shadow-lg"
        style={{
          marginTop: "-40px",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <p>To do work here</p>
        <ol>
            <li>shopNAme with position</li>
               <li>shop description </li>
                  <li>sho contact</li>
                     <li>shop local adddress</li>
                        <li>shop map</li>
                           <li>view on google map</li>
                              <li>shop services</li>
                                 <li>shop menue if available</li>
        </ol>
       
      </div>
      </>
        ) : (
          <p>No shop selected.</p>
        )}
    </div>
  )
}

export default ViewLocalShop
