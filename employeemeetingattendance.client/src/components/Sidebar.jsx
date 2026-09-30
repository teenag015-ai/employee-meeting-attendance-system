import { NavLink } from "react-router-dom";

import companyLogo from "../assets/images/companylogo.png";

import {
    FaTachometerAlt,
    FaUsers,
    FaBuilding,
    FaUserTie,
    FaCalendarAlt,
    FaClipboardCheck,
    FaChartBar
} from "react-icons/fa";

function Sidebar() {

    const role = localStorage.getItem("role");

    // =========================
    // ADMIN MENU
    // =========================
    const adminMenu = [
        {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/dashboard"
        },
        {
            name: "Employees",
            icon: <FaUsers />,
            path: "/employees"
        },
        {
            name: "Departments",
            icon: <FaBuilding />,
            path: "/departments"
        },
        {
            name: "Managers",
            icon: <FaUserTie />,
            path: "/managers"
        },
        {
            name: "Meetings",
            icon: <FaCalendarAlt />,
            path: "/meetings"
        },
        {
            name: "Attendance Report",
            icon: <FaChartBar />,
            path: "/attendance-report"
        },
        {
            name: "Monthly Report",
            icon: <FaChartBar />,
            path: "/monthly-attendance-report"
        }
    ];

    // =========================
    // MANAGER MENU
    // =========================
    const managerMenu = [
        {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/manager/dashboard"
        },
        {
            name: "Assigned Meetings",
            icon: <FaClipboardCheck />,
            path: "/manager/assigned-meetings"
        },
        {
            name: "Meetings",
            icon: <FaCalendarAlt />,
            path: "/manager/meetings"
        },
        {
            name: "Attendance Report",
            icon: <FaChartBar />,
            path: "/attendance-report"
        },
        {
            name: "Monthly Report",
            icon: <FaChartBar />,
            path: "/monthly-attendance-report"
        }
    ];

    // =========================
    // EMPLOYEE MENU
    // =========================
    const employeeMenu = [
        {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/employee/dashboard"
        },
        {
            name: "My Meetings",
            icon: <FaCalendarAlt />,
            path: "/employee/meetings"
        },
        {
            name: "My Attendance",
            icon: <FaClipboardCheck />,
            path: "/employee/attendance"
        }
    ];

    let menuItems = [];

    if (role === "Admin") {
        menuItems = adminMenu;
    }
    else if (role === "Manager") {
        menuItems = managerMenu;
    }
    else if (role === "Employee") {
        menuItems = employeeMenu;
    }

    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="sidebar-logo"
                />
            </div>

            <ul className="sidebar-menu">

                {menuItems.map((item) => (

                    <li key={item.path}>

                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>

                    </li>

                ))}

            </ul>

        </aside>
    );
}

export default Sidebar;