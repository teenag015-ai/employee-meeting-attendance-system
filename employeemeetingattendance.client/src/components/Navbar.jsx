import { FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import companyLogo from "../assets/images/companylogo.png";

function Navbar() {
    const userName = localStorage.getItem("userName") || "Company Admin";
    const role = localStorage.getItem("role") || "Admin";

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="navbar">

            <div className="navbar-left">
                <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="navbar-logo"
                />
            </div>

            <div className="navbar-right">

                <FaBell className="nav-icon" />

                <div className="user-info">

                    <FaUserCircle className="user-icon" />

                    <div>

                        <h4>{userName}</h4>

                        <span>{role}</span>

                    </div>

                </div>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </div>

        </div>
    );
}

export default Navbar;