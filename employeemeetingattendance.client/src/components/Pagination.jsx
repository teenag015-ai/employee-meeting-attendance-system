function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {

    if (totalPages <= 1)
        return null;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (

        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap"
            }}
        >

            <button
                className="secondary-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>

            {

                pages.map(page => (

                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={{
                            minWidth: "40px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #1976d2",
                            cursor: "pointer",
                            background:
                                currentPage === page
                                    ? "#1976d2"
                                    : "#fff",
                            color:
                                currentPage === page
                                    ? "#fff"
                                    : "#1976d2",
                            fontWeight: "600"
                        }}
                    >
                        {page}
                    </button>

                ))

            }

            <button
                className="secondary-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>

        </div>

    );

}

export default Pagination;