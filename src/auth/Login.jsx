// src/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Preloader from "../components/Preloader";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 5000);
  };

  return (
    <>
      {loading && <Preloader />}

      <div className="auth-bubbles flex items-center justify-center min-h-screen h-full px-4 relative overflow-hidden">
        {/* Bubbles */}
        <div
          className="bubble blue"
          style={{ width: 280, height: 280, top: -80, left: -60 }}
        />
        <div
          className="bubble pink"
          style={{ width: 240, height: 240, bottom: -60, right: -40 }}
        />
        <div
          className="bubble purple"
          style={{ width: 300, height: 300, top: 120, right: -100 }}
        />
        <div
          className="bubble red"
          style={{ width: 180, height: 180, bottom: 120, left: 40 }}
        />
        <div
          className="bubble teal"
          style={{ width: 220, height: 220, top: 400, left: 120 }}
        />
        <div
          className="bubble blue"
          style={{
            width: 160,
            height: 160,
            top: 250,
            right: 250,
            opacity: 0.35,
          }}
        />
        <div
          className="bubble pink"
          style={{
            width: 140,
            height: 140,
            bottom: 300,
            right: 180,
            opacity: 0.35,
          }}
        />
        <div
          className="bubble purple"
          style={{ width: 200, height: 200, top: 500, left: -50, opacity: 0.3 }}
        />

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="
            relative z-10 bg-white/10 backdrop-blur-xl 
            p-8 rounded-2xl shadow-2xl 
            w-full max-w-[380px] border border-white/20
            text-white py-14
          "
        >
          <h2 className="text-3xl font-bold mb-10 text-center drop-shadow-lg">
            Login
          </h2>

          {/* USERNAME */}
          <div className="relative mb-6">
            <input
              type="text"
              id="username"
              required
              className="
                peer w-full px-3 py-3 rounded-lg outline-none
                bg-white/20 text-white border border-white/30 
                placeholder-transparent
                focus:ring-2 focus:ring-white/40
                focus:border-white
              "
              placeholder="Username"
            />
            <label
              htmlFor="username"
              className="
                absolute left-3 text-white/70 transition-all duration-200
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                peer-focus:-top-4 peer-focus:text-sm peer-focus:text-white
              "
            >
              Username
            </label>
          </div>

          {/* PASSWORD */}
          <div className="relative mb-8">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                peer w-full px-3 py-3 rounded-lg outline-none
                bg-white/20 text-white border border-white/30 
                placeholder-transparent
                focus:ring-2 focus:ring-white/40
                focus:border-white
              "
              placeholder="Password"
            />

            <label
              htmlFor="password"
              className={`
                absolute left-3 transition-all duration-200 text-white/70
                ${
                  password.length > 0
                    ? "-top-4 text-sm text-white"
                    : "top-3 text-base"
                }
                peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm
              `}
            >
              Password
            </label>

            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white/70 hover:text-white transition"
            >
              {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
            </button>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="
              w-full py-3 rounded-lg font-semibold
              bg-blue-600/80 hover:bg-blue-700 
              transition shadow-lg border border-white/20
            "
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}
