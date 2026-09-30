import { useNavigate } from "react-router-dom";

function Unauthorized() {

    const navigate = useNavigate();

    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#eef5fc",
                textAlign: "center",
                padding: "20px"
            }}
        >

            <h1
                style={{
                    color: "#dc3545",
                    fontSize: "42px",
                    marginBottom: "20px"
                }}
            >
                403
            </h1>

            <h2
                style={{
                    color: "#1565C0",
                    marginBottom: "15px"
                }}
            >
                Unauthorized Access
            </h2>

            <p
                style={{
                    color: "#666",
                    marginBottom: "30px",
                    maxWidth: "450px"
                }}
            >
                You do not have permission to access this page.
            </p>

            <button
                className="primary-btn"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>

        </div>

    );
}

export default Unauthorized;