import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function Attendance() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const role = localStorage.getItem("role");

    const meetingId = searchParams.get("meetingId");

    const [meeting, setMeeting] = useState(null);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {

        if (meetingId) {

            loadMeeting();
            loadAttendance();

        }

    }, [meetingId]);

    const loadMeeting = async () => {

        try {

            const response = await api.get(`/Meeting/${meetingId}`);

            setMeeting(response.data);

        }
        catch (error) {

            console.error(error);

        }

    };

    const loadAttendance = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                `/Attendance/meeting/${meetingId}/employees`
            );

            setEmployees(response.data);

            const alreadySubmitted = response.data.some(
                employee => employee.attendanceId > 0
            );

            setIsEditMode(alreadySubmitted);

        }
        catch (error) {

            console.error(error);

        }
        finally {

            setLoading(false);

        }

    };

    const handleStatusChange = (employeeId, status) => {

        setEmployees(previous =>

            previous.map(employee =>

                employee.employeeId === employeeId

                    ? {

                        ...employee,

                        status

                    }

                    : employee

            )

        );

    };

    const goBack = () => {

        if (role === "Manager") {

            navigate("/manager/meetings");

        }
        else {

            navigate("/meetings");

        }

    };

    const handleSaveAttendance = async () => {

        try {

            setLoading(true);

            await api.post("/Attendance", {

                meetingId: Number(meetingId),

                employees: employees.map(employee => ({

                    employeeId: employee.employeeId,

                    status: employee.status,

                    remarks: employee.remarks ?? ""

                }))

            });

            await loadAttendance();

            goBack();

        }
        catch (error) {

            console.error(error);

            alert("Unable to save attendance.");

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <>

            <div className="page-header">

                <h1 className="page-title">

                    Attendance Management

                </h1>

            </div>

            {

                meeting && (

                    <div className="card">

                        <div className="page-header">

                            <h2 className="page-title">

                                Meeting Details

                            </h2>

                        </div>

                        <table className="custom-table">

                            <tbody>

                                <tr>

                                    <td style={{ width: "20%" }}>

                                        <strong>Meeting</strong>

                                    </td>

                                    <td style={{ width: "30%" }}>

                                        {meeting.title}

                                    </td>

                                    <td style={{ width: "20%" }}>

                                        <strong>Meeting Type</strong>

                                    </td>

                                    <td>

                                        {meeting.meetingType}

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        <strong>Date</strong>

                                    </td>

                                    <td>

                                        {meeting.meetingDate.split("T")[0]}

                                    </td>

                                    <td>

                                        <strong>Time</strong>

                                    </td>

                                    <td>

                                        {meeting.startTime} - {meeting.endTime}

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                )

            }

            <div
                className="card"
                style={{ marginTop: "20px" }}
            >

                <table className="custom-table">

                    <thead>

                        <tr>

                            <th style={{ width: "8%" }}>
                                Sl No
                            </th>

                            <th style={{ width: "52%" }}>
                                Employee Name
                            </th>

                            <th style={{ width: "40%" }}>
                                Attendance
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        {

                            employees.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="3"
                                        style={{
                                            textAlign: "center",
                                            padding: "30px"
                                        }}
                                    >
                                        No employees found.
                                    </td>

                                </tr>

                            ) :

                                employees.map((employee, index) => (

                                    <tr key={employee.employeeId}>

                                        <td>
                                            {index + 1}
                                        </td>

                                        <td>
                                            {employee.employeeName}
                                        </td>

                                        <td>

                                            <label
                                                style={{
                                                    marginRight: "30px",
                                                    cursor: "pointer"
                                                }}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`attendance-${employee.employeeId}`}
                                                    checked={employee.status === "Present"}
                                                    onChange={() =>
                                                        handleStatusChange(
                                                            employee.employeeId,
                                                            "Present"
                                                        )
                                                    }
                                                />

                                                {" "}Present

                                            </label>

                                            <label
                                                style={{
                                                    cursor: "pointer"
                                                }}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`attendance-${employee.employeeId}`}
                                                    checked={employee.status === "Absent"}
                                                    onChange={() =>
                                                        handleStatusChange(
                                                            employee.employeeId,
                                                            "Absent"
                                                        )
                                                    }
                                                />

                                                {" "}Absent

                                            </label>

                                        </td>

                                    </tr>

                                ))

                        }

                    </tbody>

                </table>

                <div
                    style={{
                        marginTop: "25px",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px"
                    }}
                >

                    <button
                        className="secondary-btn"
                        onClick={goBack}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary-btn"
                        onClick={handleSaveAttendance}
                        disabled={loading || employees.length === 0}
                    >

                        {
                            loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Attendance"
                                    : "Submit Attendance"
                        }

                    </button>

                </div>

            </div>

        </>

    );

}

export default Attendance;