import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { teachersAPI } from '@/services/api';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ScheduleEditorProps {
  teacherId?: string;
  currentAvailability?: TimeSlot[];
  onSave?: (slots: TimeSlot[]) => void;
  isEditable?: boolean;
}

const PAKISTAN_OFFSET = 5;
const DUBAI_OFFSET = 4;
const TIMEZONE_DIFFERENCE = PAKISTAN_OFFSET - DUBAI_OFFSET;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

const convertTimezone = (time: string, fromOffset: number, toOffset: number): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + (toOffset - fromOffset) * 60;
  const convertedHours = Math.floor(totalMinutes / 60) % 24;
  const convertedMinutes = totalMinutes % 60;
  return `${String(convertedHours).padStart(2, '0')}:${String(convertedMinutes).padStart(2, '0')}`;
};

const convertPakistanToDubai = (time: string): string => {
  return convertTimezone(time, PAKISTAN_OFFSET, DUBAI_OFFSET);
};

const convertDubaiToPakistan = (time: string): string => {
  return convertTimezone(time, DUBAI_OFFSET, PAKISTAN_OFFSET);
};

const SchedulesPage: React.FC<ScheduleEditorProps> = ({
  teacherId,
  currentAvailability = [],
  onSave,
  isEditable = true
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>(currentAvailability);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('09:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('10:00');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showTimezoneInfo, setShowTimezoneInfo] = useState(true);

  useEffect(() => {
    setSlots(currentAvailability);
  }, [currentAvailability]);

  const addSlot = () => {
    if (selectedStartTime >= selectedEndTime) {
      setMessage({ type: 'error', text: 'End time must be after start time' });
      return;
    }

    const existingSlot = slots.find(
      s => s.day === selectedDay && s.startTime === selectedStartTime && s.endTime === selectedEndTime
    );

    if (existingSlot) {
      setMessage({ type: 'error', text: 'This time slot already exists' });
      return;
    }

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      day: selectedDay,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      isAvailable: true
    };

    setSlots([...slots, newSlot]);
    setMessage({ type: 'success', text: 'Time slot added successfully' });
  };

  const removeSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId));
    setMessage({ type: 'success', text: 'Time slot removed' });
  };

  const toggleSlotAvailability = (slotId: string) => {
    setSlots(slots.map(s => 
      s.id === slotId ? { ...s, isAvailable: !s.isAvailable } : s
    ));
  };

  const handleSaveSchedule = async () => {
    if (!teacherId) {
      onSave?.(slots);
      setMessage({ type: 'success', text: 'Schedule saved locally' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await teachersAPI.updateAvailability(teacherId, slots);
      setMessage({ type: 'success', text: 'Schedule saved successfully!' });
      onSave?.(slots);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save schedule' });
    } finally {
      setSaving(false);
    }
  };

  const getSlotsForDay = (day: string) => {
    return slots.filter(s => s.day === day).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  };

  return (
    <div className="space-y-6">
      {showTimezoneInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Timezone Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your schedule is displayed in <strong>Pakistan Time (PKT, UTC+{PAKISTAN_OFFSET})</strong>. 
                  Students in Dubai will see times converted to <strong>Gulf Standard Time (GST, UTC+{DUBAI_OFFSET})</strong>.
                  The time difference is <strong>{TIMEZONE_DIFFERENCE} hour{TIMEZONE_DIFFERENCE !== 1 ? 's' : ''}</strong> behind your local time.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowTimezoneInfo(false)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {isEditable && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#4a4a4a] mb-4">Add Time Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Day</label>
              <select 
                className="form-input"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {DAYS.map(day => (
                  <option key={day} value={day} className="capitalize">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Start Time (PKT)</label>
              <select 
                className="form-input"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">End Time (PKT)</label>
              <select 
                className="form-input"
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
              >
                {TIME_SLOTS.filter(t => t > selectedStartTime).map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={addSlot}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#4a4a4a]">Weekly Schedule</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>PKT = GST + {TIMEZONE_DIFFERENCE}h</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b">
          {DAYS.map(day => (
            <div 
              key={day} 
              className={`p-3 text-center border-r last:border-r-0 cursor-pointer transition-colors ${
                selectedDay === day ? 'bg-[#f5a623]/10' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <p className="font-semibold text-[#4a4a4a] capitalize text-sm">{day}</p>
              <p className="text-xs text-gray-500">{getSlotsForDay(day).length} slots</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[250px]">
          {DAYS.map(day => {
            const daySlots = getSlotsForDay(day);
            return (
              <div 
                key={day} 
                className={`p-3 border-r last:border-r-0 transition-colors ${
                  selectedDay === day ? 'bg-[#f5a623]/5' : ''
                }`}
                onClick={() => setSelectedDay(day)}
              >
                {daySlots.length > 0 ? (
                  <div className="space-y-2">
                    {daySlots.map(slot => (
                      <div 
                        key={slot.id}
                        className={`p-2 rounded-lg text-center text-xs transition-all ${
                          slot.isAvailable 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditable) toggleSlotAvailability(slot.id);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          {isEditable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSlot(slot.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                          <span className="mx-auto font-medium">{slot.startTime}</span>
                          <span className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100">
                            {slot.endTime}
                          </span>
                        </div>
                        <p className="text-[10px] mt-1">to {slot.endTime}</p>
                        {selectedDay === day && (
                          <p className="text-[10px] mt-1 text-blue-600 font-medium">
                            Dubai: {convertPakistanToDubai(slot.startTime)} - {convertPakistanToDubai(slot.endTime)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400 text-xs">No slots</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Schedule Conversion Example</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-500 mb-1">Your Time (Pakistan)</p>
            <p className="font-bold text-[#4a4a4a]">09:00 - 12:00 PKT</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-500 mb-1">Student Sees (Dubai)</p>
            <p className="font-bold text-[#f5a623]">08:00 - 11:00 GST</p>
          </div>
        </div>
      </div>

      {isEditable && (
        <div className="flex justify-end">
          <button 
            onClick={handleSaveSchedule}
            disabled={saving}
            className="btn-primary px-8 py-3 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save Schedule</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
export { convertPakistanToDubai, convertDubaiToPakistan, TIMEZONE_DIFFERENCE };
