import { useEffect, useState } from "react";
import api from "../services/api";

import {
    FaUsers,
    FaUserTie,
    FaBuilding,
    FaCalendarAlt,
    FaCalendarDay,
    FaClipboardCheck
} from "react-icons/fa";

function Dashboard() {

    const [dashboard, setDashboard] = useState({
        employeeCount: 0,
        managerCount: 0,
        departmentCount: 0,
        meetingCount: 0,
        todayMeetingCount: 0,
        pendingAttendanceCount: 0
    });

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const response = await api.get("/Dashboard");

            setDashboard(response.data);

        }
        catch (error) {

            console.error(error);

        }

    };

    return (
        <>

            <h2 className="page-title">
                Dashboard
            </h2>

            <div className="welcome-card">

                <h2>Welcome 👋</h2>

                <p>
                    Employee Meeting Attendance System
                </p>

            </div>

            <div className="dashboard-cards">

                <div className="dashboard-card">

                    <FaUsers className="card-icon" />

                    <h3>Employees</h3>

                    <h1>{dashboard.employeeCount}</h1>

                </div>

                <div className="dashboard-card">

                    <FaUserTie className="card-icon" />

                    <h3>Managers</h3>

                    <h1>{dashboard.managerCount}</h1>

                </div>

                <div className="dashboard-card">

                    <FaBuilding className="card-icon" />

                    <h3>Departments</h3>

                    <h1>{dashboard.departmentCount}</h1>

                </div>

                <div className="dashboard-card">

                    <FaCalendarAlt className="card-icon" />

                    <h3>Meetings</h3>

                    <h1>{dashboard.meetingCount}</h1>

                </div>

                <div className="dashboard-card">

                    <FaCalendarDay className="card-icon" />

                    <h3>Today's Meetings</h3>

                    <h1>{dashboard.todayMeetingCount}</h1>

                </div>

                <div className="dashboard-card">

                    <FaClipboardCheck className="card-icon" />

                    <h3>Pending Attendance</h3>

                    <h1>{dashboard.pendingAttendanceCount}</h1>

                </div>

            </div>

        </>
    );

}

export default Dashboard;