import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Department from "./pages/Department";
import Manager from "./pages/Manager";
import Employee from "./pages/Employee";
import Calendar from "./pages/Calendar";
import Attendance from "./pages/Attendance";
import AttendanceReport from "./pages/AttendanceReport";
import Unauthorized from "./pages/Unauthorized";

import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerMeeting from "./pages/ManagerMeeting";
import ManagerCalendar from "./pages/ManagerCalendar";
import AssignedMeetings from "./pages/AssignedMeetings";
import MyAttendance from "./pages/MyAttendance";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyMeetings from "./pages/MyMeetings";
import MonthlyAttendanceReport from "./pages/MonthlyAttendanceReport";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ========================= */}
                {/* DEFAULT */}
                {/* ========================= */}

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/unauthorized"
                    element={<Unauthorized />}
                />

                {/* ========================= */}
                {/* ADMIN ROUTES */}
                {/* ========================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/departments"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <MainLayout>
                                <Department />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <MainLayout>
                                <Employee />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/managers"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <MainLayout>
                                <Manager />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/meetings"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <MainLayout>
                                <Calendar />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ========================= */}
                {/* SHARED ROUTES */}
                {/* ========================= */}

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                            <MainLayout>
                                <Attendance />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance-report"
                    element={
                        <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                            <MainLayout>
                                <AttendanceReport />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ========================= */}
                {/* MANAGER ROUTES */}
                {/* ========================= */}

                <Route
                    path="/manager/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Manager"]}>
                            <MainLayout>
                                <ManagerDashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/meetings"
                    element={
                        <ProtectedRoute allowedRoles={["Manager"]}>
                            <MainLayout>
                                <ManagerMeeting />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/calendar"
                    element={
                        <ProtectedRoute allowedRoles={["Manager"]}>
                            <MainLayout>
                                <ManagerCalendar />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/assigned-meetings"
                    element={
                        <ProtectedRoute allowedRoles={["Manager"]}>
                            <MainLayout>
                                <AssignedMeetings />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ========================= */}
                {/* EMPLOYEE ROUTES */}
                {/* ========================= */}

                <Route
                    path="/employee/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <MainLayout>
                                <EmployeeDashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/meetings"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <MainLayout>
                                <MyMeetings />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <MainLayout>
                                <MyAttendance />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
    path="/attendance-report"
    element={
        <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
            <MainLayout>
                <AttendanceReport />
            </MainLayout>
        </ProtectedRoute>
    }
                />
                <Route
                    path="/monthly-attendance-report"
                    element={
                        <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                            <MainLayout>
                                <MonthlyAttendanceReport />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ========================= */}
                {/* INVALID ROUTE */}
                {/* ========================= */}

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;