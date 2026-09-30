import { useState } from "react";
import api from "../services/api";

const DepartmentModal = ({ department, onClose, onSuccess }) => {
    const [departmentName, setDepartmentName] = useState(
        department?.departmentName || ""
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        
        if (departmentName.trim() === "") {
            setError("Department Name is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = {
                departmentName: departmentName.trim()
            };

            
            if (department) {
                await api.put(
                    `/Department/${department.departmentId}`,
                    data
                );
            }

           
            else {
                await api.post("/Department", data);
            }

            
            onSuccess();

            
            onClose();
        } catch (err) {
            console.error("Department error:", err);

            if (err.response?.data) {
                alert(err.response.data);
            } else {
                alert("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="modal">

                {/* Modal Title */}
                <h2>
                    {department
                        ? "Edit Department"
                        : "Add Department"}
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    {/* Department Name */}
                    <div className="form-group">

                        <label>
                            Department Name
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Department Name"
                            value={departmentName}
                            onChange={(e) => {
                                setDepartmentName(e.target.value);
                                setError("");
                            }}
                        />

                        {/* Validation Error */}
                        {error && (
                            <p
                                style={{
                                    color: "red",
                                    marginTop: "6px",
                                    fontSize: "14px"
                                }}
                            >
                                {error}
                            </p>
                        )}

                    </div>

                    {/* Footer Buttons */}
                    <div className="modal-footer">

                        {/* Cancel */}
                        <button
                            type="button"
                            className="delete-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        {/* Save / Update */}
                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : department
                                    ? "Update"
                                    : "Save"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default DepartmentModal;