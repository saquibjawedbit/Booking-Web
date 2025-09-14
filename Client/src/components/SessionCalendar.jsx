// filepath: /Users/adnanashraf/Documents/Projects/Booking-Web/Client/src/components/SessionCalendar.jsx
'use client';

import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  createPreset,
  createSession,
  deleteSession,
  getInstructorSessions,
} from '../Api/session.api';
import { useAuth } from '../Pages/AuthProvider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

// Constants
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRICING_UNITS = [
  { value: 'perHour', label: 'Per Hour' },
  { value: 'perPerson', label: 'Per Person' },
  { value: 'perGroup', label: 'Per Group' },
  { value: 'perDay', label: 'Per Day' },
];

const DEFAULT_FORM_STATE = {
  location: '',
  time: '09:00',
  capacity: '8',
  notes: '',
  price: '',
  unit: 'perPerson',
};

// Custom hooks
const useFormState = (initialState) => {
  const [formState, setFormState] = useState(initialState);

  const updateField = useCallback((name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, [initialState]);

  return [formState, updateField, resetForm, setFormState];
};

const useSessions = (instructorId) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!instructorId) return;

    setLoading(true);
    try {
      const res = await getInstructorSessions(instructorId);
      if (res.status === 200) {
        setSessions(res.data);
      } else {
        toast.error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Error loading sessions');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, refetch: fetchSessions };
};

const useCalendar = (currentDate) => {
  return useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    return { currentMonth, currentYear, daysInMonth, firstDayOfMonth };
  }, [currentDate]);
};

