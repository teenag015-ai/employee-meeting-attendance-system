namespace EmployeeMeetingAttendance.Server.Services
{
    public class KarnatakaHolidayService
    {
        // ==========================================
        // KARNATAKA GOVERNMENT GENERAL HOLIDAYS
        // 2026
        // ==========================================

        private readonly HashSet<DateTime> _holidays =
            new HashSet<DateTime>
            {
                new DateTime(2026, 1, 15),  // Makara Sankranti
                new DateTime(2026, 1, 26),  // Republic Day

                new DateTime(2026, 3, 19),  // Ugadi
                new DateTime(2026, 3, 21),  // Khutub-E-Ramzan
                new DateTime(2026, 3, 31),  // Mahaveera Jayanthi

                new DateTime(2026, 4, 3),   // Good Friday
                new DateTime(2026, 4, 14),  // Ambedkar Jayanthi
                new DateTime(2026, 4, 20),  // Basava Jayanthi

                new DateTime(2026, 5, 1),   // May Day
                new DateTime(2026, 5, 28),  // Bakrid

                new DateTime(2026, 6, 26),  // Last Day of Moharam

                new DateTime(2026, 8, 15),  // Independence Day
                new DateTime(2026, 8, 26),  // Eid-Milad

                new DateTime(2026, 9, 14),  // Varasiddhi Vinayaka Vrata

                new DateTime(2026, 10, 2),  // Gandhi Jayanthi
                new DateTime(2026, 10, 20), // Mahanavami / Ayudhapooja
                new DateTime(2026, 10, 21), // Vijayadasami

                new DateTime(2026, 11, 10), // Balipadyami / Deepavali
                new DateTime(2026, 11, 27), // Kanakadasa Jayanthi

                new DateTime(2026, 12, 25)  // Christmas
            };


        // ==========================================
        // CHECK WHETHER DATE IS A KARNATAKA HOLIDAY
        // ==========================================

        public bool IsHoliday(DateTime date)
        {
            return _holidays.Contains(date.Date);
        }


        // ==========================================
        // GET HOLIDAY NAME
        // ==========================================

        public string? GetHolidayName(DateTime date)
        {
            if (!_holidays.Contains(date.Date))
                return null;

            return date.Date switch
            {
                var d when d == new DateTime(2026, 1, 15)
                    => "Makara Sankranti",

                var d when d == new DateTime(2026, 1, 26)
                    => "Republic Day",

                var d when d == new DateTime(2026, 3, 19)
                    => "Ugadi",

                var d when d == new DateTime(2026, 3, 21)
                    => "Khutub-E-Ramzan",

                var d when d == new DateTime(2026, 3, 31)
                    => "Mahaveera Jayanthi",

                var d when d == new DateTime(2026, 4, 3)
                    => "Good Friday",

                var d when d == new DateTime(2026, 4, 14)
                    => "Dr. B.R. Ambedkar Jayanthi",

                var d when d == new DateTime(2026, 4, 20)
                    => "Basava Jayanthi / Akshaya Tritiya",

                var d when d == new DateTime(2026, 5, 1)
                    => "May Day",

                var d when d == new DateTime(2026, 5, 28)
                    => "Bakrid",

                var d when d == new DateTime(2026, 6, 26)
                    => "Last Day of Moharam",

                var d when d == new DateTime(2026, 8, 15)
                    => "Independence Day",

                var d when d == new DateTime(2026, 8, 26)
                    => "Eid-Milad",

                var d when d == new DateTime(2026, 9, 14)
                    => "Varasiddhi Vinayaka Vrata",

                var d when d == new DateTime(2026, 10, 2)
                    => "Gandhi Jayanthi",

                var d when d == new DateTime(2026, 10, 20)
                    => "Mahanavami / Ayudhapooja",

                var d when d == new DateTime(2026, 10, 21)
                    => "Vijayadasami",

                var d when d == new DateTime(2026, 11, 10)
                    => "Balipadyami / Deepavali",

                var d when d == new DateTime(2026, 11, 27)
                    => "Kanakadasa Jayanthi",

                var d when d == new DateTime(2026, 12, 25)
                    => "Christmas",

                _ => null
            };
        }
    }
}