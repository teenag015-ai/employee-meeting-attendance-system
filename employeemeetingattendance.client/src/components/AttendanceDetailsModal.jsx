import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function AttendanceDetailsModal({ meetingId, onClose }) {

    const [meeting, setMeeting] = useState(null);
    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;


    useEffect(() => {

        if (meetingId) {
            loadData();
        }

    }, [meetingId]);


    const loadData = async () => {

        try {

            setLoading(true);

            const [meetingResponse, attendanceResponse] =
                await Promise.all([

                    api.get(`/Meeting/${meetingId}`),

                    api.get(`/Attendance/meeting/${meetingId}`)

                ]);


            setMeeting(meetingResponse.data);


            // Safety check for API response
            if (Array.isArray(attendanceResponse.data)) {

                setAttendance(attendanceResponse.data);

            }
            else if (attendanceResponse.data.data) {

                setAttendance(attendanceResponse.data.data);

            }
            else {

                setAttendance([]);

            }


        }
        catch (error) {

            console.error(error);
            setAttendance([]);

        }
        finally {

            setLoading(false);

        }

    };



    const filteredAttendance = useMemo(() => {

        return attendance.filter(employee =>

            (employee.employeeName || "")
                .toLowerCase()
                .includes(search.toLowerCase())

        );

    }, [attendance, search]);



    // Reset pagination when searching
    useEffect(() => {

        setCurrentPage(1);

    }, [search]);



    // Pagination

    const totalPages = Math.ceil(
        filteredAttendance.length / recordsPerPage
    );


    const lastIndex =
        currentPage * recordsPerPage;


    const firstIndex =
        lastIndex - recordsPerPage;


    const currentEmployees =
        filteredAttendance.slice(
            firstIndex,
            lastIndex
        );



    const totalEmployees = attendance.length;


    const presentCount = attendance.filter(
        employee => employee.status === "Present"
    ).length;


    const absentCount = attendance.filter(
        employee => employee.status === "Absent"
    ).length;



    const attendancePercentage =
        totalEmployees === 0
            ? 0
            : ((presentCount / totalEmployees) * 100).toFixed(2);



    return (

        <div className="modal-overlay">

            <div className="attendance-modal">


                <div className="modal-header">

                    <h2 className="modal-title">
                        Attendance Details
                    </h2>


                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>




                {
                    loading ?

                        <div
                            style={{
                                textAlign: "center",
                                padding: "60px"
                            }}
                        >
                            Loading...
                        </div>


                        :

                        <>


                            {/* Meeting Details */}

                            <div className="card meeting-card">

                                <table className="custom-table">

                                    <tbody>

                                        <tr>

                                            <td width="25%">
                                                <strong>
                                                    Meeting Name
                                                </strong>
                                            </td>


                                            <td>
                                                {meeting?.title}
                                            </td>

                                        </tr>


                                        <tr>

                                            <td>
                                                <strong>
                                                    Meeting Type
                                                </strong>
                                            </td>


                                            <td>
                                                {meeting?.meetingType}
                                            </td>

                                        </tr>


                                        <tr>

                                            <td>
                                                <strong>
                                                    Meeting Date
                                                </strong>
                                            </td>


                                            <td>

                                                {
                                                    meeting?.meetingDate
                                                        ?.split("T")[0]
                                                }

                                            </td>

                                        </tr>


                                    </tbody>

                                </table>

                            </div>





                            {/* Summary */}

                            <div className="summary-container">


                                <div className="summary-card">

                                    <h2>{totalEmployees}</h2>

                                    <p>Total Employees</p>

                                </div>



                                <div className="summary-card present-card">

                                    <h2>{presentCount}</h2>

                                    <p>Present</p>

                                </div>



                                <div className="summary-card absent-card">

                                    <h2>{absentCount}</h2>

                                    <p>Absent</p>

                                </div>



                                <div className="summary-card attendance-card">

                                    <h2>
                                        {attendancePercentage}%
                                    </h2>

                                    <p>Attendance %</p>

                                </div>


                            </div>





                            {/* Search */}

                            <div
                                style={{
                                    display: "flex",
                                    margin: "25px 0 15px 0"
                                }}
                            >

                                <input

                                    type="text"

                                    className="form-control"

                                    placeholder="🔍 Search Employee..."

                                    value={search}

                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }

                                    style={{
                                        width: "320px"
                                    }}

                                />


                            </div>





                            {/* Employee Table */}


                            <table className="custom-table">


                                <thead>

                                    <tr>

                                        <th style={{ width: "10%" }}>
                                            Sl No
                                        </th>


                                        <th>
                                            Employee Name
                                        </th>


                                        <th style={{ width: "25%" }}>
                                            Status
                                        </th>


                                    </tr>

                                </thead>



                                <tbody>


                                    {

                                        currentEmployees.length === 0 ?


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



                                            :



                                            currentEmployees.map(
                                                (employee, index) => (

                                                    <tr
                                                        key={employee.attendanceId}
                                                    >

                                                        <td>

                                                            {firstIndex + index + 1}

                                                        </td>


                                                        <td>

                                                            {employee.employeeName}

                                                        </td>


                                                        <td>


                                                            {
                                                                employee.status === "Present"


                                                                    ?


                                                                    <span className="present-badge">

                                                                        🟢 Present

                                                                    </span>



                                                                    :


                                                                    <span className="absent-badge">

                                                                        🔴 Absent

                                                                    </span>

                                                            }


                                                        </td>


                                                    </tr>


                                                ))

                                    }


                                </tbody>


                            </table>





                            {/* Pagination */}

                            {
                                filteredAttendance.length > 0 &&


                                <div

                                    style={{

                                        display: "flex",

                                        justifyContent: "space-between",

                                        alignItems: "center",

                                        marginTop: "20px"

                                    }}

                                >


                                    <div>

                                        Showing {firstIndex + 1}
                                        {" "}
                                        to
                                        {" "}
                                        {
                                            Math.min(
                                                lastIndex,
                                                filteredAttendance.length
                                            )
                                        }

                                        {" "}of{" "}

                                        {filteredAttendance.length}

                                    </div>





                                    <div>


                                        <button

                                            className="secondary-btn"

                                            disabled={currentPage === 1}

                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage - 1
                                                )
                                            }

                                        >

                                            Previous

                                        </button>





                                        {
                                            Array.from(
                                                {
                                                    length: totalPages
                                                },

                                                (_, index) => (


                                                    <button

                                                        key={index}

                                                        className="primary-btn"

                                                        style={{
                                                            marginLeft: "5px"
                                                        }}

                                                        onClick={() =>
                                                            setCurrentPage(
                                                                index + 1
                                                            )
                                                        }

                                                    >

                                                        {index + 1}

                                                    </button>


                                                ))

                                        }





                                        <button

                                            className="secondary-btn"

                                            style={{
                                                marginLeft: "5px"
                                            }}

                                            disabled={
                                                currentPage === totalPages
                                            }

                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage + 1
                                                )
                                            }

                                        >

                                            Next

                                        </button>


                                    </div>


                                </div>


                            }





                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "25px"
                                }}
                            >

                                <button

                                    className="secondary-btn"

                                    onClick={onClose}

                                >

                                    Close

                                </button>


                            </div>


                        </>

                }


            </div>


        </div>

    );

}

export default AttendanceDetailsModal;