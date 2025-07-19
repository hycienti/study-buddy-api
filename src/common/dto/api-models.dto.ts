import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEmail, IsEnum, MaxLength } from 'class-validator';
import { SessionStatus, TicketStatus, UserRole, UserStatus } from '@prisma/client';

// Session-related DTOs
export class SessionSummaryDto {
    @ApiProperty({ description: 'Session ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Module name', example: 'Data & Decisions' })
    module: string;

    @ApiProperty({ description: 'Topic', example: 'SQL Queries' })
    topic: string;

    @ApiProperty({ description: 'Session date and time', example: '2025-07-20T14:00:00Z' })
    date: Date;

    @ApiProperty({ enum: SessionStatus, description: 'Session status' })
    status: SessionStatus;

    @ApiProperty({ description: 'Meeting link', example: 'https://meet.google.com/abc-defg-hij' })
    meetingLink: string;

    @ApiPropertyOptional({ description: 'Calendar event URL', example: 'https://calendar.google.com/event?eid=...' })
    calendarEventUrl?: string;
}

// Ticket-related DTOs
export class TicketSummaryDto {
    @ApiProperty({ description: 'Ticket ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Module name', example: 'Software Development' })
    module: string;

    @ApiProperty({ description: 'Topic', example: 'React Components' })
    topic: string;

    @ApiProperty({ description: 'Description', example: 'Need help with state management...' })
    description: string;

    @ApiProperty({ enum: TicketStatus, description: 'Ticket status' })
    status: TicketStatus;

    @ApiProperty({ description: 'Creation date', example: '2025-07-19T10:00:00Z' })
    createdAt: Date;

    @ApiPropertyOptional({ description: 'Number of comments', example: 3 })
    commentCount?: number;
}

// User-related DTOs
export class UserSummaryDto {
    @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'User name', example: 'John Doe' })
    name: string;

    @ApiProperty({ description: 'User email', example: 'john.doe@university.edu' })
    email: string;

    @ApiProperty({ enum: UserRole, description: 'User role' })
    role: UserRole;

    @ApiProperty({ enum: UserStatus, description: 'User status' })
    status: UserStatus;

    @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg' })
    avatarUrl?: string;

    @ApiPropertyOptional({ description: 'User skills', type: [String], example: ['JavaScript', 'Python'] })
    skills?: string[];
}

// Study Buddy specific DTOs
export class StudyBuddyProfileDto extends UserSummaryDto {
    @ApiPropertyOptional({ description: 'Bio', example: 'Experienced tutor in computer science' })
    bio?: string;

    @ApiPropertyOptional({ description: 'School name', example: 'University of Technology' })
    schoolName?: string;

    @ApiPropertyOptional({ description: 'Study year', example: '4th Year' })
    studyYear?: string;

    @ApiPropertyOptional({ description: 'Major', example: 'Computer Science' })
    major?: string;

    @ApiProperty({ description: 'Average rating', example: 4.8, minimum: 0, maximum: 5 })
    averageRating?: number;

    @ApiProperty({ description: 'Number of completed sessions', example: 25 })
    completedSessions?: number;
}

// Statistics DTOs
export class StatsOverviewDto {
    @ApiProperty({ description: 'Total number of users', example: 150 })
    totalUsers: number;

    @ApiProperty({ description: 'Total number of sessions', example: 500 })
    totalSessions: number;

    @ApiProperty({ description: 'Total number of tickets', example: 75 })
    totalTickets: number;

    @ApiProperty({ description: 'Number of active study buddies', example: 25 })
    activeBuddies: number;

    @ApiProperty({ description: 'Sessions this month', example: 45 })
    sessionsThisMonth: number;

    @ApiProperty({ description: 'Tickets resolved this month', example: 30 })
    ticketsResolvedThisMonth: number;
}

// Notification DTOs
export class NotificationDto {
    @ApiProperty({ description: 'Notification ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Notification message', example: 'Your session has been confirmed' })
    message: string;

    @ApiProperty({ description: 'Whether the notification has been read', example: false })
    read: boolean;

    @ApiProperty({ description: 'Creation date', example: '2025-07-19T15:30:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Notification type', example: 'SESSION_CONFIRMED' })
    type: string;
}
