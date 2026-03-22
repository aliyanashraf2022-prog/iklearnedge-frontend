import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const SchedulesPage: React.FC<ScheduleEditorProps> = ({
  teacherId,
  currentAvailability = [],
  onSave,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>(currentAvailability);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    day: 'monday',
    startTime: '09:00',
    endTime: '10:00',
  });

  useEffect(() => {
    setSlots(currentAvailability);
  }, [currentAvailability]);

  const groupedSlots = useMemo(
    () => days.map((day) => ({
      day,
      slots: slots
        .filter((slot) => slot.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    })),
    [slots],
  );

  const addSlot = () => {
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const duplicate = slots.find((slot) => (
      slot.day === form.day
      && slot.startTime === form.startTime
      && slot.endTime === form.endTime
    ));

    if (duplicate) {
      toast.error('That availability slot already exists');
      return;
    }

    setSlots((current) => [
      ...current,
      {
        id: `slot-${Date.now()}`,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        isAvailable: true,
      },
    ]);
  };

  const removeSlot = (slotId: string) => {
    setSlots((current) => current.filter((slot) => slot.id !== slotId));
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);

      if (teacherId) {
        const updated = await teachersAPI.updateAvailability(slots);
        onSave?.(updated as TimeSlot[]);
      } else {
        onSave?.(slots);
      }

      toast.success('Availability updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-3xl border border-slate-200 p-5 md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Day</span>
          <select
            value={form.day}
            onChange={(event) => setForm((current) => ({ ...current, day: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
          >
            {days.map((day) => (
              <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Start time</span>
          <input
            type="time"
            value={form.startTime}
            onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">End time</span>
          <input
            type="time"
            value={form.endTime}
            onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={addSlot}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
          >
            <Plus className="h-4 w-4" />
            Add slot
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groupedSlots.map((group) => (
          <section key={group.day} className="rounded-3xl border border-slate-200 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#d99018]" />
              <h3 className="font-semibold capitalize text-slate-950">{group.day}</h3>
            </div>

            <div className="space-y-3">
              {group.slots.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No slots set.</div>
              ) : group.slots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{slot.startTime} - {slot.endTime}</span>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveSchedule}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#f5a623] px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-[#d99018]"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save availability'}
        </button>
      </div>
    </div>
  );
};

export default SchedulesPage;
