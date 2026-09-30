import { useEffect, useState } from "react";
import api from "../services/api";

function MonthlyAttendanceReport() {

    const role = localStorage.getItem("role");
    const managerId = localStorage.getItem("userId");

    const today = new Date();

    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const [report, setReport] = useState([]);
    const [filteredReport, setFilteredReport] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);


    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;



    useEffect(() => {

        loadReport();

    }, []);



    useEffect(() => {

        const filtered = report.filter(x =>

            (x.employeeName || "")
                .toLowerCase()
                .includes(search.toLowerCase())

        );

        setFilteredReport(filtered);

        setCurrentPage(1);

    }, [search, report]);




    const loadReport = async () => {

        try {

            setLoading(true);

            let response;


            if (role === "Admin") {

                response = await api.get(
                    `/MonthlyAttendanceReport?month=${month}&year=${year}`
                );

            }
            else {

                response = await api.get(
                    `/MonthlyAttendanceReport/manager/${managerId}?month=${month}&year=${year}`
                );

            }


            console.log("Monthly Report:", response.data);



            if (Array.isArray(response.data)) {

                setReport(response.data);
                setFilteredReport(response.data);

            }
            else if (response.data.data) {

                setReport(response.data.data);
                setFilteredReport(response.data.data);

            }
            else {

                setReport([]);
                setFilteredReport([]);

            }


            setCurrentPage(1);


        }
        catch (error) {

            console.log(error);

            setReport([]);
            setFilteredReport([]);

        }
        finally {

            setLoading(false);

        }

    };




    const getBadgeClass = (percentage) => {

        if (percentage <= 50)
            return "report-danger";

        if (percentage <= 75)
            return "report-average";

        return "report-success";

    };



    // Pagination

    const totalPages = Math.ceil(
        filteredReport.length / recordsPerPage
    );


    const lastIndex =
        currentPage * recordsPerPage;


    const firstIndex =
        lastIndex - recordsPerPage;


    const currentRecords =
        filteredReport.slice(
            firstIndex,
            lastIndex
        );



    return (

        <>

            <div className="page-header">

                <div>

                    <h1 className="page-title">
                        Monthly Attendance Report
                    </h1>


                    <p className="page-subtitle">
                        View employee monthly attendance summary.
                    </p>

                </div>

            </div>



            <div className="card">


                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: "25px"
                    }}
                >


                    <select

                        className="form-control"

                        value={month}

                        onChange={(e) =>
                            setMonth(Number(e.target.value))
                        }

                        style={{
                            width: "180px"
                        }}

                    >

                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>

                    </select>



                    <select

                        className="form-control"

                        value={year}

                        onChange={(e) =>
                            setYear(Number(e.target.value))
                        }

                        style={{
                            width: "140px"
                        }}

                    >

                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>

                    </select>



                    <button

                        className="primary-btn"

                        onClick={loadReport}

                    >

                        Load Report

                    </button>


                </div>




                {
                    loading ?


                        <div className="loading">

                            Loading Report...

                        </div>



                        :



                        <>


                            <div

                                className="flex-between"

                                style={{
                                    marginBottom: "20px"
                                }}

                            >


                                <h3>

                                    {filteredReport.length} Employees

                                </h3>



                                <input

                                    type="text"

                                    placeholder="Search Employee..."

                                    className="search-input"

                                    value={search}

                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }

                                />


                            </div>





                            <table className="custom-table">


                                <thead>

                                    <tr>

                                        <th>Employee</th>

                                        <th>Department</th>

                                        <th>Total Meetings</th>

                                        <th>Attended</th>

                                        <th>Missed</th>

                                        <th>Attendance %</th>

                                    </tr>

                                </thead>




                                <tbody>


                                    {

                                        currentRecords.length === 0 ?


                                            <tr>

                                                <td

                                                    colSpan="6"

                                                    className="text-center"

                                                >

                                                    No Records Found

                                                </td>


                                            </tr>




                                            :



                                            currentRecords.map(item => (


                                                <tr

                                                    key={item.employeeId}

                                                >


                                                    <td>

                                                        {item.employeeName}

                                                    </td>


                                                    <td>

                                                        {item.departmentName}

                                                    </td>


                                                    <td>

                                                        {item.totalMeetings}

                                                    </td>


                                                    <td>

                                                        {item.attendedMeetings}

                                                    </td>


                                                    <td>

                                                        {item.missedMeetings}

                                                    </td>


                                                    <td>


                                                        <span

                                                            className={`report-badge ${getBadgeClass(item.attendancePercentage)}`}

                                                        >

                                                            {item.attendancePercentage}%

                                                        </span>


                                                    </td>


                                                </tr>


                                            ))

                                    }


                                </tbody>


                            </table>





                            {
                                filteredReport.length > 0 &&


                                <div

                                    style={{

                                        display: "flex",

                                        justifyContent: "space-between",

                                        alignItems: "center",

                                        marginTop: "20px"

                                    }}

                                >


                                    <div>

                                        Showing {firstIndex + 1}
                                        {" "}to{" "}
                                        {
                                            Math.min(
                                                lastIndex,
                                                filteredReport.length
                                            )
                                        }

                                        {" "}of{" "}

                                        {filteredReport.length}

                                    </div>





                                    <div>


                                        <button

                                            className="secondary-btn"

                                            disabled={currentPage === 1}

                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage - 1
                                                )
                                            }

                                        >

                                            Previous

                                        </button>





                                        {

                                            Array.from(
                                                {
                                                    length: totalPages
                                                },

                                                (_, index) => (


                                                    <button

                                                        key={index}

                                                        className="primary-btn"

                                                        style={{
                                                            marginLeft: "5px"
                                                        }}

                                                        onClick={() =>
                                                            setCurrentPage(
                                                                index + 1
                                                            )
                                                        }

                                                    >

                                                        {index + 1}

                                                    </button>


                                                ))

                                        }





                                        <button

                                            className="secondary-btn"

                                            style={{
                                                marginLeft: "5px"
                                            }}

                                            disabled={
                                                currentPage === totalPages
                                            }

                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage + 1
                                                )
                                            }

                                        >

                                            Next

                                        </button>


                                    </div>


                                </div>


                            }


                        </>

                }


            </div>


        </>

    );

}


export default MonthlyAttendanceReport;