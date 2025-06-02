import { create } from 'zustand';
import { DashboardStats, FilterOptions, Event } from '@/types';

interface DashboardState {
  stats: DashboardStats | null;
  events: Event[];
  filters: FilterOptions;
  isLoading: boolean;
  setStats: (stats: DashboardStats) => void;
  setEvents: (events: Event[]) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setLoading: (loading: boolean) => void;
  addEvent: (event: Event) => void;
  updateEventStatus: (eventId: string, status: Event['status']) => void;
}

const defaultFilters: FilterOptions = {
  timeRange: 'realtime',
  floors: [],
  rooms: [],
  eventTypes: [],
  status: [],
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  events: [],
  filters: defaultFilters,
  isLoading: false,
  
  setStats: (stats) => set({ stats }),
  
  setEvents: (events) => set({ events }),
  
  setFilters: (newFilters) => 
    set({ filters: { ...get().filters, ...newFilters } }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  addEvent: (event) => 
    set((state) => ({ events: [event, ...state.events] })),
  
  updateEventStatus: (eventId, status) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, status } : event
      ),
    })),
})); 