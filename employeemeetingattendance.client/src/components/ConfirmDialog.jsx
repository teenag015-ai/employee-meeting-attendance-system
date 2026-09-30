function ConfirmDialog({
    title = "Confirmation",
    message,
    confirmText = "Yes",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false
}) {

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>
                    {title}
                </h2>

                <p
                    style={{
                        marginTop: "20px",
                        marginBottom: "25px",
                        color: "#555",
                        fontSize: "16px",
                        lineHeight: "1.6"
                    }}
                >
                    {message}
                </p>

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
                        {loading ? "Please Wait..." : confirmText}
                    </button>

                </div>

            </div>

        </div>

    );

}

export default ConfirmDialog;