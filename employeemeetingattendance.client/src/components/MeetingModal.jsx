/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import api from "../services/api";

function MeetingModal({
    show,
    meeting,
    selectedDate,
    onClose,
    onSave
}) {

    

    const role =
        localStorage.getItem("role") || "";

    const userId =
        Number(localStorage.getItem("userId"));

    const isAdmin =
        role.toLowerCase() === "admin";

    const isManager =
        role.toLowerCase() === "manager";


    // ==========================================
    // STATE
    // ==========================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [managers, setManagers] =
        useState([]);


    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        meetingDate: "",
        startTime: "",
        endTime: "",

        meetingType:
            isAdmin
                ? "Company"
                : "Team",

        createdBy: userId,

        managerId:
            isManager
                ? userId.toString()
                : ""
    });


    // ==========================================
    // LOAD MANAGERS
    // ADMIN ONLY
    // ==========================================

    const loadManagers = async () => {

        try {

            const response =
                await api.get("/Manager");

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];

            setManagers(data);

        }
        catch (err) {

            console.error(
                "Error loading managers:",
                err
            );

            setManagers([]);

            setError(
                "Unable to load managers."
            );
        }
    };


    // ==========================================
    // LOAD MANAGERS WHEN MODAL OPENS
    // ==========================================

    useEffect(() => {

        if (!show) {
            return;
        }

        if (isAdmin) {
            loadManagers();
        }

    }, [show, isAdmin]);


    // ==========================================
    // INITIALIZE / EDIT FORM
    // ==========================================

    useEffect(() => {

        if (!show) {
            return;
        }

        setError("");


        // ==========================================
        // CREATE MODE
        // ==========================================

        if (!meeting) {

            setFormData({

                title: "",

                description: "",

                meetingDate:
                    selectedDate || "",

                startTime: "",

                endTime: "",

                meetingType:
                    isAdmin
                        ? "Company"
                        : "Team",

                createdBy: userId,

                managerId:
                    isManager
                        ? userId.toString()
                        : ""
            });

            return;
        }


        // ==========================================
        // EDIT MODE
        // ==========================================

        const existingType =
            meeting.meetingType || "Team";


        setFormData({

            title:
                meeting.title || "",

            description:
                meeting.description || "",

            meetingDate:
                meeting.meetingDate
                    ? meeting.meetingDate.split("T")[0]
                    : "",

            startTime:
                meeting.startTime
                    ? meeting.startTime.substring(0, 5)
                    : "",

            endTime:
                meeting.endTime
                    ? meeting.endTime.substring(0, 5)
                    : "",

            meetingType:
                isAdmin
                    ? existingType
                    : "Team",

            createdBy:
                meeting.createdBy || userId,

            managerId:
                isManager
                    ? userId.toString()
                    : meeting.managerId
                        ?.toString() || ""
        });

    }, [
        show,
        meeting,
        selectedDate,
        isAdmin,
        isManager,
        userId
    ]);


    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        // ==========================================
        // ADMIN COMPANY MEETING
        // CLEAR MANAGER
        // ==========================================

        if (
            name === "meetingType" &&
            isAdmin &&
            value === "Company"
        ) {

            setFormData(previous => ({

                ...previous,

                meetingType: "Company",

                managerId: ""

            }));

            setError("");

            return;
        }


        // ==========================================
        // NORMAL CHANGE
        // ==========================================

        setFormData(previous => ({

            ...previous,

            [name]: value

        }));

        setError("");
    };


    // ==========================================
    // GET TODAY
    // ==========================================

    const getTodayString = () => {

        const today =
            new Date();

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
    // CHECK PAST MEETING
    // ==========================================

    const isPastMeeting = () => {

        if (!meeting?.meetingDate) {
            return false;
        }

        const meetingDate =
            meeting.meetingDate.split("T")[0];

        return meetingDate < getTodayString();
    };


    // ==========================================
    // VALIDATION
    // ==========================================

    const validateForm = () => {

        // ==========================================
        // TITLE
        // ==========================================

        if (!formData.title.trim()) {

            setError(
                "Meeting title is required."
            );

            return false;
        }


        // ==========================================
        // DESCRIPTION
        // ==========================================

        if (!formData.description.trim()) {

            setError(
                "Description is required."
            );

            return false;
        }


        // ==========================================
        // DATE
        // ==========================================

        if (!formData.meetingDate) {

            setError(
                "Please select a meeting date."
            );

            return false;
        }


        // ==========================================
        // PAST DATE
        // ==========================================

        const today =
            getTodayString();

        if (
            formData.meetingDate <
            today
        ) {

            setError(
                meeting
                    ? "Cannot update a meeting to a past date."
                    : "Cannot create a meeting for a past date."
            );

            return false;
        }


        // ==========================================
        // PREVIOUS MEETING PROTECTION
        // ==========================================

        if (
            meeting &&
            isPastMeeting()
        ) {

            setError(
                "Previous meetings cannot be edited."
            );

            return false;
        }


        // ==========================================
        // START TIME
        // ==========================================

        if (!formData.startTime) {

            setError(
                "Start time is required."
            );

            return false;
        }


        // ==========================================
        // END TIME
        // ==========================================

        if (!formData.endTime) {

            setError(
                "End time is required."
            );

            return false;
        }


        // ==========================================
        // TIME VALIDATION
        // ==========================================

        if (
            formData.endTime <=
            formData.startTime
        ) {

            setError(
                "End time must be greater than start time."
            );

            return false;
        }


        // ==========================================
        // ADMIN TEAM MEETING
        // MANAGER REQUIRED
        // ==========================================

        if (
            isAdmin &&
            formData.meetingType === "Team" &&
            !formData.managerId
        ) {

            setError(
                "Please select a manager for the Team Meeting."
            );

            return false;
        }


        return true;
    };


    // ==========================================
    // CREATE / UPDATE
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!validateForm()) {
            return;
        }


        try {

            setLoading(true);


            // ==========================================
            // MANAGER ID
            // ==========================================

            let managerId = null;


            // ==========================================
            // MANAGER LOGGED IN
            // MANAGER CAN ONLY CREATE FOR OWN TEAM
            // ==========================================

            if (isManager) {

                managerId =
                    userId;
            }


            // ==========================================
            // ADMIN + TEAM
            // SELECTED MANAGER
            // ==========================================

            else if (
                isAdmin &&
                formData.meetingType === "Team"
            ) {

                managerId =
                    Number(
                        formData.managerId
                    );
            }


            // ==========================================
            // ADMIN + COMPANY
            // managerId stays null
            // ==========================================


            // ==========================================
            // DATA SENT TO BACKEND
            // ==========================================

            const data = {

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                meetingDate:
                    formData.meetingDate,

                startTime:
                    formData.startTime,

                endTime:
                    formData.endTime,

                meetingType:
                    isManager
                        ? "Team"
                        : formData.meetingType,

                createdBy:
                    userId,

                managerId:
                    managerId
            };


            console.log(
                "Meeting data being sent:",
                data
            );


            // ==========================================
            // UPDATE
            // ==========================================

            if (meeting) {

                await api.put(
                    `/Meeting/${meeting.meetingId}`,
                    data
                );
            }


            // ==========================================
            // CREATE
            // ==========================================

            else {

                await api.post(
                    "/Meeting",
                    data
                );
            }


            // ==========================================
            // REFRESH PARENT
            // ==========================================

            if (onSave) {
                await onSave();
            }

            // Close modal after successful save
            onClose();

        }
        catch (err) {

            console.error(
                "Meeting save error:",
                err
            );


            console.error(
                "Backend response:",
                err.response?.data
            );


            const backendError =
                err.response?.data;


            if (
                typeof backendError ===
                "string"
            ) {

                setError(
                    backendError
                );
            }

            else if (
                backendError?.message
            ) {

                setError(
                    backendError.message
                );
            }

            else if (
                backendError?.title
            ) {

                setError(
                    backendError.title
                );
            }

            else {

                setError(
                    "Unable to save meeting. Please try again."
                );
            }
        }

        finally {

            setLoading(false);
        }
    };


    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async () => {

        if (!meeting) {
            return;
        }


        // ==========================================
        // PREVENT DELETE OF PAST MEETING
        // ==========================================

        if (isPastMeeting()) {

            setError(
                "Previous meetings cannot be deleted."
            );

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this meeting?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setLoading(true);


            await api.delete(
                `/Meeting/${meeting.meetingId}`
            );


            if (onSave) {
                await onSave();
            }

            // Close modal after successful delete
            onClose();

        }
        catch (err) {

            console.error(
                "Delete meeting error:",
                err
            );


            const backendError =
                err.response?.data;


            if (
                typeof backendError ===
                "string"
            ) {

                setError(
                    backendError
                );
            }

            else if (
                backendError?.message
            ) {

                setError(
                    backendError.message
                );
            }

            else if (
                backendError?.title
            ) {

                setError(
                    backendError.title
                );
            }

            else {

                setError(
                    "Unable to delete meeting."
                );
            }
        }

        finally {

            setLoading(false);
        }
    };


    // ==========================================
    // CLOSE
    // ==========================================

    const handleClose = () => {

        if (loading) {
            return;
        }

        setError("");

        onClose();
    };


    // ==========================================
    // DO NOT DISPLAY
    // ==========================================

    if (!show) {
        return null;
    }


    // ==========================================
    // MODAL
    // ==========================================

    return (

        <div
            className="modal-overlay"
            onClick={handleClose}
        >

            <div
                className="modal"
                onClick={
                    e =>
                        e.stopPropagation()
                }
            >

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}
                >

                    <h2>
                        {
                            meeting
                                ? "Edit Meeting"
                                : "Create Meeting"
                        }
                    </h2>


                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "24px",
                            cursor: "pointer"
                        }}
                    >
                        ×
                    </button>

                </div>


                {/* ==========================================
                    ERROR
                ========================================== */}

                {
                    error && (

                        <div
                            style={{
                                background: "#ffe5e5",
                                color: "#c62828",
                                padding: "12px",
                                borderRadius: "6px",
                                marginBottom: "15px"
                            }}
                        >
                            {error}
                        </div>
                    )
                }


                {/* ==========================================
                    FORM
                ========================================== */}

                <form
                    onSubmit={handleSubmit}
                >

                    {/* ======================================
                        TITLE
                    ====================================== */}

                    <div
                        className="form-group"
                    >

                        <label>
                            Meeting Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            value={
                                formData.title
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter meeting title"
                            disabled={loading}
                        />

                    </div>


                    {/* ======================================
                        DESCRIPTION
                    ====================================== */}

                    <div
                        className="form-group"
                    >

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            className="form-control"
                            rows="3"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter meeting description"
                            disabled={loading}
                        />

                    </div>


                    {/* ======================================
                        DATE
                    ====================================== */}

                    <div
                        className="form-group"
                    >

                        <label>
                            Meeting Date
                        </label>

                        <input
                            type="date"
                            name="meetingDate"
                            className="form-control"
                            value={
                                formData.meetingDate
                            }
                            min={
                                getTodayString()
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />

                    </div>


                    {/* ======================================
                        TIME
                    ====================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "15px"
                        }}
                    >

                        {/* START */}

                        <div
                            className="form-group"
                        >

                            <label>
                                Start Time
                            </label>

                            <input
                                type="time"
                                name="startTime"
                                className="form-control"
                                value={
                                    formData.startTime
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                            />

                        </div>


                        {/* END */}

                        <div
                            className="form-group"
                        >

                            <label>
                                End Time
                            </label>

                            <input
                                type="time"
                                name="endTime"
                                className="form-control"
                                value={
                                    formData.endTime
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                            />

                        </div>

                    </div>


                    {/* ==========================================
                        ADMIN MEETING TYPE
                    ========================================== */}

                    {
                        isAdmin && (

                            <div
                                className="form-group"
                            >

                                <label>
                                    Meeting Type
                                </label>

                                <select
                                    name="meetingType"
                                    className="form-control"
                                    value={
                                        formData.meetingType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={loading}
                                >

                                    <option value="Company">
                                        Company Meeting
                                    </option>

                                    <option value="Team">
                                        Team Meeting
                                    </option>

                                </select>

                            </div>
                        )
                    }


                    {/* ==========================================
                        ADMIN TEAM MEETING → MANAGER
                    ========================================== */}

                    {
                        isAdmin &&
                        formData.meetingType === "Team" && (

                            <div
                                className="form-group"
                            >

                                <label>
                                    Select Manager
                                </label>

                                <select
                                    name="managerId"
                                    className="form-control"
                                    value={
                                        formData.managerId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={loading}
                                >

                                    <option value="">
                                        Select Manager
                                    </option>

                                    {
                                        managers.map(
                                            manager => (

                                                <option
                                                    key={
                                                        manager.userId
                                                    }
                                                    value={
                                                        manager.userId
                                                    }
                                                >
                                                    {
                                                        manager.name
                                                    }
                                                </option>

                                            )
                                        )
                                    }

                                </select>

                            </div>
                        )
                    }


                    {/* ==========================================
                        MANAGER MEETING
                    ========================================== */}

                    {
                        isManager && (

                            <div
                                className="form-group"
                            >

                                <label>
                                    Meeting Type
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value="Team Meeting"
                                    disabled
                                />

                            </div>
                        )
                    }


                    {/* ==========================================
                        BUTTONS
                    ========================================== */}

                    <div
                        className="modal-footer"
                    >

                        {/* ======================================
                            DELETE
                            ONLY TODAY / FUTURE
                        ====================================== */}

                        {
                            meeting &&
                            !isPastMeeting() && (

                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Delete
                                </button>
                            )
                        }


                        {/* ======================================
                            CANCEL
                        ====================================== */}

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={
                                handleClose
                            }
                            disabled={
                                loading
                            }
                        >
                            Cancel
                        </button>


                        {/* ======================================
                            UPDATE / CREATE
                        ====================================== */}

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={
                                loading ||
                                (meeting && isPastMeeting())
                            }
                        >
                            {
                                loading
                                    ? "Saving..."
                                    : meeting
                                        ? "Update Meeting"
                                        : "Create Meeting"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default MeetingModal;