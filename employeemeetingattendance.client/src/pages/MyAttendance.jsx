import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function MyAttendance() {

    const employeeId =
        localStorage.getItem("userId");

    const [attendance, setAttendance] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    // ==========================================
    // PAGINATION
    // ==========================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const attendancePerPage = 5;

    // ==========================================
    // LOAD ATTENDANCE
    // ==========================================

    useEffect(() => {

        loadAttendance();

    }, []);

    const loadAttendance = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                `/EmployeeAttendance/${employeeId}`
            );

            /*
             * Supports:
             *
             * Old API:
             * response.data = [...]
             *
             * New API:
             * response.data = {
             *     data: [...]
             * }
             */

            const allAttendance =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];

            setAttendance(allAttendance);

        }
        catch (error) {

            console.error(
                "Error loading attendance:",
                error
            );

            setAttendance([]);

        }
        finally {

            setLoading(false);

        }

    };

    // ==========================================
    // SEARCH
    //
    // IMPORTANT:
    // Search happens BEFORE pagination.
    //
    // Therefore it searches ALL attendance
    // records, not only the current page.
    // ==========================================

    const filteredAttendance =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            if (!searchText) {

                return attendance;

            }

            return attendance.filter(
                (item) => {

                    const meetingTitle =
                        (
                            item.meetingTitle ||
                            ""
                        ).toLowerCase();

                    const meetingType =
                        (
                            item.meetingType ||
                            ""
                        ).toLowerCase();

                    const status =
                        (
                            item.status ||
                            ""
                        ).toLowerCase();

                    return (
                        meetingTitle.includes(
                            searchText
                        ) ||

                        meetingType.includes(
                            searchText
                        ) ||

                        status.includes(
                            searchText
                        )
                    );

                }
            );

        }, [attendance, search]);

    // ==========================================
    // RESET PAGE WHEN SEARCH CHANGES
    // ==========================================

    useEffect(() => {

        setCurrentPage(1);

    }, [search]);

    // ==========================================
    // PAGINATION
    // ==========================================

    const totalRecords =
        filteredAttendance.length;

    const totalPages =
        Math.ceil(
            totalRecords /
            attendancePerPage
        );

    const indexOfLastRecord =
        currentPage *
        attendancePerPage;

    const indexOfFirstRecord =
        indexOfLastRecord -
        attendancePerPage;

    const currentAttendance =
        filteredAttendance.slice(
            indexOfFirstRecord,
            indexOfLastRecord
        );

    // ==========================================
    // PREVIOUS PAGE
    // ==========================================

    const goToPreviousPage = () => {

        if (currentPage > 1) {

            setCurrentPage(
                currentPage - 1
            );

        }

    };

    // ==========================================
    // NEXT PAGE
    // ==========================================

    const goToNextPage = () => {

        if (
            currentPage < totalPages
        ) {

            setCurrentPage(
                currentPage + 1
            );

        }

    };

    // ==========================================
    // GO TO PAGE
    // ==========================================

    const goToPage = (page) => {

        setCurrentPage(page);

    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {

            return "-";

        }

        return new Date(date)
            .toLocaleDateString("en-GB");

    };

    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (date) => {

        if (!date) {

            return "-";

        }

        return new Date(date)
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    };

    // ==========================================
    // MEETING TYPE CLASS
    // ==========================================

    const getMeetingTypeClass = (
        meetingType
    ) => {

        if (
            meetingType === "Company"
        ) {

            return "completed";

        }

        return "ongoing";

    };

    // ==========================================
    // ATTENDANCE STATUS CLASS
    // ==========================================

    const getAttendanceStatusClass = (
        status
    ) => {

        if (
            status === "Present"
        ) {

            return "completed";

        }

        return "pending";

    };

    // ==========================================
    // RETURN
    // ==========================================

    return (

        <>

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="page-header">

                <div>

                    <h1 className="page-title">

                        My Attendance

                    </h1>

                    <p className="page-subtitle">

                        View your attendance history.

                    </p>

                </div>

            </div>


            {/* ==========================================
                MAIN CARD
            ========================================== */}

            <div className="card">


                {/* ==========================================
                    SEARCH + RESULT COUNT
                ========================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        marginBottom:
                            "20px",
                        gap: "15px",
                        flexWrap:
                            "wrap"
                    }}
                >

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Meeting..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        style={{
                            width: "300px",
                            maxWidth:
                                "100%"
                        }}
                    />


                    {/* RESULT COUNT */}

                    {!loading && (

                        <div
                            style={{
                                color: "#666",
                                fontSize:
                                    "14px"
                            }}
                        >

                            Showing{" "}

                            {
                                currentAttendance.length
                            }

                            {" "}of{" "}

                            {
                                totalRecords
                            }

                            {" "}attendance records

                        </div>

                    )}

                </div>


                {/* ==========================================
                    TABLE
                ========================================== */}

                <table className="custom-table">

                    <thead>

                        <tr>

                            <th>
                                Meeting
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Type
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Marked Time
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {/* ==================================
                            LOADING
                        ================================== */}

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            "30px"
                                    }}
                                >

                                    Loading...

                                </td>

                            </tr>

                        ) : filteredAttendance.length === 0 ? (

                            /* ==================================
                               NO RESULTS
                            ================================== */

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            "30px"
                                    }}
                                >

                                    {
                                        search.trim()
                                            ? "No attendance records found for your search."
                                            : "No attendance records found."
                                    }

                                </td>

                            </tr>

                        ) : (

                            /* ==================================
                               CURRENT PAGE RECORDS
                            ================================== */

                            currentAttendance.map(
                                (item) => (

                                    <tr
                                        key={
                                            item.attendanceId
                                        }
                                    >

                                        {/* MEETING */}

                                        <td>

                                            {
                                                item.meetingTitle
                                            }

                                        </td>


                                        {/* DATE */}

                                        <td>

                                            {
                                                formatDate(
                                                    item.meetingDate
                                                )
                                            }

                                        </td>


                                        {/* TYPE */}

                                        <td>

                                            <span
                                                className={
                                                    `status-badge ${getMeetingTypeClass(
                                                        item.meetingType
                                                    )}`
                                                }
                                            >

                                                {
                                                    item.meetingType
                                                }

                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `status-badge ${getAttendanceStatusClass(
                                                        item.status
                                                    )}`
                                                }
                                            >

                                                {
                                                    item.status
                                                }

                                            </span>

                                        </td>


                                        {/* MARKED TIME */}

                                        <td>

                                            {
                                                formatTime(
                                                    item.markedTime
                                                )
                                            }

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>


                {/* ==========================================
                    PAGINATION
                ========================================== */}

                {
                    !loading &&
                    filteredAttendance.length >
                    attendancePerPage && (

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "center",
                                alignItems:
                                    "center",
                                gap: "8px",
                                marginTop:
                                    "20px",
                                flexWrap:
                                    "wrap"
                            }}
                        >


                            {/* PREVIOUS */}

                            <button
                                className="secondary-btn"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    currentPage === 1
                                }
                            >

                                Previous

                            </button>


                            {/* PAGE NUMBERS */}

                            {
                                Array.from(
                                    {
                                        length:
                                            totalPages
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map(
                                    (page) => (

                                        <button
                                            key={
                                                page
                                            }
                                            className={
                                                currentPage === page
                                                    ? "primary-btn"
                                                    : "secondary-btn"
                                            }
                                            onClick={() =>
                                                goToPage(
                                                    page
                                                )
                                            }
                                        >

                                            {
                                                page
                                            }

                                        </button>

                                    )
                                )
                            }


                            {/* NEXT */}

                            <button
                                className="secondary-btn"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                            >

                                Next

                            </button>

                        </div>

                    )
                }

            </div>

        </>

    );

}

export default MyAttendance;