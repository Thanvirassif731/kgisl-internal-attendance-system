import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Download,
  Search,
  Check,
  LogOut,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { attendanceService } from '../services/api';
import { Attendance as AttendanceType } from '../types';

export const Attendance: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);
  const [stats, setStats] = useState({
    present: 42,
    presentPercentage: '87.5%',
    late: 3,
    latePercentage: '6.3%',
    absent: 3,
    absentPercentage: '6.3%',
    workingDays: 22,
  });
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [myToday, setMyToday] = useState<AttendanceType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      if (isAdmin) {
        const res = await attendanceService.getAdminAttendance();
        setAttendances(res.attendances);
        if (res.stats) {
          setStats({
            present: res.stats.present,
            presentPercentage: res.stats.presentPercentage,
            late: res.stats.late,
            latePercentage: res.stats.latePercentage,
            absent: res.stats.absent,
            absentPercentage: res.stats.absentPercentage,
            workingDays: res.stats.workingDays,
          });
        }
      } else {
        const historyRes = await attendanceService.getMyHistory();
        setAttendances(historyRes.attendances);
        const todayRes = await attendanceService.getMyToday();
        setMyToday(todayRes.attendance);
        if (historyRes.stats) {
          setStats({
            present: historyRes.stats.present,
            presentPercentage: `${historyRes.stats.rate}%`,
            late: historyRes.stats.late,
            latePercentage: `${historyRes.stats.late > 0 ? Math.round((historyRes.stats.late / historyRes.stats.total) * 100) : 0}%`,
            absent: historyRes.stats.absent,
            absentPercentage: `${historyRes.stats.absent > 0 ? Math.round((historyRes.stats.absent / historyRes.stats.total) * 100) : 0}%`,
            workingDays: 22,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [isAdmin]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn();
      await fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkOut();
      await fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Member,Team,Date,Check In,Check Out,Status']
        .concat(
          attendances.map(
            (a) =>
              `"${a.user?.name || user?.name}","${a.user?.team?.name || 'Platform Team'}","${a.date}","${a.checkInTime || '-'}","${a.checkOutTime || '-'}","${a.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendances = attendances.filter((a) => {
    const name = a.user?.name || user?.name || '';
    const teamName = a.user?.team?.name || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      teamName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Attendance" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Title & Top Right Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Attendance
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              {isAdmin
                ? 'Daily attendance across all teams.'
                : 'Your attendance records and check-in timeline.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export report</span>
            </button>
          </div>
        </div>

        {/* User Quick Check-In / Check-Out Widget if regular user */}
        {!isAdmin && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Today's Attendance Status
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {myToday?.checkInTime
                  ? `Checked in at ${myToday.checkInTime} • ${myToday.checkOutTime ? `Checked out at ${myToday.checkOutTime}` : 'Working'}`
                  : 'You have not checked in for today.'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!myToday?.checkInTime ? (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Check In Now</span>
                </button>
              ) : !myToday.checkOutTime ? (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check Out Now</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl">
                  Attendance completed for today
                </span>
              )}
            </div>
          </div>
        )}

        {/* 4 Stat Cards matching reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Present"
            value={stats.present}
            subtext={stats.presentPercentage}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            label="Late"
            value={stats.late}
            subtext={stats.latePercentage}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-50"
          />
          <StatCard
            label="Absent"
            value={stats.absent}
            subtext={stats.absentPercentage}
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
            iconBgColor="bg-rose-50"
          />
          <StatCard
            label="Working days"
            value={stats.workingDays}
            subtext="This month"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              {isAdmin ? "Today's attendance" : 'Attendance history'}
            </h3>

            {isAdmin && (
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter member..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">MEMBER</th>
                  <th className="py-4 px-6">TEAM</th>
                  <th className="py-4 px-6">CHECK IN</th>
                  <th className="py-4 px-6">CHECK OUT</th>
                  <th className="py-4 px-6">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading attendance...
                    </td>
                  </tr>
                ) : filteredAttendances.length > 0 ? (
                  filteredAttendances.map((att) => {
                    const memberName = att.user?.name || user?.name || 'Mohamed Ashfaq';
                    const initials = memberName
                      .split(' ')
                      .map((p: string) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    const teamName = att.user?.team?.name || 'Platform Team';

                    return (
                      <tr
                        key={att.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Member */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-900">
                              {memberName}
                            </span>
                          </div>
                        </td>

                        {/* Team */}
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {teamName}
                        </td>

                        {/* Check In */}
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {att.checkInTime || '—'}
                        </td>

                        {/* Check Out */}
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {att.checkOutTime || '—'}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <StatusBadge status={att.status} type="attendance" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
