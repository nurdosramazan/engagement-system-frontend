import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import { getAppointmentSchedule } from '../../api/adminService';
import toast from 'react-hot-toast';

const ClockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const LoaderIcon = () => (
  <svg
    className="animate-spin h-8 w-8 text-indigo-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const AdminSchedulePage = () => {
  const [week, setWeek] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    PENDING: true,
    APPROVED: true,
    COMPLETED: true,
    REJECTED: false,
    CANCELLED: false,
  });

  const handleFilterChange = (status) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    const weekStart = startOfWeek(week, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    try {
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      const response = await getAppointmentSchedule(startDate, endDate);
      setAppointments(response.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch schedule.');
    } finally {
      setIsLoading(false);
    }
  }, [week]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const days = eachDayOfInterval({
    start: startOfWeek(week, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(week, { weekStartsOn: 1 }), 6),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const { appointmentsByHourAndDay, maxAppointmentsPerHour } = useMemo(() => {
    const filteredAppointments = appointments.filter(
      (app) => statusFilters[app.status]
    );
    const grouped = {};
    const maxCounts = {};

    for (let h = 9; h < 18; h++) {
      grouped[h] = {};
      maxCounts[h] = 0;
      days.forEach((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const appsInHour = filteredAppointments
          .filter((app) => {
            const appDate = parseISO(app.startTime);
            return (
              format(appDate, 'yyyy-MM-dd') === dayKey &&
              appDate.getHours() === h
            );
          })
          .sort((a, b) => parseISO(a.startTime) - parseISO(b.startTime));

        grouped[h][dayKey] = appsInHour;
        if (appsInHour.length > maxCounts[h]) {
          maxCounts[h] = appsInHour.length;
        }
      });
    }
    return {
      appointmentsByHourAndDay: grouped,
      maxAppointmentsPerHour: maxCounts,
    };
  }, [appointments, statusFilters, days]);

  const FilterCheckbox = ({ status, color }) => (
    <label className="inline-flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={statusFilters[status]}
        onChange={() => handleFilterChange(status)}
        className={`form-checkbox h-4 w-4 rounded ${color} focus:ring-opacity-50`}
      />
      <span className="text-sm">{status}</span>
    </label>
  );

  const hours = Array.from({ length: 9 }, (_, i) => i + 9);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setWeek(addDays(week, -7))}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          &lt; Previous
        </button>
        <h2 className="text-xl font-semibold">
          {format(days[0], 'd MMM')} - {format(days[6], 'd MMM yyyy')}
        </h2>
        <button
          onClick={() => setWeek(addDays(week, 7))}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Next &gt;
        </button>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-4 mb-4 p-2 bg-gray-50 rounded-md">
        <FilterCheckbox status="PENDING" color="text-yellow-600" />
        <FilterCheckbox status="APPROVED" color="text-green-600" />
        <FilterCheckbox status="COMPLETED" color="text-blue-600" />
        <FilterCheckbox status="REJECTED" color="text-red-600" />
        <FilterCheckbox status="CANCELLED" color="text-gray-600" />
      </div>

      <div className="flex justify-center mb-4">
        <div className="p-2 bg-gray-100 rounded-md text-sm text-gray-600 inline-flex items-center gap-2">
          <ClockIcon />
          <span>All times are shown in Astana Time (UTC+5)</span>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoaderIcon />
        </div>
      )}
      {!isLoading && (
        <div className="grid grid-cols-8 text-sm border-t border-l border-gray-200">
          <div className="py-2 border-r border-b border-gray-200 font-semibold text-center sticky top-0 bg-white z-10">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day.toString()}
              className="py-2 border-r border-b border-gray-200 font-semibold text-center sticky top-0 bg-white z-10"
            >
              {format(day, 'EEE d')}
            </div>
          ))}

          {hours.map((hour) => {
            const maxApps = maxAppointmentsPerHour[hour];
            const rowHeight = maxApps > 0 ? 24 + maxApps * 40 : 32;

            return (
              <React.Fragment key={hour}>
                <div
                  className="border-r border-b border-gray-200 p-2 text-center text-gray-500 font-semibold"
                  style={{ height: `${rowHeight}px` }}
                >
                  {`${hour}:00`}
                </div>
                {days.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayAppointments =
                    appointmentsByHourAndDay[hour]?.[dayKey] || [];
                  return (
                    <div
                      key={day.toString()}
                      className="border-r border-b border-gray-200 p-1 space-y-1"
                      style={{ height: `${rowHeight}px` }}
                    >
                      {dayAppointments.map((app) => (
                        <div
                          key={app.id}
                          className={`p-1.5 rounded border-l-4 ${getStatusColor(
                            app.status
                          )}`}
                          title={`${format(
                            parseISO(app.startTime),
                            'HH:mm'
                          )} - ${format(parseISO(app.endTime), 'HH:mm')} - ${
                            app.groomFirstName
                          } & ${app.brideFirstName}`}
                        >
                          <p className="font-bold text-xs">
                            {format(parseISO(app.startTime), 'HH:mm')} -{' '}
                            {format(parseISO(app.endTime), 'HH:mm')}
                          </p>
                          <p className="text-xs truncate">
                            {app.groomFirstName} & {app.brideFirstName}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      )}
      {!isLoading && appointments.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No appointments scheduled for this week.
        </p>
      )}
    </div>
  );
};

export default AdminSchedulePage;