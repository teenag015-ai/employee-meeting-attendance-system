/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import api from "../services/api";

function ManagerModal({
    manager,
    departments,
    onClose,
    onSuccess
}) {

    // ==========================================
    // FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        departmentId: "",
        isActive: true
    });


    // ==========================================
    // LOAD MANAGER DATA FOR EDIT
    // ==========================================

    useEffect(() => {

        if (manager) {

            setFormData({
                name: manager.name || "",
                email: manager.email || "",
                password: "",
                departmentId:
                    manager.departmentId?.toString() || "",
                isActive:
                    manager.isActive ?? true
            });

        }
        else {

            // Reset form when adding a new manager

            setFormData({
                name: "",
                email: "",
                password: "",
                departmentId: "",
                isActive: true
            });

        }

    }, [manager]);


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        setFormData(previous => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    // ==========================================
    // HANDLE SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            // ==========================================
            // UPDATE MANAGER
            // ==========================================

            if (manager) {

                await api.put(
                    `/Manager/${manager.userId}`,
                    formData
                );

            }


            // ==========================================
            // CREATE MANAGER
            // ==========================================

            else {

                await api.post(
                    "/Manager",
                    formData
                );

            }


            // ==========================================
            // REFRESH MANAGER LIST
            // ==========================================

            if (onSuccess) {
                await onSuccess();
            }


            // ==========================================
            // CLOSE MODAL
            // ==========================================

            onClose();

        }
        catch (error) {

            console.error(
                "Manager save error:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            const backendError =
                error.response?.data;


            if (
                typeof backendError === "string"
            ) {

                alert(
                    backendError
                );

            }
            else if (
                backendError?.message
            ) {

                alert(
                    backendError.message
                );

            }
            else if (
                backendError?.title
            ) {

                alert(
                    backendError.title
                );

            }
            else {

                alert(
                    "Unable to save manager."
                );

            }

        }

    };


    // ==========================================
    // MODAL
    // ==========================================

    return (

        <div className="modal-overlay">

            <div className="modal">

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
                            manager
                                ? "Edit Manager"
                                : "Add Manager"
                        }

                    </h2>


                    <button
                        type="button"
                        onClick={onClose}
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
                    FORM
                ========================================== */}

                <form onSubmit={handleSubmit}>

                    {/* ======================================
                        NAME
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Name
                        </label>

                        <input
                            className="form-control"
                            type="text"
                            name="name"
                            value={
                                formData.name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter manager name"
                            required
                        />

                    </div>


                    {/* ======================================
                        EMAIL
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            className="form-control"
                            type="email"
                            name="email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter manager email"
                            required
                        />

                    </div>


                    {/* ======================================
                        PASSWORD
                    ====================================== */}

                    <div className="form-group">

                        <label>

                            {
                                manager
                                    ? "New Password (Optional)"
                                    : "Password"
                            }

                        </label>

                        <input
                            className="form-control"
                            type="password"
                            name="password"
                            value={
                                formData.password
                            }
                            onChange={
                                handleChange
                            }
                            placeholder={
                                manager
                                    ? "Leave blank to keep current password"
                                    : "Enter password"
                            }
                            required={
                                !manager
                            }
                        />

                    </div>


                    {/* ======================================
                        DEPARTMENT
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Department
                        </label>

                        <select
                            className="form-control"
                            name="departmentId"
                            value={
                                formData.departmentId
                            }
                            onChange={
                                handleChange
                            }
                            required
                        >

                            <option value="">
                                Select Department
                            </option>


                            {
                                departments &&
                                departments.map(
                                    (department) => (

                                        <option
                                            key={
                                                department.departmentId
                                            }
                                            value={
                                                department.departmentId
                                            }
                                        >

                                            {
                                                department.departmentName
                                            }

                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>


                    {/* ======================================
                        ACTIVE
                    ====================================== */}

                    <div
                        className="form-group"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >

                        <input
                            type="checkbox"
                            name="isActive"
                            checked={
                                formData.isActive
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <label
                            style={{
                                margin: 0
                            }}
                        >
                            Active
                        </label>

                    </div>


                    {/* ==========================================
                        BUTTONS
                    ========================================== */}

                    <div className="modal-footer">

                        {/* CANCEL */}

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>


                        {/* SAVE / UPDATE */}

                        <button
                            type="submit"
                            className="primary-btn"
                        >

                            {
                                manager
                                    ? "Update"
                                    : "Save"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default ManagerModal;