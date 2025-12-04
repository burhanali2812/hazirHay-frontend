import "./App.css";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-toastify/dist/ReactToastify.css";

import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect} from "react";
import AiChat from "./pages/AiChat";
import MyShopServices from "./pages/MyShopServices";
import PrivacyPolicies from "./pages/PrivacyPolicies";
import LocalShopSignup from "./pages/LocalShopSignup";
import UnVarifiedShop from "./pages/UnVarifiedShop";
import Roles from "./pages/Roles";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Main = lazy(() => import("./pages/Main"));
const Signup = lazy(() => import("./pages/Signup"));
const ShopForm = lazy(() => import("./pages/ShopForm"));
const Requests = lazy(() => import("./pages/Requests"));
const Users = lazy(() => import("./pages/Users"));
const ShopKepperDashboard = lazy(() => import("./pages/ShopKepperDashboard"));
const ShopkepperRequests = lazy(() => import("./pages/ShopkepperRequests"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const FindShops = lazy(() => import("./pages/FindShops"));
const Notification = lazy(() => import("./pages/Notification"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const MyShop = lazy(() => import("./pages/MyShop"));
const Blocked = lazy(() => import("./pages/Blocked"));
const WorkerSignup = lazy(() => import("./pages/WorkerSignup"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const WorkersPage = lazy(() => import("./pages/WorkersPage"));
const ViewLocalShop = lazy(() => import("./pages/ViewLocalShop"));
const LocalShopDashboard = lazy(() => import("./pages/Local_Shop_Dashboard"));


// Components
const Cart = lazy(() => import("./components/Cart"));
const Tracking = lazy(() => import("./components/Tracking"));
const OrderWithJourney = lazy(() => import("./components/OrderWithJourney"));
const AdminFooter1 = lazy(() => import("./components/AdminFooter1"));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (
      token &&
      role &&
      (location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/signup")
    ) {
      if (role === "shopKepper") {
        navigate("/admin/shopKepper/dashboard");
      } else if (role === "user") {
        navigate("/admin/user/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "worker") {
        navigate("/worker/dashboard");
      }
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Suspense fallback={
         <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
          style={{ zIndex: 1055 }}
        >
          <button className="btn btn-dark" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </button>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />}></Route>
          <Route path="/roles" element={<Roles />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/shop" element={<ShopForm />}></Route>
          <Route path="/localShopSignup" element={<LocalShopSignup />}></Route>
          <Route path="/privacyPolicies" element={<PrivacyPolicies />}></Route>
          <Route
            path="shopKepper/sh&BlTr&bl&5&comp&shbl&tr"
            element={<Blocked />}
          />
           <Route
            path="/shopKepper/sh&un&Ve&ri&fi&ed@sh@op$"
            element={<UnVarifiedShop />}
          />
          <Route path="worker/dashboard" element={<WorkerDashboard />} />
          <Route path="unauthorized/user" element={<UnauthorizedPage />} />
          <Route path="/admin/*" element={<AdminFooter1 />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="users" element={<Users />} />

            <Route
              path="shopKepper/dashboard"
              element={<ShopKepperDashboard />}
            />

            <Route path="shopKepper/worker/signup" element={<WorkerSignup />} />
            <Route path="shopKepper/workersList" element={<WorkersPage />} />
            <Route path="shopKepper/shop/services" element={<MyShopServices />} />
            <Route
              path="shopKepper/requests"
              element={<ShopkepperRequests />}
            />
            <Route path="shopKepper/myShop" element={<MyShop />} />
            <Route path="shopKepper/transactions" element={<Transactions />} />

            <Route path="user/dashboard" element={<UserDashboard />} />

            <Route path="user/cart" element={<Cart />} />
            <Route path="user/localShop/viewLocalShop" element={<ViewLocalShop />} />
            <Route path="user/tracking" element={<Tracking />} />
            <Route path="user/findShops" element={<FindShops />} />
            <Route path="user/notification" element={<Notification />} />
            <Route path="user/contact" element={<ContactUs />} />
             <Route path="userAi" element={<AiChat />} />
            <Route
              path="user/orderWithJourney"
              element={<OrderWithJourney />}
            />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
