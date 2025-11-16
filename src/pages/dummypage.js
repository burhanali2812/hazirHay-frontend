 <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/signup"
          element={
            <Signup
              onUserAdded={getAllUser}
              onShopKepperAdded={getAllShopKepper}
            />
          }
        ></Route>
        <Route path="/shop" element={<ShopForm />}></Route>
        <Route
          path="shopKepper/sh&BlTr&bl&5&comp&shbl&tr"
          element={<Blocked />}
        />
        <Route
          path="worker/dashboard"
          element={<WorkerDashboard setUpdateAppjs={setUpdateAppjs} />}
        />
        <Route path="unauthorized/user" element={<UnauthorizedPage />} />
        <Route
          path="/admin/*"
          element={
            <AdminFooter1
              topText={topText}
              setUpdate={setUpdate}
              setShopKepperStatus={setShopKepperStatus}
              unSeenNotification={unSeenNotification}
              onUpdate={updateNotification}
              cartData={cartData}
              shopKepperStatus2={shopKepperStatus2}
              pageKey={key}
            />
          }
        >
          <Route
            path="dashboard"
            element={
              <Dashboard
                setTopText={setTopText}
                totalUser={totalUser}
                totalShopkepper={totalShopkepper}
                totalActiveShopkepper={totalActiveShopkepper}
                totalLiveShopkepper={totalLiveShopkepper}
                setUpdate={setUpdate}
                setUpdateAppjs={setUpdateAppjs}
                setKey={setKey}
              />
            }
          />
          <Route
            path="requests"
            element={
              <Requests
                setTopText={setTopText}
                setUpdate={setUpdate}
                shopWithShopkepper={shopWithShopkepper}
                setKey={setKey}
              />
            }
          />
          <Route
            path="users"
            element={
              <Users
                setTopText={setTopText}
                totalUser={totalUser}
                totalShopkepper={totalShopkepper}
                totalActiveShopkepper={totalActiveShopkepper}
                totalLiveShopkepper={totalLiveShopkepper}
              />
            }
          />

          <Route
            path="shopKepper/dashboard"
            element={
              <ShopKepperDashboard
                setUpdateAppjs={setUpdateAppjs}
                setKey={setKey}
              />
            }
          />

          <Route
            path="shopKepper/worker/signup"
            element={<WorkerSignup setUpdateAppjs={setUpdateAppjs} />}
          />
          <Route
            path="shopKepper/workersList"
            element={
              <WorkersPage
                shopKepperWorkers={shopKepperWorkers}
                setShopKepperWorkers={setShopKepperWorkers}
              />
            }
          />
          <Route
            path="shopKepper/requests"
            element={
              <ShopkepperRequests
                shopKepperStatus={shopKepperStatus}
                refreshFlag={refreshFlag}
                setRefreshFlag={setRefreshFlag}
                shopKepperWorkers={shopKepperWorkers}
                setKey={setKey}
              />
            }
          />
          <Route
            path="shopKepper/myShop"
            element={<MyShop setKey={setKey} />}
          />
          <Route path="shopKepper/transactions" element={<Transactions />} />

          <Route
            path="user/dashboard"
            element={
              <UserDashboard
                setUpdateAppjs={setUpdateAppjs}
                cartData={cartData}
                areaName={areaName}
                setAreaName={setAreaName}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
                setKey={setKey}
              />
            }
          />

          <Route
            path="user/cart"
            element={
              <Cart
                cartData={cartData}
                setRefreshFlag={setRefreshFlag}
                setUpdateAppjs={setUpdateAppjs}
                areaName={areaName}
                coordinates={coordinates}
                setCartData={setCartData}
                setKey={setKey}
              />
            }
          />
          <Route
            path="user/tracking"
            element={
              <Tracking setUpdateAppjs={setUpdateAppjs} setKey={setKey} />
            }
          />
          <Route path="user/findShops" element={<FindShops />} />
          <Route
            path="user/notification"
            element={
              <Notification
                notification={notification}
                onDelete={deleteNotification}
                setNotification={setNotification}
                setUnSeenNotification={setUnSeenNotification}
                setKey={setKey}
              />
            }
          />
          <Route path="user/contact" element={<ContactUs />} />
          <Route
            path="user/orderWithJourney"
            element={<OrderWithJourney setStausUpdate={setStausUpdate} />}
          />
        </Route>
      </Routes>
    </>