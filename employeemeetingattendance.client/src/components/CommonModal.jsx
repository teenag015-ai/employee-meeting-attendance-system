const ConfirmDialog = ({
    title = "Confirmation",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false
}) => {

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>{title}</h2>

                <div
                    style={{
                        marginTop: "20px",
                        marginBottom: "30px"
                    }}
                >

                    <p
                        style={{
                            fontSize: "16px",
                            color: "#555",
                            lineHeight: "1.6",
                            margin: 0
                        }}
                    >
                        {message}
                    </p>

                </div>

                <div className="modal-footer">

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="delete-btn"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : confirmText}
                    </button>

                </div>

            </div>

        </div>

    );

};

export default ConfirmDialog;