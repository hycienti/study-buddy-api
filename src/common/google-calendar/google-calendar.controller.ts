import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';

@ApiTags('google-calendar')
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Google Calendar API connection status' })
  @ApiResponse({ status: 200, description: 'Connection status retrieved successfully.' })
  async checkHealth() {
    const isConfigured = this.googleCalendarService.isConfigured();
    const isConnected = isConfigured ? await this.googleCalendarService.testConnection() : false;

    return {
      configured: isConfigured,
      connected: isConnected,
      status: isConnected ? 'healthy' : 'unhealthy',
      message: isConnected 
        ? 'Google Calendar API is working correctly'
        : isConfigured 
          ? 'Google Calendar API configured but connection failed'
          : 'Google Calendar API not configured',
    };
  }

  @Get('upcoming-events')
  @ApiOperation({ summary: 'Get upcoming calendar events (for testing)' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved successfully.' })
  async getUpcomingEvents() {
    const events = await this.googleCalendarService.getUpcomingEvents(5);
    return {
      count: events.length,
      events: events.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        meetLink: event.conferenceData?.entryPoints?.find(
          (ep: any) => ep.entryPointType === 'video'
        )?.uri,
      })),
    };
  }
}
