import { useEffect, useState } from "react";
import api from "../services/api";
import DepartmentModal from "../components/DepartmentModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";

function Department() {

    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState(null);

    const [loading, setLoading] = useState(false);

    

    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(1);

    const [totalRecords, setTotalRecords] = useState(0);

    

    const [showDeleteDialog, setShowDeleteDialog] =
        useState(false);

    const [deleteDepartmentId, setDeleteDepartmentId] =
        useState(null);

    

    useEffect(() => {

        loadDepartments(
            currentPage,
            search
        );

    }, [currentPage]);

    // ==========================================
    // LOAD DEPARTMENTS
    // SEARCH + PAGINATION
    // ==========================================

    const loadDepartments = async (
        page = 1,
        searchText = search
    ) => {

        try {

            setLoading(true);

            const response = await api.get(
                `/Department?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchText || "")}`
            );

            console.log(
                "Department response:",
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

                setDepartments(
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

            // ==========================================
            // FALLBACK IF API RETURNS ARRAY
            // ==========================================

            else if (
                Array.isArray(
                    response.data
                )
            ) {

                setDepartments(
                    response.data
                );

                setCurrentPage(page);

                setTotalPages(1);

                setTotalRecords(
                    response.data.length
                );

            }

            else {

                setDepartments([]);

                setCurrentPage(page);

                setTotalPages(1);

                setTotalRecords(0);

            }

        }
        catch (error) {

            console.error(
                "Error loading departments:",
                error
            );

            setDepartments([]);

            setTotalPages(1);

            setTotalRecords(0);

            alert(
                "Failed to load departments."
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

        // Search results should always
        // start from page 1.

        setCurrentPage(1);

        loadDepartments(
            1,
            value
        );

    };

    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    const deleteDepartment = async () => {

        try {

            await api.delete(
                `/Department/${deleteDepartmentId}`
            );

            alert(
                "Department deleted successfully."
            );

            setShowDeleteDialog(false);

            setDeleteDepartmentId(null);

            // Reload current search/page

            await loadDepartments(
                currentPage,
                search
            );

        }
        catch (error) {

            console.error(
                "Error deleting department:",
                error
            );

            setShowDeleteDialog(false);

            setDeleteDepartmentId(null);

            if (
                error.response
            ) {

                alert(
                    error.response.data
                );

            }
            else {

                alert(
                    "Unable to delete department."
                );

            }

        }

    };

    // ==========================================
    // ADD DEPARTMENT
    // ==========================================

    const handleAddDepartment = () => {

        setSelectedDepartment(null);

        setShowModal(true);

    };

    // ==========================================
    // EDIT DEPARTMENT
    // ==========================================

    const handleEditDepartment = (
        department
    ) => {

        setSelectedDepartment(
            department
        );

        setShowModal(true);

    };

    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const handleCloseModal = () => {

        setShowModal(false);

        setSelectedDepartment(null);

    };

    // ==========================================
    // AFTER ADD / EDIT
    // ==========================================

    const handleDepartmentSuccess = async () => {

        await loadDepartments(
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

                <h2 className="page-title">
                    Department Management
                </h2>

                <button
                    className="primary-btn"
                    onClick={
                        handleAddDepartment
                    }
                >
                    + Add Department
                </button>

            </div>

            {/* ==========================================
                MAIN CARD
            ========================================== */}

            <div className="card">

                {/* ==========================================
                    SEARCH
                ========================================== */}

                <div className="search-container">

                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search Department..."
                        value={search}
                        onChange={
                            handleSearch
                        }
                    />

                </div>

                {/* ==========================================
                    CONTENT
                ========================================== */}

                {
                    loading ? (

                        <h3
                            style={{
                                textAlign: "center",
                                padding: "40px"
                            }}
                        >
                            Loading...
                        </h3>

                    )

                        :

                        (

                            <>

                                {/* ==========================================
                                TABLE
                            ========================================== */}

                                <table className="custom-table">

                                    <thead>

                                        <tr>

                                            <th
                                                style={{
                                                    width: "80px"
                                                }}
                                            >
                                                ID
                                            </th>

                                            <th>
                                                Department Name
                                            </th>

                                            <th>
                                                Created Date
                                            </th>

                                            <th
                                                style={{
                                                    width: "170px"
                                                }}
                                            >
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {
                                            departments.length === 0 ? (

                                                <tr>

                                                    <td
                                                        colSpan="4"
                                                        style={{
                                                            textAlign:
                                                                "center",
                                                            padding:
                                                                "30px"
                                                        }}
                                                    >
                                                        {
                                                            search
                                                                ? "No departments found matching your search."
                                                                : "No Departments Found"
                                                        }
                                                    </td>

                                                </tr>

                                            )

                                                :

                                                (

                                                    departments.map(
                                                        department => (

                                                            <tr
                                                                key={
                                                                    department.departmentId
                                                                }
                                                            >

                                                                {/* ID */}

                                                                <td>
                                                                    {
                                                                        department.departmentId
                                                                    }
                                                                </td>

                                                                {/* NAME */}

                                                                <td>
                                                                    {
                                                                        department.departmentName
                                                                    }
                                                                </td>

                                                                {/* CREATED DATE */}

                                                                <td>

                                                                    {
                                                                        department.createdDate
                                                                            ? new Date(
                                                                                department.createdDate
                                                                            ).toLocaleDateString()
                                                                            : "-"
                                                                    }

                                                                </td>

                                                                {/* ACTIONS */}

                                                                <td>

                                                                    <button
                                                                        className="edit-btn"
                                                                        onClick={() =>
                                                                            handleEditDepartment(
                                                                                department
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={() => {

                                                                            setDeleteDepartmentId(
                                                                                department.departmentId
                                                                            );

                                                                            setShowDeleteDialog(
                                                                                true
                                                                            );

                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )

                                                )
                                        }

                                    </tbody>

                                </table>

                                {/* ==========================================
                                PAGINATION FOOTER
                            ========================================== */}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        marginTop:
                                            "20px",
                                        flexWrap:
                                            "wrap",
                                        gap:
                                            "10px"
                                    }}
                                >

                                    <div>

                                        <strong>
                                            Total Departments:
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

                            </>

                        )
                }

            </div>

            {/* ==========================================
                DEPARTMENT MODAL
            ========================================== */}

            {
                showModal && (

                    <DepartmentModal

                        department={
                            selectedDepartment
                        }

                        onClose={
                            handleCloseModal
                        }

                        onSuccess={
                            handleDepartmentSuccess
                        }

                    />

                )
            }

            {/* ==========================================
                DELETE CONFIRMATION
            ========================================== */}

            {
                showDeleteDialog && (

                    <ConfirmDialog

                        title="Delete Department"

                        message={
                            "Are you sure you want to delete this department?"
                        }

                        onConfirm={
                            deleteDepartment
                        }

                        onCancel={() => {

                            setShowDeleteDialog(
                                false
                            );

                            setDeleteDepartmentId(
                                null
                            );

                        }}

                    />

                )
            }

        </>

    );

}

export default Department;