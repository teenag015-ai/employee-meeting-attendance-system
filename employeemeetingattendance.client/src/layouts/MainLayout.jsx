import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";

import "./layout.css";

function MainLayout({ children }) {
    return (
        <div className="layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <Sidebar />


            {/* =========================
                RIGHT SIDE
            ========================= */}

            <div className="main-content">

                {/* Navbar */}

                <Navbar />


                {/* Page Content */}

                <div className="page-content">

                    {children}

                </div>

            </div>


            {/* =========================
                CHATBOT
            ========================= */}

            <Chatbot />

        </div>
    );
}

export default MainLayout;