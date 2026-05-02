/**
 * @module Calendar
 * @description VoteGuide AI — Google Calendar Integration.
 * Generates Google Calendar event URLs for election dates, enabling users
 * to add important democratic events directly to their Google Calendar.
 * @version 1.0.0
 */

/**
 * Creates a Google Calendar event URL with pre-filled election event details.
 * @param {string} title - The event title (e.g., "Lok Sabha Election Phase 1")
 * @param {string} description - Detailed event description
 * @param {string} dateStr - Date string parseable by the Date constructor
 * @returns {string} Full Google Calendar render URL with encoded parameters
 */
export function createCalendarUrl(title, description, dateStr) {
  const date = new Date(dateStr);
  const startDate = date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const endDate = new Date(date.getTime() + 86400000).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}/${endDate}`,
    details: description + '\n\nAdded via VoteGuide AI — India\'s Election Education Platform',
    sf: 'true'
  });
  
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
