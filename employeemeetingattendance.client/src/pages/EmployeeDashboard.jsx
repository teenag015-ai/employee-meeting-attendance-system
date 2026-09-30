import { useEffect, useState } from "react";
import api from "../services/api";

import {
    FaCalendarAlt,
    FaClock,
    FaChartLine,
    FaUserCheck,
    FaUserTimes,
    FaBuilding,
    FaUserTie,
    FaClipboardList
} from "react-icons/fa";

function EmployeeDashboard() {

    const employeeId = localStorage.getItem("userId");

    const [dashboard, setDashboard] = useState({
        employeeName: "",
        departmentName: "",
        managerName: "",
        totalMeetings: 0,
        todayMeetings: 0,
        upcomingMeetings: 0,
        attendedMeetings: 0,
        missedMeetings: 0,
        attendancePercentage: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                `/EmployeeDashboard/${employeeId}`
            );

            setDashboard(response.data);

        }
        catch (error) {

            console.error(error);

        }
        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="page-header">

                <h2>Loading Employee Dashboard...</h2>

            </div>

        );

    }

    return (

        <>

            <div className="page-header">

                <div>

                    <h1 className="page-title">

                        Welcome, {dashboard.employeeName}

                    </h1>

                    <p className="page-subtitle">

                        View your meetings and attendance summary.

                    </p>

                </div>

            </div>

            {/* Employee Information */}

            <div className="info-grid">

                <div className="info-card">

                    <div className="info-title">

                        <FaBuilding
                            style={{
                                marginRight: "10px",
                                color: "#1565C0"
                            }}
                        />

                        Department

                    </div>

                    <div className="info-value">

                        {dashboard.departmentName}

                    </div>

                </div>

                <div className="info-card">

                    <div className="info-title">

                        <FaUserTie
                            style={{
                                marginRight: "10px",
                                color: "#1565C0"
                            }}
                        />

                        Reporting Manager

                    </div>

                    <div className="info-value">

                        {dashboard.managerName}

                    </div>

                </div>

            </div>

            {/* Summary Cards */}

            <div className="dashboard-grid">

                <div className="summary-card">

                    <FaClipboardList className="summary-icon" />

                    <div className="summary-title">

                        Total Meetings

                    </div>

                    <div className="summary-value summary-blue">

                        {dashboard.totalMeetings}

                    </div>

                </div>

                <div className="summary-card">

                    <FaCalendarAlt className="summary-icon" />

                    <div className="summary-title">

                        Today's Meetings

                    </div>

                    <div className="summary-value summary-orange">

                        {dashboard.todayMeetings}

                    </div>

                </div>

                <div className="summary-card">

                    <FaClock className="summary-icon" />

                    <div className="summary-title">

                        Upcoming Meetings

                    </div>

                    <div className="summary-value summary-blue">

                        {dashboard.upcomingMeetings}

                    </div>

                </div>

                <div className="summary-card">

                    <FaChartLine className="summary-icon" />

                    <div className="summary-title">

                        Attendance %

                    </div>

                    <div className="summary-value summary-green">

                        {dashboard.attendancePercentage}%

                    </div>

                </div>

            </div>

            {/* Attendance Summary */}

            <div className="bottom-grid">

                <div className="summary-card">

                    <FaUserCheck
                        className="summary-icon"
                        style={{
                            color: "#198754"
                        }}
                    />

                    <div className="summary-title">

                        Meetings Attended

                    </div>

                    <div className="summary-value summary-green">

                        {dashboard.attendedMeetings}

                    </div>

                </div>

                <div className="summary-card">

                    <FaUserTimes
                        className="summary-icon"
                        style={{
                            color: "#dc3545"
                        }}
                    />

                    <div className="summary-title">

                        Meetings Missed

                    </div>

                    <div className="summary-value summary-red">

                        {dashboard.missedMeetings}

                    </div>

                </div>

            </div>

        </>

    );

}

export default EmployeeDashboard;