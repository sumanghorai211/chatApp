import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../helpers/uploadFile";
import axios from "axios";
import toast from "react-hot-toast";
import backgroundImage from "../assets/background.jpg"; // Update the path

const RegisterPage = () => {
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: "",
  });
  const [uploadPhoto, setUploadPhoto] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];

    const uploadPhoto = await uploadFile(file);

    setUploadPhoto(file);

    setData((preve) => {
      return {
        ...preve,
        profile_pic: uploadPhoto?.url,
      };
    });
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
    setData((preve) => {
      return {
        ...preve,
        profile_pic: "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;

    try {
      const response = await axios.post(URL, data);
      console.log("response", response);

      toast.success(response.data.message);

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: "",
        });

        navigate("/email");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    console.log("data", data);
  };

  const triggerFileUpload = () => {
    document.getElementById("profile_pic").click();
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-lightslategray bg-opacity-10 backdrop-blur-lg rounded-lg p-6 max-w-md w-full shadow-lg">
        <h3 className="text-black text-2xl font-semibold text-center">
          Welcome to Chat App!
        </h3>

        <form className="grid gap-4 mt-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-black">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="bg-white text-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-black">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="bg-white text-black-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-black">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="bg-white text-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile_pic" className="text-black">
              Photo:
            </label>
            <div
              className="h-14 bg-white text-black flex justify-between items-center mb-2 px-3 py-2 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              onClick={triggerFileUpload}
            >
              <p className="text-sm max-w-[300px] truncate">
                {uploadPhoto?.name ? uploadPhoto?.name : "Upload profile photo"}
              </p>
              {uploadPhoto?.name && (
                <button
                  className="text-xl hover:text-red-500"
                  onClick={handleClearUploadPhoto}
                >
                  <IoClose />
                </button>
              )}
              <input
                type="file"
                id="profile_pic"
                name="profile_pic"
                className="hidden mt-2"
                onChange={handleUploadPhoto}
              />
            </div>
          </div>

          <button className="bg-blue-500 text-black text-lg px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-black">
          Already have an account?{" "}
          <Link
            to={"/email"}
            className="text-blue-800 hover:text-blue-400 font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
