import { useState } from "react";
import api from "../services/api";
import "./Chatbot.css";

function Chatbot() {

    // ==========================================
    // USER DETAILS
    // ==========================================

    const userRole =
        localStorage.getItem("role") ||
        localStorage.getItem("userRole") ||
        "";

    const userName =
        localStorage.getItem("name") ||
        localStorage.getItem("userName") ||
        "there";


    // ==========================================
    // STATE
    // ==========================================

    const [isOpen, setIsOpen] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text:
                `Hello ${userName}! I'm your Meeting Assistant. How can I help you today?`
        }
    ]);


    // ==========================================
    // ROLE-BASED QUICK QUESTIONS
    // ==========================================

    const getQuickQuestions = () => {

        const role =
            userRole.toLowerCase();


        // ==========================================
        // ADMIN QUESTIONS
        // ==========================================

        if (role === "admin") {

            return [

                "How many employees are there?",

                "How many managers are there?",

                "How many departments do we have?",

                "What meetings are scheduled today?",

                "What are the upcoming meetings?",

                "What is the attendance percentage?"

            ];
        }


        // ==========================================
        // MANAGER QUESTIONS
        // ==========================================

        if (role === "manager") {

            return [

                "How many employees are in my team?",

                "What meetings do I have today?",

                "What are my upcoming meetings?",

                "What is my team attendance?",

                "Who is absent from my team?",

                "Show my meetings from last month."

            ];
        }


        // ==========================================
        // EMPLOYEE QUESTIONS
        // ==========================================

        return [

            "What meetings do I have today?",

            "What are my upcoming meetings?",

            "What is my attendance?",

            "What was my attendance last month?",

            "What was my attendance last year?",

            "When is my next meeting?"

        ];
    };


    // ==========================================
    // SEND MESSAGE TO BACKEND
    // ==========================================

    const sendToChatbot = async (question) => {

        try {

            setLoading(true);


            // ==========================================
            // CALL .NET CHATBOT API
            // ==========================================

            const response = await api.post(
                "/Chatbot/ask",
                {
                    message: question
                }
            );


            // ==========================================
            // GET BOT RESPONSE
            // ==========================================

            const botMessage =
                response.data?.message ||
                "I couldn't find an answer for that question.";


            // ==========================================
            // ADD BOT MESSAGE
            // ==========================================

            setMessages(previous => [

                ...previous,

                {
                    sender: "bot",
                    text: botMessage
                }

            ]);

        }

        catch (error) {

            console.error(
                "Chatbot error:",
                error
            );


            // ==========================================
            // HANDLE UNAUTHORIZED
            // ==========================================

            if (
                error.response?.status === 401
            ) {

                setMessages(previous => [

                    ...previous,

                    {
                        sender: "bot",
                        text:
                            "Your session has expired. Please log in again."
                    }

                ]);

                return;
            }


            // ==========================================
            // GENERAL ERROR
            // ==========================================

            setMessages(previous => [

                ...previous,

                {
                    sender: "bot",
                    text:
                        "I'm unable to connect to the Meeting Assistant right now. Please try again."
                }

            ]);

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // SEND USER MESSAGE
    // ==========================================

    const handleSend = async () => {

        const trimmed =
            message.trim();


        if (
            !trimmed ||
            loading
        ) {

            return;

        }


        // ==========================================
        // ADD USER MESSAGE
        // ==========================================

        setMessages(previous => [

            ...previous,

            {
                sender: "user",
                text: trimmed
            }

        ]);


        // ==========================================
        // CLEAR INPUT
        // ==========================================

        setMessage("");


        // ==========================================
        // SEND TO BACKEND
        // ==========================================

        await sendToChatbot(
            trimmed
        );

    };


    // ==========================================
    // QUICK QUESTION
    // ==========================================

    const handleQuickQuestion = async (
        question
    ) => {

        if (loading) {

            return;

        }


        // ==========================================
        // ADD USER QUESTION
        // ==========================================

        setMessages(previous => [

            ...previous,

            {
                sender: "user",
                text: question
            }

        ]);


        // ==========================================
        // SEND QUESTION
        // ==========================================

        await sendToChatbot(
            question
        );

    };


    // ==========================================
    // ENTER KEY
    // ==========================================

    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            handleSend();

        }

    };


    // ==========================================
    // QUICK QUESTIONS
    // ==========================================

    const quickQuestions =
        getQuickQuestions();


    // ==========================================
    // UI
    // ==========================================

    return (

        <>

            {/* ==================================
                FLOATING BUTTON
            ================================== */}

            {!isOpen && (

                <button
                    className="chatbot-button"
                    onClick={() =>
                        setIsOpen(true)
                    }
                    title="Meeting Assistant"
                >

                    <span>🤖</span>

                </button>

            )}


            {/* ==================================
                CHAT WINDOW
            ================================== */}

            {isOpen && (

                <div className="chatbot-window">

                    {/* ==============================
                        HEADER
                    ============================== */}

                    <div className="chatbot-header">

                        <div className="chatbot-header-info">

                            <div className="chatbot-avatar">
                                🤖
                            </div>

                            <div>

                                <div className="chatbot-title">
                                    Meeting Assistant
                                </div>

                                <div className="chatbot-status">

                                    <span className="online-dot">
                                        ●
                                    </span>

                                    Online

                                </div>

                            </div>

                        </div>


                        <button
                            className="chatbot-close"
                            onClick={() =>
                                setIsOpen(false)
                            }
                        >

                            ×

                        </button>

                    </div>


                    {/* ==============================
                        CHAT MESSAGES
                    ============================== */}

                    <div className="chatbot-messages">

                        {messages.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    className={
                                        item.sender === "user"
                                            ? "chat-row user-row"
                                            : "chat-row bot-row"
                                    }
                                >

                                    {item.sender === "bot" && (

                                        <div className="small-bot-avatar">
                                            🤖
                                        </div>

                                    )}


                                    <div
                                        className={
                                            item.sender === "user"
                                                ? "chat-message user-message"
                                                : "chat-message bot-message"
                                        }
                                    >

                                        {item.text}

                                    </div>

                                </div>

                            )
                        )}


                        {/* ==============================
                            THINKING
                        ============================== */}

                        {loading && (

                            <div className="chat-row bot-row">

                                <div className="small-bot-avatar">
                                    🤖
                                </div>

                                <div className="chat-message bot-message typing-message">

                                    <span></span>
                                    <span></span>
                                    <span></span>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* ==============================
                        QUICK QUESTIONS
                    ============================== */}

                    {!loading && (

                        <div className="chatbot-suggestions">

                            {quickQuestions.map(
                                (question, index) => (

                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleQuickQuestion(
                                                question
                                            )
                                        }
                                    >

                                        {question}

                                    </button>

                                )
                            )}

                        </div>

                    )}


                    {/* ==============================
                        INPUT
                    ============================== */}

                    <div className="chatbot-input-wrapper">

                        <input
                            type="text"
                            placeholder="Ask about meetings or attendance..."
                            value={message}
                            onChange={(e) =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            disabled={loading}
                        />


                        <button
                            className="chatbot-send"
                            onClick={
                                handleSend
                            }
                            disabled={
                                loading ||
                                !message.trim()
                            }
                        >

                            ➤

                        </button>

                    </div>

                </div>

            )}

        </>

    );

}

export default Chatbot;