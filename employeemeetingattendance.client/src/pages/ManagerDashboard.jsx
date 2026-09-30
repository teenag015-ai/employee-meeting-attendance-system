import { useEffect, useState } from "react";
import {
    FaCalendarAlt,
    FaTasks,
    FaClock,
    FaCheckCircle,
    FaClipboardCheck
} from "react-icons/fa";

import api from "../services/api";

function ManagerDashboard() {

    const [dashboard, setDashboard] = useState({
        totalMeetings: 0,
        myMeetings: 0,
        upcomingMeetings: 0,
        completedMeetings: 0,
        pendingAttendance: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const managerId = localStorage.getItem("userId");

            const response = await api.get(
                `/ManagerDashboard/dashboard/${managerId}`
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

    return (

        <>

            <div className="page-header">

                <h1 className="page-title">
                    Manager Dashboard
                </h1>

                <p className="page-subtitle">
                    Welcome back,
                    <strong> {localStorage.getItem("userName")}</strong>
                </p>

            </div>

            {

                loading ?

                    <div className="card">

                        <h3 style={{ textAlign: "center" }}>
                            Loading Dashboard...
                        </h3>

                    </div>

                    :

                    <div className="dashboard-cards">

                        <div className="dashboard-card">

                            <FaCalendarAlt className="card-icon" />

                            <h3>Total Assigned Meetings</h3>

                            <h1>
                                {dashboard.totalMeetings}
                            </h1>

                        </div>

                        <div className="dashboard-card">

                            <FaTasks className="card-icon" />

                            <h3>My Meetings</h3>

                            <h1>
                                {dashboard.myMeetings}
                            </h1>

                        </div>

                        <div className="dashboard-card">

                            <FaClock className="card-icon" />

                            <h3>Upcoming Meetings</h3>

                            <h1>
                                {dashboard.upcomingMeetings}
                            </h1>

                        </div>

                        <div className="dashboard-card">

                            <FaCheckCircle className="card-icon" />

                            <h3>Completed Meetings</h3>

                            <h1>
                                {dashboard.completedMeetings}
                            </h1>

                        </div>

                        <div className="dashboard-card">

                            <FaClipboardCheck className="card-icon" />

                            <h3>Pending Attendance</h3>

                            <h1>
                                {dashboard.pendingAttendance}
                            </h1>

                        </div>

                    </div>

            }

        </>

    );

}

export default ManagerDashboard;