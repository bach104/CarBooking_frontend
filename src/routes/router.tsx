import { createHashRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import BookRide from "../pages/BookRide";
import Confirmation from "../pages/Confirmation";
import MyTrips from "../pages/MyTrips";
import StaffDashboard from "../pages/Staff/StaffDashboard";
import StaffLogin from "../pages/Staff/StaffLogin";
import StaffRegister from "../pages/Staff/StaffRegister";
import DriverDashboard from "../pages/Driver/DriverDashboard";
import DriverRegister from "../pages/Driver/DriverRegister";
import DriverLogin from "../pages/Driver/DriverLogin";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "book-ride", element: <BookRide /> },
      { path: "confirmation", element: <Confirmation /> },
      { path: "my-trips", element: <MyTrips /> },
    ],
  },
  // Staff routes
  { path: "staff-login", element: <StaffLogin /> },
  { path: "staff-register", element: <StaffRegister /> },
  { path: "staff-dashboard", element: <StaffDashboard /> },
  
  // Driver routes
  { path: "driver-login", element: <DriverLogin /> },
  { path: "driver-register", element: <DriverRegister /> },
  { path: "driver-dashboard", element: <DriverDashboard /> },
]);

export default router;