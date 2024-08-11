import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout, setOnlineUser, setUser } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo.png";
import io from "socket.io-client";

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [socketConnection, setSocketConnection] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
      const response = await axios({
        url: URL,
        method: "GET", // Use GET method
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token in the headers
        },
      });

      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
      }
      console.log("Current user Details:", response.data.data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, navigate]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket", "polling"], // Allow fallback to polling
      reconnectionAttempts: 5, // Number of reconnection attempts
      timeout: 10000, // Connection timeout (10 seconds)
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.warn("Socket disconnected. Attempting to reconnect...");
    });

    socket.on("onlineUser", (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });

    setSocketConnection(socket);

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const basePath = location.pathname === "/";
  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div
        className={`justify-center items-center flex-col gap-2 hidden ${
          !basePath ? "hidden" : "lg:flex"
        }`}
      >
        <div>
          <img src={logo} width={250} alt="logo" />
        </div>
        <p className="text-lg mt-2 text-slate-500">
          Select user to send a message
        </p>
      </div>
    </div>
  );
};

export default Home;
