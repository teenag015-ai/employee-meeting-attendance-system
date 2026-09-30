import { useEffect, useState } from "react";
import api from "../services/api";
import ManagerModal from "../components/ManagerModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";

function Manager() {

    const [managers, setManagers] = useState([]);
    const [departments, setDepartments] = useState([]);

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
    const [selectedManager, setSelectedManager] = useState(null);

    // ==========================================
    // DELETE
    // ==========================================

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteManagerId, setDeleteManagerId] = useState(null);

    // ==========================================
    // LOAD MANAGERS WHEN PAGE CHANGES
    // ==========================================

    useEffect(() => {

        loadManagers(
            currentPage,
            search
        );

    }, [currentPage]);

    // ==========================================
    // LOAD DEPARTMENTS
    // ==========================================

    useEffect(() => {

        loadDepartments();

    }, []);

    // ==========================================
    // LOAD MANAGERS
    // SEARCH + PAGINATION
    // ==========================================

    const loadManagers = async (
        page = 1,
        searchText = search
    ) => {

        try {

            setLoading(true);

            const response = await api.get(
                `/Manager?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchText || "")}`
            );

            console.log(
                "Manager response:",
                response.data
            );

            // ==========================================
            // PAGINATED RESPONSE
            // ==========================================

            if (
                response.data &&
                Array.isArray(response.data.data)
            ) {

                setManagers(
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
            // FALLBACK
            // ==========================================

            else if (
                Array.isArray(response.data)
            ) {

                setManagers(
                    response.data
                );

                setCurrentPage(page);

                setTotalPages(1);

                setTotalRecords(
                    response.data.length
                );

            }

            else {

                setManagers([]);

                setTotalPages(1);

                setTotalRecords(0);

            }

        }
        catch (error) {

            console.error(
                "Error loading managers:",
                error
            );

            setManagers([]);

            setTotalPages(1);

            setTotalRecords(0);

            alert(
                "Unable to load managers."
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

        const value = e.target.value;

        setSearch(value);

        // Always start search from page 1

        setCurrentPage(1);

        loadManagers(
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
                    "/Department?page=1&pageSize=1000"
                );

            if (
                response.data &&
                Array.isArray(
                    response.data.data
                )
            ) {

                setDepartments(
                    response.data.data
                );

            }
            else if (
                Array.isArray(
                    response.data
                )
            ) {

                setDepartments(
                    response.data
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

            alert(
                "Unable to load departments."
            );

        }

    };

    // ==========================================
    // DELETE MANAGER
    // ==========================================

    const deleteManager = async () => {

        try {

            await api.delete(
                `/Manager/${deleteManagerId}`
            );

            alert(
                "Manager deleted successfully."
            );

            setShowDeleteDialog(false);

            setDeleteManagerId(null);

            // Reload current page/search

            await loadManagers(
                currentPage,
                search
            );

        }
        catch (error) {

            console.error(
                "Error deleting manager:",
                error
            );

            setShowDeleteDialog(false);

            setDeleteManagerId(null);

            if (
                error.response
            ) {

                alert(
                    error.response.data
                );

            }
            else {

                alert(
                    "Unable to delete manager."
                );

            }

        }

    };

    // ==========================================
    // ADD MANAGER
    // ==========================================

    const handleAddManager = () => {

        setSelectedManager(null);

        setShowModal(true);

    };

    // ==========================================
    // EDIT MANAGER
    // ==========================================

    const handleEditManager = (
        manager
    ) => {

        setSelectedManager(
            manager
        );

        setShowModal(true);

    };

    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const handleCloseModal = () => {

        setShowModal(false);

        setSelectedManager(null);

    };

    // ==========================================
    // AFTER ADD / EDIT
    // ==========================================

    const handleManagerSuccess = async () => {

        await loadManagers(
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
                    Manager Management
                </h1>

                <button
                    className="primary-btn"
                    onClick={
                        handleAddManager
                    }
                >
                    + Add Manager
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
                        placeholder="Search Manager..."
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
                                                Status
                                            </th>

                                            <th>
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {
                                            managers.length === 0 ? (

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
                                                            search
                                                                ? "No managers found matching your search."
                                                                : "No Managers Found"
                                                        }

                                                    </td>

                                                </tr>

                                            )

                                                :

                                                (

                                                    managers.map(
                                                        manager => (

                                                            <tr
                                                                key={
                                                                    manager.userId
                                                                }
                                                            >

                                                                {/* NAME */}

                                                                <td>
                                                                    {
                                                                        manager.name
                                                                    }
                                                                </td>

                                                                {/* EMAIL */}

                                                                <td>
                                                                    {
                                                                        manager.email
                                                                    }
                                                                </td>

                                                                {/* DEPARTMENT */}

                                                                <td>
                                                                    {
                                                                        manager.departmentName
                                                                        || "-"
                                                                    }
                                                                </td>

                                                                {/* STATUS */}

                                                                <td>

                                                                    {
                                                                        manager.isActive ? (

                                                                            <span className="status active">
                                                                                Active
                                                                            </span>

                                                                        )

                                                                            :

                                                                            (

                                                                                <span className="status inactive">
                                                                                    Inactive
                                                                                </span>

                                                                            )
                                                                    }

                                                                </td>

                                                                {/* ACTIONS */}

                                                                <td>

                                                                    <button
                                                                        className="edit-btn"
                                                                        onClick={() =>
                                                                            handleEditManager(
                                                                                manager
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={() => {

                                                                            setDeleteManagerId(
                                                                                manager.userId
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
                                            Total Managers:
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
                MANAGER MODAL
            ========================================== */}

            {
                showModal && (

                    <ManagerModal

                        manager={
                            selectedManager
                        }

                        departments={
                            departments
                        }

                        onClose={
                            handleCloseModal
                        }

                        onSuccess={
                            handleManagerSuccess
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

                        title="Delete Manager"

                        message={
                            "Are you sure you want to delete this manager?"
                        }

                        onConfirm={
                            deleteManager
                        }

                        onCancel={() => {

                            setShowDeleteDialog(
                                false
                            );

                            setDeleteManagerId(
                                null
                            );

                        }}

                    />

                )
            }

        </>

    );

}

export default Manager;