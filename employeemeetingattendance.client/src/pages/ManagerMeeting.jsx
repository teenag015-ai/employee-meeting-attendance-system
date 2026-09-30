import {
    useCallback,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import api from "../services/api";
import MeetingModal from "../components/MeetingModal";


function ManagerMeeting() {

    const navigate = useNavigate();


    // ==========================================
    // CURRENT MANAGER
    // ==========================================

    const managerId = Number(
        localStorage.getItem("userId")
    );


    // ==========================================
    // MEETINGS
    // ==========================================

    const [meetings, setMeetings] = useState([]);

    const [loading, setLoading] = useState(true);


    // ==========================================
    // MODAL
    // ==========================================

    const [showModal, setShowModal] =
        useState(false);

    const [selectedMeeting, setSelectedMeeting] =
        useState(null);

    const [selectedDate, setSelectedDate] =
        useState("");


    // ==========================================
    // CALENDAR MONTH
    // ==========================================

    const [currentMonth, setCurrentMonth] =
        useState(new Date().getMonth());

    const [currentYear, setCurrentYear] =
        useState(new Date().getFullYear());


    // ==========================================
    // SEARCH
    // ==========================================

    const [search, setSearch] = useState("");


    // ==========================================
    // PAGINATION
    // ==========================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const meetingsPerPage = 5;


    // ==========================================
    // GET TODAY
    // ==========================================

    const getTodayString = () => {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    // ==========================================
    // CHECK WHETHER MEETING IS FROM PAST
    // ==========================================

    const isPastMeeting = (meeting) => {

        if (!meeting?.meetingDate) {
            return false;
        }

        const meetingDate =
            meeting.meetingDate.split("T")[0];

        return meetingDate < getTodayString();
    };


    // ==========================================
    // LOAD MEETINGS
    // ==========================================

    const loadMeetings = useCallback(
        async () => {

            try {

                setLoading(true);

                const response =
                    await api.get(
                        `/ManagerDashboard/meetings/${managerId}?page=1&pageSize=1000`
                    );


                const allMeetings =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.data || [];


                // ==========================================
                // IMPORTANT
                // DO NOT FILTER AGAIN USING managerId
                //
                // The backend endpoint already returns
                // the meetings belonging to this manager.
                // ==========================================

                setMeetings(allMeetings);


                console.log(
                    "Manager meetings loaded:",
                    allMeetings
                );

            }
            catch (error) {

                console.error(
                    "Error loading manager meetings:",
                    error
                );

                setMeetings([]);

            }
            finally {

                setLoading(false);

            }

        },
        [managerId]
    );


    // ==========================================
    // LOAD MEETINGS ON PAGE LOAD
    // ==========================================

    useEffect(() => {

        loadMeetings();

    }, [loadMeetings]);


    // ==========================================
    // CALENDAR DATE CLICK
    // ==========================================

    const handleDateClick = (info) => {

        console.log(
            "Calendar date clicked:",
            info.dateStr
        );


        const todayString =
            getTodayString();


        // ==========================================
        // BLOCK PAST DATES
        // ==========================================

        if (
            info.dateStr < todayString
        ) {

            alert(
                "Cannot create a meeting for a past date."
            );

            return;

        }


        // ==========================================
        // CREATE MODE
        // ==========================================

        setSelectedMeeting(null);

        setSelectedDate(
            info.dateStr
        );

        setShowModal(true);

    };


    // ==========================================
    // EXISTING MEETING CLICK
    // ==========================================

    const handleEventClick = (info) => {

        const meetingId =
            Number(info.event.id);


        const meeting =
            meetings.find(
                m =>
                    Number(m.meetingId) ===
                    meetingId
            );


        if (!meeting) {
            return;
        }


        // ==========================================
        // PAST MEETING
        // VIEW / MARK ATTENDANCE
        // ==========================================

        if (isPastMeeting(meeting)) {

            navigate(
                `/attendance?meetingId=${meeting.meetingId}`
            );

            return;

        }


        // ==========================================
        // TODAY / FUTURE
        // EDIT MODE
        // ==========================================

        setSelectedMeeting(meeting);

        setSelectedDate(
            meeting.meetingDate
                ? meeting.meetingDate.split("T")[0]
                : ""
        );

        setShowModal(true);

    };


    // ==========================================
    // CALENDAR MONTH CHANGE
    // ==========================================

    const handleDatesSet = (info) => {

        const date =
            info.view.currentStart;


        setCurrentMonth(
            date.getMonth()
        );


        setCurrentYear(
            date.getFullYear()
        );


        // Reset pagination when
        // calendar month changes.
        setCurrentPage(1);

    };


    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (time) => {

        if (!time) {
            return "";
        }


        // Handles:
        // 09:30:00
        // 09:30:00.0000000
        // 09:30

        return String(time)
            .substring(0, 8);

    };


    // ==========================================
    // CALENDAR EVENTS
    // ==========================================

    const calendarEvents =
        meetings.map(
            meeting => {

                const meetingDate =
                    meeting.meetingDate
                        ? meeting.meetingDate.split("T")[0]
                        : "";


                const startTime =
                    formatTime(
                        meeting.startTime
                    ) || "09:30:00";


                const endTime =
                    formatTime(
                        meeting.endTime
                    ) || "10:00:00";


                return {

                    id:
                        String(
                            meeting.meetingId
                        ),

                    title:
                        meeting.title ||
                        "Daily Meeting",

                    start:
                        `${meetingDate}T${startTime}`,

                    end:
                        `${meetingDate}T${endTime}`,

                    allDay: false

                };

            }
        );


    // ==========================================
    // SEARCH ALL MEETINGS
    // ==========================================

    const filteredMeetings =
        meetings.filter(
            meeting => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();


                if (!searchText) {
                    return true;
                }


                return (

                    String(
                        meeting.title || ""
                    )
                        .toLowerCase()
                        .includes(searchText)


                    ||


                    String(
                        meeting.meetingType || ""
                    )
                        .toLowerCase()
                        .includes(searchText)


                    ||


                    String(
                        meeting.status || ""
                    )
                        .toLowerCase()
                        .includes(searchText)

                );

            }
        );


    // ==========================================
    // PAGINATION
    // ==========================================

    const totalPages =
        Math.ceil(
            filteredMeetings.length /
            meetingsPerPage
        );


    // ==========================================
    // SAFE CURRENT PAGE
    // ==========================================
    //
    // We do NOT use setCurrentPage()
    // inside a useEffect when search changes.
    //
    // This avoids the React ESLint warning:
    //
    // "Calling setState synchronously within
    // an effect can trigger cascading renders"
    //
    // ==========================================

    const safeCurrentPage =
        totalPages === 0
            ? 1
            : Math.min(
                currentPage,
                totalPages
            );


    const indexOfLastMeeting =
        safeCurrentPage *
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

        if (safeCurrentPage > 1) {

            setCurrentPage(
                safeCurrentPage - 1
            );

        }

    };


    // ==========================================
    // NEXT PAGE
    // ==========================================

    const goToNextPage = () => {

        if (
            safeCurrentPage < totalPages
        ) {

            setCurrentPage(
                safeCurrentPage + 1
            );

        }

    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const handleCloseModal = () => {

        setShowModal(false);

        setSelectedMeeting(null);

        setSelectedDate("");

    };


    // ==========================================
    // AFTER SAVE / DELETE
    // ==========================================

    const handleMeetingSaved = async () => {

        await loadMeetings();

        setCurrentPage(1);

        setShowModal(false);

        setSelectedMeeting(null);

        setSelectedDate("");

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
    // EDIT
    // ==========================================

    const handleEdit = (meeting) => {

        // ==========================================
        // DO NOT EDIT PREVIOUS MEETING
        // ==========================================

        if (isPastMeeting(meeting)) {

            alert(
                "Previous meetings cannot be edited."
            );

            return;

        }


        setSelectedMeeting(meeting);

        setSelectedDate(
            meeting.meetingDate
                ? meeting.meetingDate.split("T")[0]
                : ""
        );

        setShowModal(true);

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

                <h1 className="page-title">
                    Meetings
                </h1>

                <p className="page-subtitle">
                    Create and manage your team meetings.
                </p>

            </div>


            {/* ==========================================
                CALENDAR
            ========================================== */}

            <div
                className="card"
                style={{
                    marginBottom: "25px"
                }}
            >

                <FullCalendar

                    plugins={[
                        dayGridPlugin,
                        interactionPlugin
                    ]}

                    initialView="dayGridMonth"

                    initialDate={new Date()}

                    height="650px"

                    events={
                        calendarEvents
                    }

                    dateClick={
                        handleDateClick
                    }

                    eventClick={
                        handleEventClick
                    }

                    datesSet={
                        handleDatesSet
                    }

                />

            </div>


            {/* ==========================================
                MEETINGS TABLE
            ========================================== */}

            <div className="card">

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <h2
                        style={{
                            color: "#1f5fbf",
                            marginBottom: "5px"
                        }}
                    >
                        My Meetings
                    </h2>

                    <p
                        style={{
                            color: "#666",
                            margin: 0
                        }}
                    >
                        Total Meetings :{" "}

                        {
                            filteredMeetings.length
                        }

                    </p>

                </div>


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

                        className="search-input"

                        placeholder="Search meetings..."

                        value={search}

                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }

                        style={{
                            width: "300px",
                            maxWidth: "100%"
                        }}

                    />

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

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            loading ? (

                                <tr>

                                    <td
                                        colSpan="6"
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


                                filteredMeetings.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
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
                                                    : "No meetings found."
                                            }

                                        </td>

                                    </tr>

                                )


                                    :


                                    (

                                        currentMeetings.map(
                                            meeting => (

                                                <tr
                                                    key={
                                                        meeting.meetingId
                                                    }
                                                >

                                                    {/* TITLE */}

                                                    <td>

                                                        {
                                                            meeting.title
                                                        }

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        {
                                                            meeting.meetingDate
                                                                ?.split("T")[0]
                                                        }

                                                    </td>


                                                    {/* TIME */}

                                                    <td>

                                                        {
                                                            formatTime(
                                                                meeting.startTime
                                                            )
                                                        }

                                                        {" - "}

                                                        {
                                                            formatTime(
                                                                meeting.endTime
                                                            )
                                                        }

                                                    </td>


                                                    {/* TYPE */}

                                                    <td>

                                                        {
                                                            meeting.meetingType
                                                        }

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


                                                    {/* ACTIONS */}

                                                    <td>

                                                        {/* ==========================================
                                                    PREVIOUS MEETING
                                                    VIEW / MARK ATTENDANCE
                                                ========================================== */}

                                                        {
                                                            isPastMeeting(meeting) && (

                                                                <button
                                                                    className="primary-btn"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/attendance?meetingId=${meeting.meetingId}`
                                                                        )
                                                                    }
                                                                >

                                                                    View / Mark Attendance

                                                                </button>

                                                            )
                                                        }


                                                        {/* ==========================================
                                                    TODAY / FUTURE
                                                    EDIT
                                                ========================================== */}

                                                        {
                                                            !isPastMeeting(meeting) && (

                                                                <button
                                                                    className="primary-btn"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            meeting
                                                                        )
                                                                    }
                                                                >

                                                                    Edit

                                                                </button>

                                                            )
                                                        }


                                                        {/* ==========================================
                                                    COMPLETED MEETING
                                                    MARK ATTENDANCE
                                                ========================================== */}

                                                        {
                                                            !isPastMeeting(meeting) &&
                                                            meeting.status ===
                                                            "Completed" && (

                                                                <button
                                                                    className="primary-btn"
                                                                    style={{
                                                                        marginLeft: "8px"
                                                                    }}
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/attendance?meetingId=${meeting.meetingId}`
                                                                        )
                                                                    }
                                                                >

                                                                    Mark Attendance

                                                                </button>

                                                            )
                                                        }


                                                        {/* ==========================================
                                                    ATTENDANCE COMPLETED
                                                    EDIT ATTENDANCE
                                                ========================================== */}

                                                        {
                                                            !isPastMeeting(meeting) &&
                                                            meeting.status ===
                                                            "Attendance Completed" && (

                                                                <button
                                                                    className="primary-btn"
                                                                    style={{
                                                                        marginLeft: "8px"
                                                                    }}
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/attendance?meetingId=${meeting.meetingId}`
                                                                        )
                                                                    }
                                                                >

                                                                    Edit Attendance

                                                                </button>

                                                            )
                                                        }


                                                        {/* ==========================================
                                                    ONGOING
                                                ========================================== */}

                                                        {
                                                            !isPastMeeting(meeting) &&
                                                            meeting.status ===
                                                            "Ongoing" && (

                                                                <span
                                                                    className="status-badge ongoing"
                                                                    style={{
                                                                        marginLeft: "8px"
                                                                    }}
                                                                >

                                                                    Meeting In Progress

                                                                </span>

                                                            )
                                                        }

                                                    </td>

                                                </tr>

                                            )
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

                            <button
                                className="secondary-btn"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    safeCurrentPage === 1
                                }
                            >

                                Previous

                            </button>


                            {

                                Array.from(
                                    {
                                        length:
                                            totalPages
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map(
                                    page => (

                                        <button
                                            key={page}
                                            className={
                                                safeCurrentPage === page
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


                            <button
                                className="secondary-btn"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    safeCurrentPage ===
                                    totalPages
                                }
                            >

                                Next

                            </button>

                        </div>

                    )
                }

            </div>


            {/* ==========================================
                CREATE / EDIT MODAL
            ========================================== */}

            <MeetingModal

                show={
                    showModal
                }

                meeting={
                    selectedMeeting
                }

                selectedDate={
                    selectedDate
                }

                onClose={
                    handleCloseModal
                }

                onSave={
                    handleMeetingSaved
                }

            />

        </>

    );

}


export default ManagerMeeting;