import type { CalendarEvent } from '../features/decision/DecisionTypes';

export class CalendarService {
  /**
   * Generates a Google Calendar URL for a given event
   */
  public generateGoogleCalendarUrl(event: CalendarEvent): string {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

    const params = new URLSearchParams();

    if (event.title) {
      params.append('text', event.title);
    }

    if (event.description) {
      let desc = event.description;
      if (event.meetingLink) {
        desc += `\n\nMeeting Link: ${event.meetingLink}`;
      }
      params.append('details', desc);
    }

    if (event.location) {
      params.append('location', event.location);
    }

    if (event.date && event.date !== 'TBD') {
      const parsedDate = new Date(event.date);
      if (!isNaN(parsedDate.getTime())) {
        const yyyy = parsedDate.getFullYear();
        const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(parsedDate.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}${mm}${dd}T000000Z/${yyyy}${mm}${dd}T010000Z`; // Default 1 hour
        params.append('dates', formattedDate);
      }
    }

    return `${baseUrl}&${params.toString()}`;
  }
}

export const calendarService = new CalendarService();