// Utility functions
const formatTime = (timeStr) => {
  if (!timeStr) return '09:00';
  return timeStr.length === 5 ? timeStr : timeStr.slice(0, 5);
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

const createSessionDateTime = (selectedDate, time) => {
  const [hour, minute] = time.split(':');
  const startTime = new Date(selectedDate);
  startTime.setHours(+hour, +minute, 0, 0);

  const expiresAt = new Date(startTime);
  expiresAt.setHours(expiresAt.getHours() + 2); // Default 2 hour session

  return { startTime, expiresAt };
};

// Reusable components
const FormField = ({ label, children, required = false }) => (
  <div className="grid gap-2">
    <Label>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
  </div>
);

const PricingFields = ({ price, unit, onPriceChange, onUnitChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField label="Price" required>
      <Input
        type="number"
        value={price}
        onChange={(e) => onPriceChange(e.target.value)}
        placeholder="Enter price"
      />
    </FormField>
    <FormField label="Unit" required>
      <Select value={unit} onValueChange={onUnitChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent>
          {PRICING_UNITS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  </div>
);

const CalendarDay = ({ day, isToday, hasSession, sessionCount, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`h-16 sm:h-20 lg:h-24 border rounded-lg relative cursor-pointer transition-all overflow-hidden group
            ${isToday ? 'border-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-300'}
            ${hasSession ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        `}
    onClick={onClick}
  >
    <div className="absolute top-1 right-1">
      {isToday ? (
        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
          {day}
        </div>
      ) : (
        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs sm:text-sm">
          {day}
        </div>
      )}
    </div>

    {hasSession ? (
      <div className="absolute bottom-1 left-1 right-1">
        <Badge className="bg-blue-500 hover:bg-blue-600 text-xs px-1 py-0.5">
          <span className="hidden sm:inline">
            {sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}
          </span>
          <span className="sm:hidden">{sessionCount}</span>
        </Badge>
      </div>
    ) : (
      <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge
          variant="outline"
          className="border-dashed border-blue-300 text-blue-500 text-xs px-1 py-0.5"
        >
          <Plus className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          <span className="hidden sm:inline">Add</span>
        </Badge>
      </div>
    )}
  </motion.div>
);

const SessionCalendar = ({ adventureTypes }) => {
  const { t } = useTranslation();
  const user = useAuth();

  // Core state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [presetDialog, setPresetDialog] = useState(false);
  const [sessionDetailDialog, setSessionDetailDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const instructorId = user?.user?.user?._id;
  const { sessions, refetch: refetchSessions } = useSessions(instructorId);
  const { currentMonth, currentYear, daysInMonth, firstDayOfMonth } =
    useCalendar(currentDate);

  // Form states using custom hook
  const [sessionForm, updateSessionForm, resetSessionForm] = useFormState({
    ...DEFAULT_FORM_STATE,
    adventureId: user?.user?.user?.instructor?.adventure,
  });

  const [presetForm, updatePresetForm, resetPresetForm] = useFormState({
    ...DEFAULT_FORM_STATE,
    adventureId: '',
    days: [],
  });

  // Get filtered locations based on adventure selection
  const filteredLocations = useMemo(() => {
    return adventureTypes?.location || [];
  }, [adventureTypes]);

  // Session date helpers
  const getSessionsForDate = useCallback(
    (day) => {
      return sessions.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return (
          sessionDate.getDate() === day &&
          sessionDate.getMonth() === currentMonth &&
          sessionDate.getFullYear() === currentYear
        );
      });
    },
    [sessions, currentMonth, currentYear]
  );

  const hasSessionsOnDate = useCallback(
    (day) => {
      return getSessionsForDate(day).length > 0;
    },
    [getSessionsForDate]
  );

  const getSessionCount = useCallback(
    (day) => {
      return getSessionsForDate(day).length;
    },
    [getSessionsForDate]
  );

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }, [currentYear, currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }, [currentYear, currentMonth]);

  // Session handlers
  const handleDateClick = useCallback(
    (day) => {
      const clickedDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(clickedDate);

      const sessionsForDate = getSessionsForDate(day);
      if (sessionsForDate.length > 0) {
        setSelectedSession(sessionsForDate[0]);
        setSessionDetailDialog(true);
      } else {
        setIsDialogOpen(true);
      }
    },
    [currentYear, currentMonth, getSessionsForDate]
  );

  const handleCreateSession = useCallback(async () => {
    const { adventureId, location, time, capacity, notes, price, unit } =
      sessionForm;

    if (!adventureId || !location || !price || !unit || !capacity || !time) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!selectedDate) {
      toast.error('No date selected');
      return;
    }

    const { startTime, expiresAt } = createSessionDateTime(selectedDate, time);

    const payload = {
      adventureId,
      location,
      instructorId,
      days: [DAY_NAMES[startTime.getDay()]],
      startTime: startTime.toISOString(),
      expiresAt: expiresAt.toISOString(),
      capacity,
      price,
      unit,
      notes,
      status: 'active',
    };

    try {
      const res = await createSession(payload);
      if (res) {
        toast.success('Session created successfully');
        setIsDialogOpen(false);
        resetSessionForm();
        refetchSessions();
      } else {
        toast.error('Error creating session');
      }
    } catch (error) {
      toast.error('Failed to create session');
    }
  }, [
    sessionForm,
    selectedDate,
    instructorId,
    resetSessionForm,
    refetchSessions,
  ]);

  const handleCreatePreset = useCallback(async () => {
    const { adventureId, location, days, capacity, time, notes, price, unit } =
      presetForm;

    if (!adventureId || !location || days.length === 0 || !capacity || !time) {
      toast.error('Please fill all required fields');
      return;
    }

    const toastId = toast.loading('Creating preset...');

    const payload = {
      location,
      days,
      capacity,
      startTime: formatTime(time),
      notes,
      instructorId,
      adventureId,
      price,
      unit,
    };

    try {
      const res = await createPreset(payload);
      if (res) {
        toast.success('Preset created successfully', { id: toastId });
        refetchSessions();
        setPresetDialog(false);
        resetPresetForm();
      } else {
        toast.error('Error creating preset', { id: toastId });
      }
    } catch (error) {
      console.error('Error creating preset:', error);
      toast.error('Failed to create preset', { id: toastId });
    }
  }, [presetForm, instructorId, refetchSessions, resetPresetForm]);

  const handleDeleteSession = useCallback(async () => {
    if (!selectedSession) return;

    try {
      toast.loading('Deleting session...');
      await deleteSession(selectedSession._id);
      toast.success('Session deleted successfully');
      refetchSessions();
      setSessionDetailDialog(false);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  }, [selectedSession, refetchSessions]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-16 sm:h-20 lg:h-24 border border-transparent"
        />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      const hasSession = hasSessionsOnDate(day);
      const sessionCount = getSessionCount(day);

      days.push(
        <CalendarDay
          key={day}
          day={day}
          isToday={isToday}
          hasSession={hasSession}
          sessionCount={sessionCount}
          onClick={() => handleDateClick(day)}
        />
      );
    }

    return days;
  }, [
    daysInMonth,
    firstDayOfMonth,
    currentMonth,
    currentYear,
    hasSessionsOnDate,
    getSessionCount,
    handleDateClick,
  ]);

  return (
    <Card className="col-span-full lg:col-span-7">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg sm:text-xl">
            {t('instructor.sessionCalendar')}
          </CardTitle>
          <CardDescription className="text-sm">
            {t('instructor.manageYourSessions')}
          </CardDescription>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetDialog(true)}
            className="flex-shrink-0"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-1">Preset</span>
          </Button>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <div className="font-medium text-sm sm:text-base px-2 whitespace-nowrap">
              <span className="hidden sm:inline">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <span className="sm:hidden">
                {MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">{calendarDays}</div>

        {/* Create Session Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {selectedDate
                  ? `Schedule Session for ${selectedDate.toLocaleDateString()}`
                  : 'Schedule Session'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Create a new session for this date. Fill in the details below.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:gap-4 py-4 px-1">
              <FormField label="Adventure Type" required>
                <Select
                  value={sessionForm.adventureId}
                  onValueChange={(value) =>
                    updateSessionForm('adventureId', value)
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select adventure" />
                  </SelectTrigger>
                  <SelectContent>
                    {adventureTypes && (
                      <SelectItem value={sessionForm.adventureId}>
                        {adventureTypes?.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Location" required>
                <Select
                  value={sessionForm.location}
                  onValueChange={(value) =>
                    updateSessionForm('location', value)
                  }
                  disabled={!sessionForm.adventureId}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLocations?.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField label="Start Time" required>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={sessionForm.time}
                      onChange={(e) =>
                        updateSessionForm('time', e.target.value)
                      }
                      className="pl-9 text-sm"
                    />
                  </div>
                </FormField>

                <FormField label="Capacity" required>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={sessionForm.capacity}
                      onChange={(e) =>
                        updateSessionForm('capacity', e.target.value)
                      }
                      className="pl-9 text-sm"
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField label="Price" required>
                  <Input
                    type="number"
                    value={sessionForm.price}
                    onChange={(e) => updateSessionForm('price', e.target.value)}
                    placeholder="Enter price"
                    className="text-sm"
                  />
                </FormField>
                <FormField label="Unit" required>
                  <Select
                    value={sessionForm.unit}
                    onValueChange={(value) => updateSessionForm('unit', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_UNITS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Notes (Optional)">
                <Textarea
                  value={sessionForm.notes}
                  onChange={(e) => updateSessionForm('notes', e.target.value)}
                  placeholder="Add any additional information"
                  rows={3}
                  className="text-sm resize-none"
                />
              </FormField>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                className="w-full sm:w-auto"
              >
                Create Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session Details Dialog */}
        <Dialog
          open={sessionDetailDialog}
          onOpenChange={setSessionDetailDialog}
        >
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Session Details
              </DialogTitle>
              <DialogDescription className="text-sm">
                Session on{' '}
                {selectedSession ? formatDate(selectedSession.startTime) : ''}
              </DialogDescription>
            </DialogHeader>

            {selectedSession && (
              <div className="grid gap-3 sm:gap-4 py-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Status
                    </h3>
                    <Badge
                      variant={
                        selectedSession.status === 'active'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {selectedSession.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Capacity
                    </h3>
                    <p className="flex items-center text-sm">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">
                        {selectedSession.capacity} participants
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Start Time
                    </h3>
                    <p className="flex items-center text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">
                        {formatDate(selectedSession.startTime)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Location
                    </h3>
                    <p className="flex items-center text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm truncate">
                        {selectedSession.location}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Notes
                    </h3>
                    <p className="text-xs sm:text-sm mt-1 break-words">
                      {selectedSession.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setSessionDetailDialog(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSession}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preset Dialog */}
        <Dialog open={presetDialog} onOpenChange={setPresetDialog}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Session Preset
              </DialogTitle>
              <DialogDescription className="text-sm">
                Create a preset for your sessions. Sessions will be created
                automatically with the same settings.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:gap-4 py-4 px-1">
              <FormField label="Adventure Type" required>
                <Select
                  value={presetForm.adventureId}
                  onValueChange={(value) =>
                    updatePresetForm('adventureId', value)
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select adventure" />
                  </SelectTrigger>
                  <SelectContent>
                    {adventureTypes && (
                      <SelectItem value={adventureTypes._id}>
                        {adventureTypes?.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Location" required>
                <Select
                  value={presetForm.location}
                  onValueChange={(value) => updatePresetForm('location', value)}
                  disabled={!presetForm.adventureId}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLocations?.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Days" required>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAY_NAMES.map((day, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`day-${index}`}
                        checked={presetForm.days.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...presetForm.days, day]
                            : presetForm.days.filter((d) => d !== day);
                          updatePresetForm('days', newDays);
                        }}
                        className="checkbox"
                      />
                      <label
                        htmlFor={`day-${index}`}
                        className="text-xs sm:text-sm cursor-pointer"
                      >
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField label="Start Time" required>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={presetForm.time}
                      onChange={(e) => updatePresetForm('time', e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                </FormField>

                <FormField label="Capacity" required>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={presetForm.capacity}
                      onChange={(e) =>
                        updatePresetForm('capacity', e.target.value)
                      }
                      className="pl-9 text-sm"
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField label="Price" required>
                  <Input
                    type="number"
                    value={presetForm.price}
                    onChange={(e) => updatePresetForm('price', e.target.value)}
                    placeholder="Enter price"
                    className="text-sm"
                  />
                </FormField>
                <FormField label="Unit" required>
                  <Select
                    value={presetForm.unit}
                    onValueChange={(value) => updatePresetForm('unit', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_UNITS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Notes (Optional)">
                <Textarea
                  value={presetForm.notes}
                  onChange={(e) => updatePresetForm('notes', e.target.value)}
                  placeholder="Add any additional information"
                  rows={3}
                  className="text-sm resize-none"
                />
              </FormField>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setPresetDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePreset} className="w-full sm:w-auto">
                Create Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SessionCalendar;
