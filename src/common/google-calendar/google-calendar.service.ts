import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private calendar: any;
  private auth: any;

  constructor(private configService: ConfigService) {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    try {
      // Initialize Google Auth with service account or OAuth2
      const serviceAccountKey = this.configService.get('GOOGLE_SERVICE_ACCOUNT_KEY');
      const clientEmail = this.configService.get('GOOGLE_CLIENT_EMAIL');
      const privateKey = this.configService.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

      if (serviceAccountKey || (clientEmail && privateKey)) {
        // Service Account Authentication
        this.auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey ? JSON.parse(serviceAccountKey) : {
            client_email: clientEmail,
            private_key: privateKey,
          },
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
      } else {
        // OAuth2 Authentication (fallback)
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const redirectUrl = this.configService.get('GOOGLE_REDIRECT_URL') || 'http://localhost:3000/auth/google/callback';

        if (clientId && clientSecret) {
          this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
          
          // Set refresh token if available
          const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');
          if (refreshToken) {
            this.auth.setCredentials({ refresh_token: refreshToken });
          }
        } else {
          this.logger.warn('Google Calendar credentials not configured. Using fallback mode.');
        }
      }

      if (this.auth) {
        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      }
    } catch (error) {
      this.logger.error('Failed to initialize Google Calendar API:', error);
    }
  }

  // Enhanced Google Meet link generation with participant emails
  async generateMeetLinkWithParticipants(
    buddyEmail: string,
    learnerEmail: string,
    sessionDetails: {
      module: string;
      topic: string;
      date: Date;
      buddyName: string;
      learnerName: string;
    }
  ): Promise<{
    meetLink: string;
    eventId: string;
    calendarEventUrl: string;
  }> {
    try {
      const endTime = new Date(sessionDetails.date.getTime() + 60 * 60 * 1000); // 1 hour session
      
      const eventDetails = {
        summary: `Study Session: ${sessionDetails.module} - ${sessionDetails.topic}`,
        description: `Study session between ${sessionDetails.buddyName} (Buddy) and ${sessionDetails.learnerName} (Learner)\n\nTopic: ${sessionDetails.topic}\nModule: ${sessionDetails.module}`,
        startTime: sessionDetails.date,
        endTime,
        attendees: [buddyEmail, learnerEmail],
      };

      const calendarEvent = await this.createCalendarEvent(eventDetails);
      
      return {
        meetLink: calendarEvent.meetLink,
        eventId: calendarEvent.eventId,
        calendarEventUrl: calendarEvent.eventUrl,
      };
    } catch (error) {
      console.error('Error generating meet link with participants:', error);
      // Fallback to simple meet link generation
      return {
        meetLink: this.generateMeetLink(),
        eventId: this.generateEventId(),
        calendarEventUrl: '',
      };
    }
  }

  // Generate a Google Meet link (simplified version)
  generateMeetLink(): string {
    // In production, use Google Calendar API to create an event with Meet link
    const meetingId = this.generateMeetingId();
    return `https://meet.google.com/${meetingId}`;
  }

  // Create a calendar event with Google Meet
  async createCalendarEvent(eventDetails: {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
  }) {
    try {
      if (!this.calendar) {
        this.logger.warn('Google Calendar not initialized, using fallback');
        return this.createFallbackEvent(eventDetails);
      }

      // Create the calendar event
      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventDetails.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: eventDetails.attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: this.generateEventId(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 15 }, // 15 minutes before
          ],
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all', // Send invitations to all attendees
      });

      const createdEvent = response.data;
      const meetLink = createdEvent.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === 'video'
      )?.uri || this.generateMeetLink();

      return {
        eventId: createdEvent.id,
        meetLink,
        eventUrl: createdEvent.htmlLink,
        hangoutLink: createdEvent.hangoutLink,
        ...eventDetails,
      };
    } catch (error) {
      this.logger.error('Error creating calendar event:', error);
      // Fallback to mock event if Google Calendar fails
      return this.createFallbackEvent(eventDetails);
    }
  }

  private createFallbackEvent(eventDetails: any) {
    const eventId = this.generateEventId();
    const meetLink = this.generateMeetLink();
    
    return {
      eventId,
      meetLink,
      eventUrl: `https://calendar.google.com/event?eid=${eventId}`,
      hangoutLink: meetLink,
      ...eventDetails,
    };
  }

  // Update an existing calendar event
  async updateCalendarEvent(eventId: string, updateData: Partial<{
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
  }>) {
    try {
      if (!this.calendar) {
        this.logger.warn('Google Calendar not initialized, returning mock response');
        return {
          eventId,
          ...updateData,
          updatedAt: new Date(),
        };
      }

      // Get the existing event first
      const existingEvent = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      // Prepare update data
      const updateEvent: any = {
        ...existingEvent.data,
      };

      if (updateData.summary) updateEvent.summary = updateData.summary;
      if (updateData.description) updateEvent.description = updateData.description;
      if (updateData.startTime) {
        updateEvent.start = {
          dateTime: updateData.startTime.toISOString(),
          timeZone: 'UTC',
        };
      }
      if (updateData.endTime) {
        updateEvent.end = {
          dateTime: updateData.endTime.toISOString(),
          timeZone: 'UTC',
        };
      }
      if (updateData.attendees) {
        updateEvent.attendees = updateData.attendees.map(email => ({ email }));
      }

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updateEvent,
        sendUpdates: 'all', // Notify all attendees of the update
      });

      return {
        eventId: response.data.id,
        ...updateData,
        updatedAt: new Date(),
        eventUrl: response.data.htmlLink,
      };
    } catch (error) {
      this.logger.error('Error updating calendar event:', error);
      // Return fallback response
      return {
        eventId,
        ...updateData,
        updatedAt: new Date(),
        error: 'Failed to update calendar event',
      };
    }
  }

  // Delete a calendar event
  async deleteCalendarEvent(eventId: string) {
    try {
      if (!this.calendar) {
        this.logger.warn('Google Calendar not initialized, returning mock response');
        return { success: true, deletedAt: new Date() };
      }

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all', // Notify attendees of cancellation
      });

      return { 
        success: true, 
        deletedAt: new Date(),
        eventId,
      };
    } catch (error) {
      this.logger.error('Error deleting calendar event:', error);
      // Don't throw error, just log it and return success false
      return { 
        success: false, 
        error: 'Failed to delete calendar event',
        eventId,
      };
    }
  }

  // Get event details by ID
  async getCalendarEvent(eventId: string) {
    try {
      if (!this.calendar) {
        this.logger.warn('Google Calendar not initialized');
        return null;
      }

      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error fetching calendar event:', error);
      return null;
    }
  }

  // List upcoming events
  async getUpcomingEvents(maxResults = 10) {
    try {
      if (!this.calendar) {
        this.logger.warn('Google Calendar not initialized');
        return [];
      }

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.logger.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  // Check if the service is properly configured
  isConfigured(): boolean {
    return !!this.calendar;
  }

  // Test the connection to Google Calendar
  async testConnection(): Promise<boolean> {
    try {
      if (!this.calendar) {
        return false;
      }

      // Try to list calendars to test the connection
      await this.calendar.calendarList.list({ maxResults: 1 });
      return true;
    } catch (error) {
      this.logger.error('Google Calendar connection test failed:', error);
      return false;
    }
  }

  private generateMeetingId(): string {
    // Generate a meeting ID in the format: xxx-xxxx-xxx
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part1}-${part2}-${part3}`;
  }

  private generateEventId(): string {
    // Generate a unique event ID
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
