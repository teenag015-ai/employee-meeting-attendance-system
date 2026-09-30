import { useEffect, useState } from "react";
import api from "../services/api";

function EmployeeModal({
    employee,
    departments,
    managers,
    onClose,
    onSuccess
}) {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        departmentId: "",
        managerId: "",
        isActive: true
    });

    useEffect(() => {

        if (employee) {

            setFormData({
                name: employee.name,
                email: employee.email,
                password: "",
                departmentId: employee.departmentId,
                managerId: employee.managerId,
                isActive: employee.isActive
            });

        }

    }, [employee]);

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            if (employee) {

                await api.put(
                    `/Employee/${employee.userId}`,
                    formData
                );

            }
            else {

                await api.post(
                    "/Employee",
                    formData
                );

            }

            onSuccess();

            onClose();

        }
        catch (error) {

            console.log(error);

            alert("Unable to save employee.");

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>

                    {
                        employee
                            ? "Edit Employee"
                            : "Add Employee"
                    }

                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>

                            {
                                employee
                                    ? "New Password (Optional)"
                                    : "Password"
                            }

                        </label>

                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!employee}
                        />

                    </div>

                    <div className="form-group">

                        <label>Department</label>

                        <select
                            className="form-control"
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Department
                            </option>

                            {

                                departments.map(department => (

                                    <option
                                        key={department.departmentId}
                                        value={department.departmentId}
                                    >
                                        {department.departmentName}
                                    </option>

                                ))

                            }

                        </select>

                    </div>

                    <div className="form-group">

                        <label>Reporting Manager</label>

                        <select
                            className="form-control"
                            name="managerId"
                            value={formData.managerId}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Manager
                            </option>

                            {

                                managers.map(manager => (

                                    <option
                                        key={manager.userId}
                                        value={manager.userId}
                                    >
                                        {manager.name}
                                    </option>

                                ))

                            }

                        </select>

                    </div>

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
                            checked={formData.isActive}
                            onChange={handleChange}
                        />

                        <label>Active</label>

                    </div>

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-btn"
                        >
                            {
                                employee
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

export default EmployeeModal;