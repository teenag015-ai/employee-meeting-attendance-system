import { useEffect, useState } from "react";
import api from "../services/api";

function AssignedMeetings() {

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // SEARCH
    // ==========================================

    const [search, setSearch] = useState("");

    // ==========================================
    // PAGINATION
    // ==========================================

    const [currentPage, setCurrentPage] = useState(1);

    const meetingsPerPage = 5;

    // ==========================================
    // LOAD MEETINGS
    // ==========================================

    useEffect(() => {

        loadMeetings();

    }, []);

    const loadMeetings = async () => {

        try {

            setLoading(true);

            const managerId =
                localStorage.getItem("userId");

            const response = await api.get(
                `/ManagerDashboard/meetings/${managerId}`
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

            // ==========================================
            // ONLY ASSIGNED MEETINGS
            // ==========================================

            const assignedMeetings =
                allMeetings.filter(
                    meeting =>
                        meeting.createdBy !==
                        Number(managerId)
                );

            setMeetings(assignedMeetings);

        }
        catch (error) {

            console.error(
                "Error loading assigned meetings:",
                error
            );

            setMeetings([]);

        }
        finally {

            setLoading(false);

        }

    };

    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Upcoming":
                return "pending";

            case "Ongoing":
                return "ongoing";

            case "Completed":
                return "completed";

            case "Attendance Completed":
                return "completed";

            default:
                return "pending";

        }

    };

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredMeetings =
        meetings.filter((meeting) => {

            const searchText =
                search.trim().toLowerCase();

            if (!searchText) {
                return true;
            }

            return (

                (meeting.title || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                (meeting.meetingType || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                (meeting.status || "")
                    .toLowerCase()
                    .includes(searchText)

            );

        });

    // ==========================================
    // RESET PAGE WHEN SEARCH CHANGES
    // ==========================================

    useEffect(() => {

        setCurrentPage(1);

    }, [search]);

    // ==========================================
    // PAGINATION
    // ==========================================

    const totalPages = Math.ceil(
        filteredMeetings.length /
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
    // PAGE
    // ==========================================

    return (

        <>

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="page-header">

                <h1 className="page-title">
                    Assigned Meetings
                </h1>

                <p className="page-subtitle">
                    Meetings assigned by the Administrator.
                </p>

            </div>

            <div className="card">

                {/* ==========================================
                    SEARCH BAR
                ========================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        marginBottom: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search meetings..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "300px"
                        }}
                    />

                    <div
                        style={{
                            color: "#666"
                        }}
                    >
                        {filteredMeetings.length}{" "}
                        meeting
                        {filteredMeetings.length !== 1
                            ? "s"
                            : ""}
                    </div>

                </div>

                {/* ==========================================
                    TABLE
                ========================================== */}

                <table className="custom-table">

                    <thead>

                        <tr>

                            <th>
                                Title
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Time
                            </th>

                            <th>
                                Meeting Type
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {/* ==========================================
                            LOADING
                        ========================================== */}

                        {
                            loading ? (

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

                            )

                                :

                                /* ==========================================
                                   NO SEARCH RESULTS
                                ========================================== */

                                filteredMeetings.length === 0 ? (

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
                                                    ? "No meetings found for your search."
                                                    : "No Assigned Meetings."
                                            }

                                        </td>

                                    </tr>

                                )

                                    :

                                    /* ==========================================
                                       MEETINGS
                                    ========================================== */

                                    currentMeetings.map(
                                        (meeting) => (

                                            <tr
                                                key={
                                                    meeting.meetingId
                                                }
                                            >

                                                <td>
                                                    {
                                                        meeting.title
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        meeting.meetingDate
                                                            ? meeting
                                                                .meetingDate
                                                                .split("T")[0]
                                                            : "-"
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        meeting.startTime
                                                    }

                                                    {" - "}

                                                    {
                                                        meeting.endTime
                                                    }

                                                </td>

                                                <td>
                                                    {
                                                        meeting.meetingType
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `status-badge ${getStatusClass(
                                                                meeting.status
                                                            )
                                                            }`
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

                        }

                    </tbody>

                </table>

                {/* ==========================================
                    PAGINATION
                ========================================== */}

                {
                    !loading &&
                    filteredMeetings.length > 0 &&
                    totalPages > 1 && (

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "center",
                                alignItems:
                                    "center",
                                gap: "8px",
                                marginTop: "20px",
                                flexWrap: "wrap"
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
                                            key={page}
                                            className={
                                                currentPage ===
                                                    page
                                                    ? "primary-btn"
                                                    : "secondary-btn"
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    page
                                                )
                                            }
                                        >
                                            {page}
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

                {/* ==========================================
                    PAGINATION INFO
                ========================================== */}

                {
                    !loading &&
                    filteredMeetings.length > 0 && (

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "15px",
                                color: "#666"
                            }}
                        >

                            Showing{" "}

                            <strong>
                                {
                                    indexOfFirstMeeting + 1
                                }
                            </strong>

                            {" "}to{" "}

                            <strong>
                                {
                                    Math.min(
                                        indexOfLastMeeting,
                                        filteredMeetings.length
                                    )
                                }
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {
                                    filteredMeetings.length
                                }
                            </strong>

                        </div>

                    )
                }

            </div>

        </>

    );
}

export default AssignedMeetings;