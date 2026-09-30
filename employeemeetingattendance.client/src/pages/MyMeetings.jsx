/* eslint-disable react-hooks/set-state-in-effect */

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../services/api";


function MyMeetings() {

    // ==========================================
    // EMPLOYEE ID
    // ==========================================

    const employeeId =
        localStorage.getItem("userId");


    // ==========================================
    // STATE
    // ==========================================

    const [meetings, setMeetings] =
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

    const meetingsPerPage = 5;


    // ==========================================
    // LOAD MEETINGS
    // ==========================================

    const loadMeetings = useCallback(async () => {

        try {

            setLoading(true);


            const response =
                await api.get(
                    `/EmployeeMeeting/${employeeId}`
                );


            /*
             * Supports both:
             *
             * Old API:
             * response.data = [...]
             *
             * New API:
             * response.data = {
             *     data: [...]
             * }
             */

            const allMeetings =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];


            setMeetings(allMeetings);

        }
        catch (error) {

            console.error(
                "Error loading employee meetings:",
                error
            );


            setMeetings([]);

        }
        finally {

            setLoading(false);

        }

    }, [employeeId]);


    // ==========================================
    // LOAD MEETINGS WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {

        loadMeetings();

    }, [loadMeetings]);


    // ==========================================
    // SEARCH
    //
    // IMPORTANT:
    // Search is performed BEFORE pagination.
    //
    // Therefore, if there are 20 meetings and
    // you are on page 1, searching will search
    // all 20 meetings.
    // ==========================================

    const filteredMeetings =
        useMemo(() => {

            const searchText =
                search.trim().toLowerCase();


            if (!searchText) {

                return meetings;

            }


            return meetings.filter(
                (meeting) => {

                    const title =
                        (meeting.title || "")
                            .toLowerCase();


                    const meetingType =
                        (meeting.meetingType || "")
                            .toLowerCase();


                    const status =
                        (meeting.status || "")
                            .toLowerCase();


                    return (
                        title.includes(searchText) ||
                        meetingType.includes(searchText) ||
                        status.includes(searchText)
                    );

                }
            );

        }, [meetings, search]);


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
        filteredMeetings.length;


    const totalPages =
        Math.ceil(
            totalRecords /
            meetingsPerPage
        );


    const indexOfLastMeeting =
        currentPage *
        meetingsPerPage;


    const indexOfFirstMeeting =
        indexOfLastMeeting -
        meetingsPerPage;


    const currentMeetings =
        filteredMeetings.slice(
            indexOfFirstMeeting,
            indexOfLastMeeting
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

        if (currentPage < totalPages) {

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
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Attendance Completed":
                return "completed";

            case "Upcoming":
                return "ongoing";

            case "Ongoing":
                return "ongoing";

            case "Completed":
                return "completed";

            default:
                return "pending";

        }

    };


    // ==========================================
    // MEETING TYPE CLASS
    // ==========================================

    const getMeetingTypeClass =
        (meetingType) => {

            if (
                meetingType === "Company"
            ) {

                return "completed";

            }

            return "ongoing";

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

                        My Meetings

                    </h1>


                    <p className="page-subtitle">

                        View all meetings assigned to you.

                    </p>

                </div>

            </div>


            {/* ==========================================
                MAIN CARD
            ========================================== */}

            <div className="card">

                {/* ==========================================
                    SEARCH
                ========================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        gap: "15px",
                        flexWrap: "wrap"
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
                            width: "300px"
                        }}
                    />


                    {/* ======================================
                        TOTAL RESULTS
                    ====================================== */}

                    {!loading && (

                        <div
                            style={{
                                color: "#666",
                                fontSize: "14px"
                            }}
                        >

                            Showing{" "}

                            {currentMeetings.length}

                            {" "}of{" "}

                            {totalRecords}

                            {" "}meetings

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
                                Time
                            </th>

                            <th>
                                Type
                            </th>

                            <th>
                                Status
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
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    Loading...

                                </td>

                            </tr>

                        ) : filteredMeetings.length === 0 ? (

                            /* ==============================
                               NO RESULTS
                            ============================== */

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    {
                                        search.trim()
                                            ? "No meetings found for your search."
                                            : "No meetings found."
                                    }

                                </td>

                            </tr>

                        ) : (

                            /* ==============================
                               CURRENT PAGE MEETINGS
                            ============================== */

                            currentMeetings.map(
                                (meeting) => (

                                    <tr
                                        key={
                                            meeting.meetingId
                                        }
                                    >

                                        {/* MEETING */}

                                        <td>

                                            {
                                                meeting.title
                                            }

                                        </td>


                                        {/* DATE */}

                                        <td>

                                            {
                                                meeting.meetingDate
                                                    ? meeting.meetingDate.split("T")[0]
                                                    : "-"
                                            }

                                        </td>


                                        {/* TIME */}

                                        <td>

                                            {
                                                meeting.startTime
                                                    ? meeting.startTime.substring(0, 5)
                                                    : "-"
                                            }

                                            {" - "}

                                            {
                                                meeting.endTime
                                                    ? meeting.endTime.substring(0, 5)
                                                    : "-"
                                            }

                                        </td>


                                        {/* TYPE */}

                                        <td>

                                            <span
                                                className={
                                                    `status-badge ${getMeetingTypeClass(
                                                        meeting.meetingType
                                                    )}`
                                                }
                                            >

                                                {
                                                    meeting.meetingType
                                                }

                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `status-badge ${getStatusClass(
                                                        meeting.status
                                                    )}`
                                                }
                                            >

                                                {
                                                    meeting.status
                                                }

                                            </span>

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

                {!loading &&
                    filteredMeetings.length >
                    meetingsPerPage && (

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "20px",
                                flexWrap: "wrap"
                            }}
                        >

                            {/* ==================================
                                PREVIOUS
                            ================================== */}

                            <button
                                type="button"
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


                            {/* ==================================
                                PAGE NUMBERS
                            ================================== */}

                            {Array.from(
                                {
                                    length: totalPages
                                },
                                (_, index) =>
                                    index + 1
                            ).map((page) => (

                                <button
                                    type="button"
                                    key={page}
                                    className={
                                        currentPage === page
                                            ? "primary-btn"
                                            : "secondary-btn"
                                    }
                                    onClick={() =>
                                        goToPage(page)
                                    }
                                >

                                    {page}

                                </button>

                            ))}


                            {/* ==================================
                                NEXT
                            ================================== */}

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    currentPage === totalPages
                                }
                            >

                                Next

                            </button>

                        </div>

                    )}

            </div>

        </>

    );

}


export default MyMeetings;