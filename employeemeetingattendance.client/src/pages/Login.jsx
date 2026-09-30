import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaPhoneAlt,
} from "react-icons/fa";

import api from "../services/api";
import companyLogo from "../assets/images/companylogo.png";

function Login() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        if (!email || !password) {

            setError("Please enter email and password.");
            return;

        }

        try {

            setLoading(true);

            const response = await api.post("/Auth/login", {
                email,
                password,
            });

            const user = response.data;

            // Store logged-in user details
            localStorage.setItem("token", user.token);
            localStorage.setItem("userId", user.userId);
            localStorage.setItem("userName", user.name);
            localStorage.setItem("role", user.role);

            // Redirect based on role
            switch (user.role) {

                case "Admin":
                    navigate("/dashboard");
                    break;

                case "Manager":
                    navigate("/manager/dashboard");
                    break;

                case "Employee":
                    navigate("/employee/dashboard");
                    break;

                default:
                    navigate("/login");
                    break;
            }

        }
        catch (err) {

            if (err.response) {

                setError(
                    err.response.data.message ||
                    "Invalid email or password."
                );

            }
            else {

                setError("Unable to connect to server.");

            }

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

            {/* Top Header */}

            <div className="top-header">

                <div className="phone">

                    <FaPhoneAlt />

                    <span>+91 79755-52867</span>

                </div>

                <div className="title">

                    Employee Meeting Attendance System

                </div>

            </div>

            {/* Logo */}

            <div className="logo-section">

                <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="company-logo"
                />

            </div>

            {/* Login */}

            <div className="login-container">

                <form
                    className="login-card"
                    onSubmit={handleLogin}
                >

                    <h1>LOGIN</h1>

                    <p>Sign in to continue</p>

                    {error && (

                        <div
                            style={{
                                color: "red",
                                marginBottom: "15px",
                                textAlign: "center",
                                fontWeight: "600"
                            }}
                        >

                            {error}

                        </div>

                    )}

                    <label>Email Address</label>

                    <div className="input-group">

                        <FaEnvelope className="icon" />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                    </div>

                    <label>Password</label>

                    <div className="input-group">

                        <FaLock className="icon" />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <span
                            className="eye"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >

                            {showPassword ? <FaEyeSlash /> : <FaEye />}

                        </span>

                    </div>

                    <div className="login-options">

                        <label className="remember">

                            <input type="checkbox" />

                            Remember Me

                        </label>

                        <a href="#">

                            Forgot Password?

                        </a>

                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >

                        {loading ? "Logging in..." : "LOGIN"}

                    </button>

                </form>

            </div>

        </div>

    );

}

export default Login;