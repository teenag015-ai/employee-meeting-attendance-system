using System.Text.Json;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class IndianHolidayService
    {
        private readonly HttpClient _httpClient;

        public IndianHolidayService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // ==========================================
        // GET KARNATAKA PUBLIC HOLIDAYS
        // ==========================================

        public async Task<List<IndianHoliday>> GetHolidaysAsync(
            int year)
        {
            try
            {
                var url =
                    "https://indian-festival-api.vercel.app/api/festivals?state=Karnataka";

                var response =
                    await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return new List<IndianHoliday>();
                }

                var json =
                    await response.Content.ReadAsStringAsync();

                using var document =
                    JsonDocument.Parse(json);

                if (!document.RootElement.TryGetProperty(
                        "data",
                        out var data))
                {
                    return new List<IndianHoliday>();
                }

                var result =
                    new List<IndianHoliday>();

                foreach (var item in data.EnumerateArray())
                {
                    // ==========================================
                    // GET 2026 DATE
                    // ==========================================

                    if (!item.TryGetProperty(
                            $"date_{year}",
                            out var dateProperty))
                    {
                        continue;
                    }

                    var dateText =
                        dateProperty.GetString();

                    if (!DateTime.TryParse(
                            dateText,
                            out var holidayDate))
                    {
                        continue;
                    }

                    if (holidayDate.Year != year)
                    {
                        continue;
                    }


                    // ==========================================
                    // CHECK WHETHER IT IS A HOLIDAY
                    // ==========================================
                    //
                    // We accept:
                    //
                    // 1. national_holiday = true
                    //
                    // OR
                    //
                    // 2. The API identifies Karnataka
                    //    in the states array and the item
                    //    is not merely a restricted holiday.
                    //
                    // ==========================================

                    bool nationalHoliday = false;

                    if (item.TryGetProperty(
                            "national_holiday",
                            out var nationalProperty))
                    {
                        nationalHoliday =
                            nationalProperty.GetBoolean();
                    }


                    bool restrictedHoliday = false;

                    if (item.TryGetProperty(
                            "restricted_holiday",
                            out var restrictedProperty))
                    {
                        restrictedHoliday =
                            restrictedProperty.GetBoolean();
                    }


                    bool appliesToKarnataka = false;

                    if (item.TryGetProperty(
                            "states",
                            out var statesProperty) &&
                        statesProperty.ValueKind ==
                        JsonValueKind.Array)
                    {
                        foreach (var state in
                                 statesProperty.EnumerateArray())
                        {
                            var stateName =
                                state.GetString();

                            if (string.Equals(
                                    stateName,
                                    "Karnataka",
                                    StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(
                                    stateName,
                                    "all",
                                    StringComparison.OrdinalIgnoreCase))
                            {
                                appliesToKarnataka = true;
                                break;
                            }
                        }
                    }


                    // ==========================================
                    // SKIP RESTRICTED-ONLY HOLIDAYS
                    // ==========================================

                    if (restrictedHoliday &&
                        !nationalHoliday)
                    {
                        continue;
                    }


                    // ==========================================
                    // ACCEPT NATIONAL OR KARNATAKA HOLIDAY
                    // ==========================================

                    if (!nationalHoliday &&
                        !appliesToKarnataka)
                    {
                        continue;
                    }


                    // ==========================================
                    // GET HOLIDAY NAME
                    // ==========================================

                    string name =
                        "Public Holiday";

                    if (item.TryGetProperty(
                            "name",
                            out var nameProperty))
                    {
                        name =
                            nameProperty.GetString()
                            ?? "Public Holiday";
                    }


                    // ==========================================
                    // ADD HOLIDAY
                    // ==========================================

                    result.Add(
                        new IndianHoliday
                        {
                            Date =
                                holidayDate.Date,

                            Name =
                                name,

                            LocalName =
                                name
                        });
                }


                // ==========================================
                // REMOVE DUPLICATES
                // ==========================================

                return result
                    .GroupBy(h => h.Date.Date)
                    .Select(g => g.First())
                    .OrderBy(h => h.Date)
                    .ToList();
            }
            catch
            {
                return new List<IndianHoliday>();
            }
        }
    }


    // ==========================================
    // HOLIDAY MODEL
    // ==========================================

    public class IndianHoliday
    {
        public DateTime Date { get; set; }

        public string Name { get; set; }
            = string.Empty;

        public string LocalName { get; set; }
            = string.Empty;
    }
}