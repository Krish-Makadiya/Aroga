import axios from "axios";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Calendar = ({ patientId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        time: "",
        type: "appointment",
        description: "",
    });
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [patientId]);
    
    const fetchEvents = async () => {
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/event/patients/${patientId}/events`
        );
        setEvents(response.data);
    };

    // Calendar helper functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        if (direction === "prev") {
            newMonth.setMonth(currentMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(currentMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        if (!day) return false;
        return (
            day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear()
        );
    };

    const hasEvent = (day) => {
        if (!day) return false;
        const dateStr = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.some((event) => event.date === dateStr);
    };

    const getEventsForDate = (day) => {
        if (!day) return [];
        const dateStr = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter((event) => event.date === dateStr);
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const newDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        setSelectedDate(newDate);
    };

    const handleAddEvent = () => {
        const dateStr = `${selectedDate.getFullYear()}-${String(
            selectedDate.getMonth() + 1
        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
        setNewEvent({ ...newEvent, date: dateStr });
        setShowEventModal(true);
    };

    const handleSaveEvent = async () => {
        if (!newEvent.title || !newEvent.time) return;

        if (editingEvent) {
            try {
                await toast.promise(
                    axios.put(
                        `${import.meta.env.VITE_SERVER_URL}/api/event/patients/${patientId}/events/${editingEvent._id}`,
                        newEvent
                    ),
                    {
                        loading: "Updating event...",
                        success: "Event updated!",
                        error: <b>Could not update event.</b>,
                    }
                );
            setEvents(
                events.map((event) =>
                        event._id === editingEvent._id ? newEvent : event
                )
            );
            setEditingEvent(null);
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                await toast.promise(
                    axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/api/event/patients/${patientId}/events`,
                        newEvent
                    ),
                    {
                        loading: "Adding event...",
                        success: "Event added!",
                        error: "Could not add event.",
                    }
                );
                setEvents([...events, newEvent]);
            } catch (error) {
                console.log(error);
            }
        }

        setNewEvent({
            title: "",
            date: "",
            time: "",
            type: "appointment",
            description: "",
        });
        setShowEventModal(false);
    };

    const handleEditEvent = (event) => {
        setNewEvent(event);
        setEditingEvent(event);
        setShowEventModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await toast.promise(
                axios.delete(
                    `${import.meta.env.VITE_SERVER_URL}/api/event/patients/${patientId}/events/${eventId}`
                ),
                {
                    loading: "Deleting event...",
                    success: "Event deleted!",
                    error: "Could not delete event.",
                }
            );
            setEvents(events.filter((event) => event._id !== eventId));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <div className="dark:bg-dark-bg bg-light-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-3 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                        My Calendar
                    </h3>
                    <button
                        onClick={handleAddEvent}
                        className="px-4 py-2 bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-xl hover:bg-[var(--color-light-primary-dark)] dark:hover:bg-[var(--color-dark-primary-dark)] transition-colors flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigateMonth("prev")}
                                className="p-2 rounded-lg bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] hover:bg-[var(--color-light-primary)]/10 dark:hover:bg-[var(--color-dark-primary)]/10 transition-colors">
                                <ChevronLeft className="w-5 h-5 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]" />
                            </button>
                            <h4 className="text-xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                {currentMonth.toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h4>
                            <button
                                onClick={() => navigateMonth("next")}
                                className="p-2 rounded-lg bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] hover:bg-[var(--color-light-primary)]/10 dark:hover:bg-[var(--color-dark-primary)]/10 transition-colors">
                                <ChevronRight className="w-5 h-5 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]" />
                            </button>
                        </div>

                        {/* Calendar Days Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {[
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                            ].map((day) => (
                                <div
                                    key={day}
                                    className="p-2 text-center text-sm font-medium text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((day, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleDayClick(day)}
                                    className={`
                            relative p-3 min-h-[48px] rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center
                            ${
                                !day
                                    ? "cursor-default"
                                    : "hover:bg-[var(--color-light-primary)]/10 dark:hover:bg-[var(--color-dark-primary)]/10"
                            }
                            ${
                                isToday(day)
                                    ? "bg-[var(--color-light-primary)] text-white font-bold"
                                    : ""
                            }
                            ${
                                isSelected(day) && !isToday(day)
                                    ? "bg-[var(--color-light-primary)]/20 dark:bg-[var(--color-dark-primary)]/20 border-2 border-[var(--color-light-primary)] dark:border-[var(--color-dark-primary)]"
                                    : ""
                            }
                            ${
                                !day
                                    ? ""
                                    : "border border-[var(--color-light-secondary-text)]/10 dark:border-[var(--color-dark-secondary-text)]/10"
                            }
                        `}>
                                    {day && (
                                        <>
                                            <span
                                                className={`text-sm ${
                                                    isToday(day)
                                                        ? "text-white"
                                                        : "text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                                                }`}>
                                                {day}
                                            </span>
                                            {hasEvent(day) && (
                                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                                    <div className="w-1.5 h-1.5 bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] rounded-full"></div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Date Events */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] rounded-xl p-4">
                            <h5 className="text-lg font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-3">
                                {selectedDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </h5>

                            {getEventsForDate(selectedDate.getDate()).length ===
                            0 ? (
                                <p className="text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] text-sm">
                                    No events scheduled for this date.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {getEventsForDate(
                                        selectedDate.getDate()
                                    ).map((event, index) => (
                                        <div
                                            key={index}
                                            className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-surface)] rounded-lg p-3 border border-[var(--color-light-primary)]/20 dark:border-[var(--color-dark-primary)]/20">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h6 className="font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] text-sm">
                                                        {event.title}
                                                    </h6>
                                                    <div className="flex items-center mt-1 text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {event.time}
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] mt-1">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                                                            event.type ===
                                                            "appointment"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                                : event.type ===
                                                                  "medication"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                                : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                                        }`}>
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEditEvent(
                                                                event
                                                            )
                                                        }
                                                        className="p-1 rounded hover:bg-[var(--color-light-primary)]/10 dark:hover:bg-[var(--color-dark-primary)]/10 transition-colors">
                                                        <Edit className="w-3 h-3 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteEvent(
                                                                event._id
                                                            )
                                                        }
                                                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                                        <Trash2 className="w-3 h-3 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-surface)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                {editingEvent ? "Edit Event" : "Add New Event"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEventModal(false);
                                    setEditingEvent(null);
                                    setNewEvent({
                                        title: "",
                                        date: "",
                                        time: "",
                                        type: "appointment",
                                        description: "",
                                    });
                                }}
                                className="p-1 rounded-lg hover:bg-[var(--color-light-background)] dark:hover:bg-[var(--color-dark-background)] transition-colors">
                                <X className="w-5 h-5 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                    placeholder="Enter event title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            date: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                                    Time *
                                </label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                                    Event Type
                                </label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            type: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]">
                                    <option value="appointment">
                                        Doctor Appointment
                                    </option>
                                    <option value="medication">
                                        Medication Reminder
                                    </option>
                                    <option value="checkup">
                                        Health Checkup
                                    </option>
                                    <option value="exercise">Exercise</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)] resize-none"
                                    placeholder="Add event description (optional)"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEventModal(false);
                                    setEditingEvent(null);
                                    setNewEvent({
                                        title: "",
                                        date: "",
                                        time: "",
                                        type: "appointment",
                                        description: "",
                                    });
                                }}
                                className="px-4 py-2 rounded-lg border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] hover:bg-[var(--color-light-background)] dark:hover:bg-[var(--color-dark-background)] transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                disabled={!newEvent.title || !newEvent.time}
                                className="px-4 py-2 rounded-lg bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:bg-[var(--color-light-primary-dark)] dark:hover:bg-[var(--color-dark-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {editingEvent ? "Update Event" : "Add Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
