import { create } from 'zustand';
import { CalendarEvent } from '@/types/app';

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  selectedDate: Date;
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setLoading: (loading: boolean) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  loading: false,
  selectedDate: new Date(),

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setLoading: (loading) => set({ loading }),
}));
