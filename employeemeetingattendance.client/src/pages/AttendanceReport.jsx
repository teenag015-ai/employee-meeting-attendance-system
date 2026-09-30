/* eslint-disable react-hooks/set-state-in-effect */

import {
    useCallback,
    useEffect,
    useState
} from "react";

import api from "../services/api";
import AttendanceDetailsModal from "../components/AttendanceDetailsModal";


function AttendanceReport() {

    // ==========================================
    // USER / ROLE
    // ==========================================

    const role =
        localStorage.getItem("role");

    const managerId =
        localStorage.getItem("userId");


    // ==========================================
    // REPORT DATA
    // ==========================================

    const [reports, setReports] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // EXCEL DOWNLOAD
    // ==========================================

    const [downloadingExcel, setDownloadingExcel] =
        useState(false);


    // ==========================================
    // SEARCH
    // ==========================================

    const [search, setSearch] =
        useState("");


    // ==========================================
    // FILTERS
    // ==========================================

    const [selectedMonth, setSelectedMonth] =
        useState("");

    const [selectedYear, setSelectedYear] =
        useState(
            String(new Date().getFullYear())
        );


    // ==========================================
    // PAGINATION
    // ==========================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const recordsPerPage = 5;

    const [totalRecords, setTotalRecords] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);


    // ==========================================
    // MODAL
    // ==========================================

    const [showModal, setShowModal] =
        useState(false);

    const [selectedMeetingId, setSelectedMeetingId] =
        useState(null);


    // ==========================================
    // MONTHS
    // ==========================================

    const months = [
        {
            value: "",
            label: "All Months"
        },
        {
            value: "1",
            label: "January"
        },
        {
            value: "2",
            label: "February"
        },
        {
            value: "3",
            label: "March"
        },
        {
            value: "4",
            label: "April"
        },
        {
            value: "5",
            label: "May"
        },
        {
            value: "6",
            label: "June"
        },
        {
            value: "7",
            label: "July"
        },
        {
            value: "8",
            label: "August"
        },
        {
            value: "9",
            label: "September"
        },
        {
            value: "10",
            label: "October"
        },
        {
            value: "11",
            label: "November"
        },
        {
            value: "12",
            label: "December"
        }
    ];


    // ==========================================
    // YEARS
    // ==========================================

    const currentYear =
        new Date().getFullYear();

    const years = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3
    ];


    // ==========================================
    // LOAD REPORTS
    // ==========================================

    const loadReports = useCallback(async () => {

        try {

            setLoading(true);


            const queryParams =
                new URLSearchParams();


            // ==========================================
            // PAGE
            // ==========================================

            queryParams.append(
                "page",
                currentPage.toString()
            );


            // ==========================================
            // PAGE SIZE
            // ==========================================

            queryParams.append(
                "pageSize",
                recordsPerPage.toString()
            );


            // ==========================================
            // MONTH
            // ==========================================

            if (
                selectedMonth !== null &&
                selectedMonth !== undefined &&
                selectedMonth !== ""
            ) {

                queryParams.append(
                    "month",
                    selectedMonth
                );

            }


            // ==========================================
            // YEAR
            // ==========================================

            if (
                selectedYear !== null &&
                selectedYear !== undefined &&
                selectedYear !== ""
            ) {

                queryParams.append(
                    "year",
                    selectedYear
                );

            }


            // ==========================================
            // SEARCH
            // ==========================================

            if (
                search.trim() !== ""
            ) {

                queryParams.append(
                    "search",
                    search.trim()
                );

            }


            console.log(
                "Attendance Report Query:",
                queryParams.toString()
            );


            let response;


            // ==========================================
            // MANAGER REPORT
            // ==========================================

            if (
                role === "Manager" &&
                managerId
            ) {

                response =
                    await api.get(
                        `/AttendanceReport/manager/${managerId}?${queryParams.toString()}`
                    );

            }


            // ==========================================
            // ADMIN REPORT
            // ==========================================

            else {

                response =
                    await api.get(
                        `/AttendanceReport?${queryParams.toString()}`
                    );

            }


            console.log(
                "Attendance Report API Response:",
                response.data
            );


            // ==========================================
            // PAGINATED RESPONSE
            // ==========================================

            if (
                response.data &&
                Array.isArray(
                    response.data.data
                )
            ) {

                const data =
                    response.data.data;


                setReports(data);


                setTotalRecords(
                    Number(
                        response.data.totalRecords
                    ) || 0
                );


                setTotalPages(
                    Number(
                        response.data.totalPages
                    ) || 0
                );

            }


            // ==========================================
            // ARRAY RESPONSE
            // ==========================================

            else if (
                Array.isArray(
                    response.data
                )
            ) {

                const data =
                    response.data;


                setReports(data);


                setTotalRecords(
                    data.length
                );


                setTotalPages(
                    Math.ceil(
                        data.length /
                        recordsPerPage
                    )
                );

            }


            // ==========================================
            // INVALID RESPONSE
            // ==========================================

            else {

                console.warn(
                    "Unexpected Attendance Report response:",
                    response.data
                );


                setReports([]);

                setTotalRecords(0);

                setTotalPages(0);

            }

        }
        catch (error) {

            console.error(
                "Error loading attendance reports:",
                error
            );


            if (error.response) {

                console.error(
                    "Server response:",
                    error.response.data
                );


                console.error(
                    "Status:",
                    error.response.status
                );

            }


            setReports([]);

            setTotalRecords(0);

            setTotalPages(0);

        }
        finally {

            setLoading(false);

        }

    }, [
        currentPage,
        selectedMonth,
        selectedYear,
        search,
        role,
        managerId
    ]);


    // ==========================================
    // LOAD REPORTS WHEN FILTERS CHANGE
    // ==========================================

    useEffect(() => {

        loadReports();

    }, [loadReports]);


    // ==========================================
    // DOWNLOAD EXCEL
    // ==========================================

    const handleDownloadExcel = async () => {

        try {

            setDownloadingExcel(true);


            console.log(
                "Downloading attendance Excel..."
            );


            // ==========================================
            // BUILD FILTER PARAMETERS
            // ==========================================

            const queryParams =
                new URLSearchParams();


            if (
                selectedMonth !== null &&
                selectedMonth !== undefined &&
                selectedMonth !== ""
            ) {

                queryParams.append(
                    "month",
                    selectedMonth
                );

            }


            if (
                selectedYear !== null &&
                selectedYear !== undefined &&
                selectedYear !== ""
            ) {

                queryParams.append(
                    "year",
                    selectedYear
                );

            }


            if (
                search.trim() !== ""
            ) {

                queryParams.append(
                    "search",
                    search.trim()
                );

            }


            // ==========================================
            // CALL EXCEL API
            // ==========================================

            const response =
                await api.get(
                    `/Attendance/export-excel${queryParams.toString()
                        ? `?${queryParams.toString()}`
                        : ""
                    }`,
                    {
                        responseType: "blob"
                    }
                );


            // ==========================================
            // CREATE EXCEL BLOB
            // ==========================================

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                );


            // ==========================================
            // CREATE DOWNLOAD URL
            // ==========================================

            const url =
                window.URL.createObjectURL(
                    blob
                );


            // ==========================================
            // CREATE LINK
            // ==========================================

            const link =
                document.createElement("a");

            link.href = url;


            // ==========================================
            // GET MONTH NAME
            // ==========================================

            const selectedMonthObject =
                months.find(
                    month =>
                        month.value ===
                        selectedMonth
                );


            const monthName =
                selectedMonthObject
                    ? selectedMonthObject.label
                    : "All_Months";


            // ==========================================
            // FILE NAME
            // ==========================================

            link.download =
                `Attendance_Report_${monthName}_${selectedYear}.xlsx`;


            // ==========================================
            // START DOWNLOAD
            // ==========================================

            document.body.appendChild(
                link
            );

            link.click();


            // ==========================================
            // CLEAN UP
            // ==========================================

            link.remove();

            window.URL.revokeObjectURL(
                url
            );


            console.log(
                "Excel downloaded successfully."
            );

        }
        catch (error) {

            console.error(
                "Excel download error:",
                error
            );


            alert(
                "Unable to download attendance Excel file."
            );

        }
        finally {

            setDownloadingExcel(false);

        }

    };


    // ==========================================
    // VIEW ATTENDANCE
    // ==========================================

    const handleViewAttendance =
        (meetingId) => {

            setSelectedMeetingId(
                meetingId
            );

            setShowModal(true);

        };


    // ==========================================
    // SEARCH CHANGE
    // ==========================================

    const handleSearchChange =
        (e) => {

            setSearch(
                e.target.value
            );

            setCurrentPage(1);

        };


    // ==========================================
    // MONTH CHANGE
    // ==========================================

    const handleMonthChange =
        (e) => {

            setSelectedMonth(
                e.target.value
            );

            setCurrentPage(1);

        };


    // ==========================================
    // YEAR CHANGE
    // ==========================================

    const handleYearChange =
        (e) => {

            setSelectedYear(
                e.target.value
            );

            setCurrentPage(1);

        };


    // ==========================================
    // PAGE CHANGE
    // ==========================================

    const goToPage =
        (page) => {

            if (
                page >= 1 &&
                page <= totalPages
            ) {

                setCurrentPage(page);

            }

        };


    // ==========================================
    // PREVIOUS PAGE
    // ==========================================

    const goToPreviousPage =
        () => {

            if (
                currentPage > 1
            ) {

                setCurrentPage(
                    currentPage - 1
                );

            }

        };


    // ==========================================
    // NEXT PAGE
    // ==========================================

    const goToNextPage =
        () => {

            if (
                currentPage < totalPages
            ) {

                setCurrentPage(
                    currentPage + 1
                );

            }

        };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal =
        () => {

            setShowModal(false);

            setSelectedMeetingId(null);

        };


    // ==========================================
    // PAGE NUMBERS
    // ==========================================

    const getPageNumbers =
        () => {

            if (
                totalPages <= 1
            ) {

                return [];

            }


            const pages = [];


            // ==========================================
            // SHOW ALL PAGES
            // ==========================================

            if (
                totalPages <= 7
            ) {

                for (
                    let i = 1;
                    i <= totalPages;
                    i++
                ) {

                    pages.push(i);

                }

                return pages;

            }


            // ==========================================
            // FIRST PAGE
            // ==========================================

            pages.push(1);


            let startPage =
                Math.max(
                    2,
                    currentPage - 2
                );


            let endPage =
                Math.min(
                    totalPages - 1,
                    currentPage + 2
                );


            // ==========================================
            // LEFT ELLIPSIS
            // ==========================================

            if (
                startPage > 2
            ) {

                pages.push("...");

            }


            // ==========================================
            // PAGE NUMBERS
            // ==========================================

            for (
                let i = startPage;
                i <= endPage;
                i++
            ) {

                pages.push(i);

            }


            // ==========================================
            // RIGHT ELLIPSIS
            // ==========================================

            if (
                endPage <
                totalPages - 1
            ) {

                pages.push("...");

            }


            // ==========================================
            // LAST PAGE
            // ==========================================

            pages.push(
                totalPages
            );


            return pages;

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
                        Attendance Report
                    </h1>

                    <p className="page-subtitle">
                        View attendance summary for meetings.
                    </p>

                </div>

            </div>


            {/* ==========================================
                REPORT CARD
            ========================================== */}

            <div className="card">


                {/* ==========================================
                    FILTERS
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


                    {/* ======================================
                        SEARCH
                    ====================================== */}

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Meeting..."
                        value={search}
                        onChange={
                            handleSearchChange
                        }
                        style={{
                            width: "300px"
                        }}
                    />


                    {/* ======================================
                        MONTH
                    ====================================== */}

                    <select
                        className="form-control"
                        value={selectedMonth}
                        onChange={
                            handleMonthChange
                        }
                        style={{
                            width: "180px"
                        }}
                    >

                        {
                            months.map(
                                (month) => (

                                    <option
                                        key={
                                            month.value
                                        }
                                        value={
                                            month.value
                                        }
                                    >

                                        {
                                            month.label
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    {/* ======================================
                        YEAR
                    ====================================== */}

                    <select
                        className="form-control"
                        value={selectedYear}
                        onChange={
                            handleYearChange
                        }
                        style={{
                            width: "150px"
                        }}
                    >

                        {
                            years.map(
                                (year) => (

                                    <option
                                        key={year}
                                        value={year}
                                    >

                                        {year}

                                    </option>

                                )
                            )
                        }

                    </select>


                    {/* ======================================
                        DOWNLOAD EXCEL
                    ====================================== */}

                    <button
                        type="button"
                        className="primary-btn"
                        onClick={
                            handleDownloadExcel
                        }
                        disabled={
                            downloadingExcel ||
                            loading
                        }
                        style={{
                            minWidth: "160px",
                            whiteSpace: "nowrap"
                        }}
                    >

                        {
                            downloadingExcel
                                ? "Downloading..."
                                : "Download Excel"
                        }

                    </button>

                </div>


                {/* ==========================================
                    REPORT COUNT
                ========================================== */}

                <div
                    style={{
                        marginBottom: "15px",
                        color: "#666"
                    }}
                >

                    Showing{" "}

                    <strong>
                        {reports.length}
                    </strong>

                    {" "}reports on this page

                    {" | "}

                    Total Reports:{" "}

                    <strong>
                        {totalRecords}
                    </strong>

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

                            {
                                role === "Admin" && (

                                    <th>
                                        Conducted By
                                    </th>

                                )
                            }

                            <th>
                                Total
                            </th>

                            <th>
                                Present
                            </th>

                            <th>
                                Absent
                            </th>

                            <th>
                                Attendance %
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {/* ==================================
                            LOADING
                        ================================== */}

                        {
                            loading ? (

                                <tr>

                                    <td
                                        colSpan={
                                            role === "Admin"
                                                ? 9
                                                : 8
                                        }
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


                                /* ==================================
                                   EMPTY
                                ================================== */

                                reports.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={
                                                role === "Admin"
                                                    ? 9
                                                    : 8
                                            }
                                            style={{
                                                textAlign:
                                                    "center",
                                                padding:
                                                    "30px"
                                            }}
                                        >

                                            {
                                                search.trim()
                                                    ? "No attendance reports found for this search."
                                                    : "No attendance reports found."
                                            }

                                        </td>

                                    </tr>

                                )


                                    :


                                    /* ==================================
                                       REPORT DATA
                                    ================================== */

                                    reports.map(
                                        (report) => (

                                            <tr
                                                key={
                                                    report.meetingId
                                                }
                                            >


                                                {/* MEETING */}

                                                <td>

                                                    {
                                                        report.meetingTitle
                                                    }

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {
                                                        report.meetingDate
                                                            ? report.meetingDate.split("T")[0]
                                                            : "-"
                                                    }

                                                </td>


                                                {/* TYPE */}

                                                <td>

                                                    {
                                                        report.meetingType
                                                    }

                                                </td>


                                                {/* CONDUCTED BY */}

                                                {
                                                    role === "Admin" && (

                                                        <td>

                                                            {
                                                                report.conductedBy ||
                                                                "System Admin"
                                                            }

                                                        </td>

                                                    )
                                                }


                                                {/* TOTAL */}

                                                <td>

                                                    {
                                                        report.totalEmployees
                                                    }

                                                </td>


                                                {/* PRESENT */}

                                                <td>

                                                    <span className="status-badge completed">

                                                        {
                                                            report.presentCount
                                                        }

                                                    </span>

                                                </td>


                                                {/* ABSENT */}

                                                <td>

                                                    <span className="status-badge pending">

                                                        {
                                                            report.absentCount
                                                        }

                                                    </span>

                                                </td>


                                                {/* ATTENDANCE PERCENTAGE */}

                                                <td>

                                                    <span
                                                        className={
                                                            Number(
                                                                report.attendancePercentage
                                                            ) >= 75

                                                                ? "status-badge completed"

                                                                : Number(
                                                                    report.attendancePercentage
                                                                ) >= 50

                                                                    ? "status-badge ongoing"

                                                                    : "status-badge pending"
                                                        }
                                                    >

                                                        {
                                                            report.attendancePercentage
                                                        }%

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="primary-btn"
                                                        onClick={() =>
                                                            handleViewAttendance(
                                                                report.meetingId
                                                            )
                                                        }
                                                    >

                                                        View

                                                    </button>

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
                    totalRecords > 0 &&
                    totalPages > 1 && (

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "20px",
                                flexWrap: "wrap",
                                gap: "15px"
                            }}
                        >


                            {/* ==================================
                                SHOWING
                            ================================== */}

                            <div>

                                Showing{" "}

                                <strong>

                                    {
                                        (
                                            (
                                                currentPage -
                                                1
                                            ) *
                                            recordsPerPage
                                        ) + 1
                                    }

                                </strong>

                                {" "}to{" "}

                                <strong>

                                    {
                                        Math.min(
                                            currentPage *
                                            recordsPerPage,
                                            totalRecords
                                        )
                                    }

                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {totalRecords}
                                </strong>

                            </div>


                            {/* ==================================
                                PAGINATION BUTTONS
                            ================================== */}

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    flexWrap: "wrap"
                                }}
                            >


                                {/* PREVIOUS */}

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    disabled={
                                        currentPage === 1
                                    }
                                    onClick={
                                        goToPreviousPage
                                    }
                                >

                                    Previous

                                </button>


                                {/* PAGE NUMBERS */}

                                {
                                    getPageNumbers().map(
                                        (page, index) => (

                                            page === "..."

                                                ? (

                                                    <span
                                                        key={
                                                            `ellipsis-${index}`
                                                        }
                                                        style={{
                                                            padding:
                                                                "6px 10px"
                                                        }}
                                                    >

                                                        ...

                                                    </span>

                                                )

                                                : (

                                                    <button
                                                        type="button"
                                                        key={page}
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

                                                        {page}

                                                    </button>

                                                )

                                        )
                                    )
                                }


                                {/* NEXT */}

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    onClick={
                                        goToNextPage
                                    }
                                >

                                    Next

                                </button>

                            </div>

                        </div>

                    )
                }

            </div>


            {/* ==========================================
                ATTENDANCE DETAILS MODAL
            ========================================== */}

            {
                showModal && (

                    <AttendanceDetailsModal
                        meetingId={
                            selectedMeetingId
                        }
                        onClose={
                            closeModal
                        }
                    />

                )
            }

        </>

    );

}


export default AttendanceReport;