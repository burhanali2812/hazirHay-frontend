import React from 'react'
import offline from "../images/offline.png"
function ShopkepperRequests({shopKepperStatus}) {
  return (
    <div>
      
      {shopKepperStatus ? ("i am online"): (
         <div
                      className="d-flex flex-column justify-content-center align-items-center text-center"
                      style={{ height: "65vh" }}
                    >
                      <img
                        src={offline}
                        alt="No Data"
                        className="mb-3"
                        style={{ width: "180px", height: "auto" }}
                      />
                      <h4 className="fw-bold text-warning mb-2">Sorry You're Currently Offline!</h4>
                      <p
                        className="text-muted"
                        style={{ maxWidth: "380px", fontSize: "15px" }}
                      >
                       To go online and start receiving requests, just press the red <strong>Offline</strong> button at the top right corner.

                      </p>
                    </div>
      )}
    </div>
  )
}

export default ShopkepperRequests
