# Database Migration Instructions

## Adding Calendar Event Tracking to Sessions

The Session module has been enhanced with Google Calendar integration. This requires updating the database schema to include calendar event tracking fields.

### Schema Changes

The `Session` model now includes:
- `calendarEventId` (String?) - Google Calendar Event ID for tracking
- `calendarEventUrl` (String?) - Direct link to the calendar event
- `updatedAt` (DateTime) - Timestamp for when the session was last updated

### Migration Steps

1. **Ensure Database Connection**
   Make sure your `DATABASE_URL` is properly configured in the `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/study_buddy_db"
   ```

2. **Run the Migration**
   ```bash
   npx prisma migrate dev --name add-calendar-event-tracking
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Verify Migration**
   Check that the migration was successful:
   ```bash
   npx prisma db pull
   ```

### Expected Migration SQL

The migration will execute SQL similar to:
```sql
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "calendarEventId" TEXT,
ADD COLUMN     "calendarEventUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

### Post-Migration Features

After running the migration, the following features will be available:

1. **Automatic Calendar Event Creation**
   - New sessions automatically create Google Calendar events
   - Calendar event IDs are stored for future reference

2. **Calendar Event Management**
   - Session updates automatically update calendar events
   - Session cancellations automatically delete calendar events

3. **Calendar Synchronization**
   - Existing sessions can be synced with Google Calendar via API endpoint
   - GET `/sessions/sync-calendar` to sync existing sessions

### Rollback (if needed)

If you need to rollback this migration:
```bash
npx prisma migrate reset
```

**Warning**: This will reset your entire database. Only use in development.

### Production Deployment

For production deployment:

1. **Backup your database** before running migrations
2. Run migration in a maintenance window:
   ```bash
   npx prisma migrate deploy
   ```
3. Verify the migration was successful
4. Test Google Calendar integration functionality

### Troubleshooting

**Migration fails with permission error:**
- Ensure your database user has ALTER TABLE permissions
- Check that the database connection is stable

**Google Calendar features not working:**
- Verify Google Calendar API credentials are properly configured
- Check that the Google Calendar service is initialized correctly
- Test the connection using `/google-calendar/health` endpoint

**Existing sessions without calendar events:**
- Use the sync endpoint: `POST /sessions/sync-calendar`
- This will create calendar events for existing sessions that don't have them

### Testing the Integration

After migration, test the integration:

1. **Create a new session** - Should automatically create a calendar event
2. **Update a session** - Should update the calendar event
3. **Cancel a session** - Should delete the calendar event
4. **Check calendar sync** - Use the sync endpoint for existing sessions

For detailed Google Calendar setup instructions, see [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md).
