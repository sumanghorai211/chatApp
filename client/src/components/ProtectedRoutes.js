import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoutes({ children }) {
  const navigate = useNavigate();
  const id = localStorage.getItem("token");

  useEffect(() => {
    if (!id) {
      navigate("/email");
    }
  }, [id, navigate]);

  if (!id) {
    return null; // Return null to avoid rendering children
  } else {
    return children;
  }
}

export default ProtectedRoutes;
