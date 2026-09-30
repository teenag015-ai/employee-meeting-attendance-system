import { useEffect, useState } from "react";
import api from "../services/api";
import EmployeeModal from "../components/EmployeeModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";

function Employee() {

    const [employees, setEmployees] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [managers, setManagers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);

    // ==========================================
    // PAGINATION
    // ==========================================

    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(1);

    const [totalRecords, setTotalRecords] = useState(0);

    // ==========================================
    // MODAL
    // ==========================================

    const [showModal, setShowModal] = useState(false);

    const [selectedEmployee, setSelectedEmployee] =
        useState(null);

    // ==========================================
    // DELETE
    // ==========================================

    const [showDeleteDialog, setShowDeleteDialog] =
        useState(false);

    const [deleteEmployeeId, setDeleteEmployeeId] =
        useState(null);

    // ==========================================
    // LOAD EMPLOYEES
    // ==========================================

    useEffect(() => {

        loadEmployees(currentPage, search);

    }, [currentPage]);

    // ==========================================
    // LOAD DEPARTMENTS + MANAGERS
    // ==========================================

    useEffect(() => {

        loadDepartments();

        loadManagers();

    }, []);

    // ==========================================
    // LOAD EMPLOYEES FROM SERVER
    // ==========================================

    const loadEmployees = async (
        page = 1,
        searchText = search
    ) => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    `/Employee?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchText || "")}`
                );

            console.log(
                "Employee response:",
                response.data
            );

            if (
                response.data &&
                Array.isArray(
                    response.data.data
                )
            ) {

                setEmployees(
                    response.data.data
                );

                setCurrentPage(
                    response.data.currentPage || page
                );

                setTotalPages(
                    response.data.totalPages || 1
                );

                setTotalRecords(
                    response.data.totalRecords || 0
                );

            }

            else if (
                Array.isArray(
                    response.data
                )
            ) {

                setEmployees(
                    response.data
                );

                setCurrentPage(page);

                setTotalPages(1);

                setTotalRecords(
                    response.data.length
                );

            }

            else {

                setEmployees([]);

                setTotalPages(1);

                setTotalRecords(0);

            }

        }
        catch (error) {

            console.error(
                "Error loading employees:",
                error
            );

            setEmployees([]);

            setTotalPages(1);

            setTotalRecords(0);

            alert(
                "Unable to load employees."
            );

        }
        finally {

            setLoading(false);

        }

    };

    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearch = (e) => {

        const value =
            e.target.value;

        setSearch(value);

        // Always go back to page 1
        // when a new search starts.

        setCurrentPage(1);

        loadEmployees(
            1,
            value
        );

    };

    // ==========================================
    // LOAD DEPARTMENTS
    // ==========================================

    const loadDepartments = async () => {

        try {

            const response =
                await api.get(
                    "/Department"
                );

            if (
                Array.isArray(
                    response.data
                )
            ) {

                setDepartments(
                    response.data
                );

            }
            else if (
                response.data &&
                Array.isArray(
                    response.data.data
                )
            ) {

                setDepartments(
                    response.data.data
                );

            }
            else {

                setDepartments([]);

            }

        }
        catch (error) {

            console.error(
                "Error loading departments:",
                error
            );

            setDepartments([]);

        }

    };

    // ==========================================
    // LOAD MANAGERS
    // ==========================================

    const loadManagers = async () => {

        try {

            const response =
                await api.get(
                    "/Manager"
                );

            if (
                Array.isArray(
                    response.data
                )
            ) {

                setManagers(
                    response.data
                );

            }
            else if (
                response.data &&
                Array.isArray(
                    response.data.data
                )
            ) {

                setManagers(
                    response.data.data
                );

            }
            else {

                setManagers([]);

            }

        }
        catch (error) {

            console.error(
                "Error loading managers:",
                error
            );

            setManagers([]);

        }

    };

    // ==========================================
    // ADD EMPLOYEE
    // ==========================================

    const handleAddEmployee = () => {

        setSelectedEmployee(null);

        setShowModal(true);

    };

    // ==========================================
    // EDIT EMPLOYEE
    // ==========================================

    const handleEditEmployee = (
        employee
    ) => {

        setSelectedEmployee(
            employee
        );

        setShowModal(true);

    };

    // ==========================================
    // DELETE CLICK
    // ==========================================

    const handleDeleteClick = (
        employeeId
    ) => {

        setDeleteEmployeeId(
            employeeId
        );

        setShowDeleteDialog(
            true
        );

    };

    // ==========================================
    // DELETE EMPLOYEE
    // ==========================================

    const deleteEmployee = async () => {

        try {

            await api.delete(
                `/Employee/${deleteEmployeeId}`
            );

            alert(
                "Employee deleted successfully."
            );

            setShowDeleteDialog(
                false
            );

            setDeleteEmployeeId(
                null
            );

            await loadEmployees(
                currentPage,
                search
            );

        }
        catch (error) {

            console.error(
                "Error deleting employee:",
                error
            );

            setShowDeleteDialog(
                false
            );

            if (
                error.response?.data
            ) {

                alert(
                    error.response.data
                );

            }
            else {

                alert(
                    "Unable to delete employee."
                );

            }

        }

    };

    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const handleCloseModal = () => {

        setShowModal(false);

        setSelectedEmployee(null);

    };

    // ==========================================
    // SUCCESS AFTER ADD / EDIT
    // ==========================================

    const handleEmployeeSuccess = async () => {

        await loadEmployees(
            currentPage,
            search
        );

    };

    return (

        <>

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="page-header">

                <h1 className="page-title">
                    Employee Management
                </h1>

                <button
                    className="primary-btn"
                    onClick={
                        handleAddEmployee
                    }
                >
                    + Add Employee
                </button>

            </div>

            {/* ==========================================
                CARD
            ========================================== */}

            <div className="card">

                {/* ==========================================
                    SEARCH
                ========================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                    }}
                >

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Employee..."
                        value={search}
                        onChange={
                            handleSearch
                        }
                        style={{
                            width: "300px"
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
                                Name
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Reporting Manager
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

                                employees.length === 0 ? (

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
                                            No employees found.
                                        </td>

                                    </tr>

                                )

                                    :

                                    employees.map(
                                        employee => (

                                            <tr
                                                key={
                                                    employee.userId
                                                }
                                            >

                                                <td>
                                                    {
                                                        employee.name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        employee.email
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        employee.departmentName
                                                        || "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        employee.managerName
                                                        || "-"
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        employee.isActive ? (

                                                            <span className="status-badge completed">
                                                                Active
                                                            </span>

                                                        )

                                                            :

                                                            (

                                                                <span className="status-badge pending">
                                                                    Inactive
                                                                </span>

                                                            )
                                                    }

                                                </td>

                                                <td>

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            handleEditEmployee(
                                                                employee
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                employee.userId
                                                            )
                                                        }
                                                    >
                                                        Delete
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

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        marginTop:
                            "20px"
                    }}
                >

                    <div>

                        <strong>
                            Total Employees:
                        </strong>{" "}

                        {
                            totalRecords
                        }

                    </div>

                    {
                        totalPages > 1 && (

                            <Pagination
                                currentPage={
                                    currentPage
                                }
                                totalPages={
                                    totalPages
                                }
                                onPageChange={
                                    setCurrentPage
                                }
                            />

                        )
                    }

                </div>

            </div>

            {/* ==========================================
                EMPLOYEE MODAL
            ========================================== */}

            {
                showModal && (

                    <EmployeeModal

                        employee={
                            selectedEmployee
                        }

                        departments={
                            departments
                        }

                        managers={
                            managers
                        }

                        onClose={
                            handleCloseModal
                        }

                        onSuccess={
                            handleEmployeeSuccess
                        }

                    />

                )
            }

            {/* ==========================================
                DELETE DIALOG
            ========================================== */}

            {
                showDeleteDialog && (

                    <ConfirmDialog

                        title="Delete Employee"

                        message={
                            "Are you sure you want to delete this employee?"
                        }

                        onConfirm={
                            deleteEmployee
                        }

                        onCancel={() => {

                            setShowDeleteDialog(
                                false
                            );

                            setDeleteEmployeeId(
                                null
                            );

                        }}

                    />

                )
            }

        </>

    );

}

export default Employee;