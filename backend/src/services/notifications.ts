import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'contribution_due' | 'contribution_reminder' | 'payout_ready' | 'payout_completed' | 'profile_alert' | 'system_alert';
type DeliveryChannel = 'email' | 'sms' | 'in_app';

class NotificationsService {
  /**
   * Send notification (T091)
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: any,
    channels: DeliveryChannel[] = ['in_app', 'email'],
  ): Promise<any> {
    const notificationId = uuidv4();

    try {
      const user = await database.query(`SELECT email, phone_number FROM users WHERE id = $1`, [userId]);

      if (user.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      const userData = user.rows[0];

      // Prepare notification content
      const content = this.getNotificationContent(type, data);

      // Create notification record
      await database.query(
        `INSERT INTO notifications (
          id, user_id, type, title, message, data, is_read, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          notificationId,
          userId,
          type,
          content.title,
          content.message,
          JSON.stringify(data),
          false,
        ],
      );

      // Send via channels (fire and forget)
      const promises = [];

      if (channels.includes('email') && userData.email) {
        promises.push(this.sendEmailNotification(userData.email, content));
      }

      if (channels.includes('sms') && userData.phone_number) {
        promises.push(this.sendSMSNotification(userData.phone_number, content));
      }

      // Don't wait for delivery
      Promise.all(promises).catch((err) => {
        logger.error('Notification delivery error', { error: err, notificationId });
      });

      logger.info('Notification created', { notificationId, userId, type });

      return {
        notification_id: notificationId,
        type,
        status: 'sent',
        channels,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Notification send error', { error, userId, type });
      throw new KhaliaError('Failed to send notification', 500, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Get user notifications (T092)
   */
  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<any> {
    try {
      const result = await database.query(
        `SELECT id, type, title, message, is_read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      // Count unread
      const unreadCount = await database.query(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId],
      );

      return {
        notifications: result.rows,
        unread_count: unreadCount.rows[0].count,
        total: result.rows.length,
      };
    } catch (error: any) {
      logger.error('Get notifications error', { error, userId });
      throw new KhaliaError('Failed to fetch notifications', 500, 'FETCH_ERROR');
    }
  }

  /**
   * Mark notification as read (T093)
   */
  async markAsRead(notificationId: string, userId: string): Promise<any> {
    try {
      const result = await database.query(
        `UPDATE notifications 
         SET is_read = true, read_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, is_read`,
        [notificationId, userId],
      );

      if (result.rows.length === 0) {
        throw new KhaliaError('Notification not found', 404, 'NOT_FOUND');
      }

      return {
        notification_id: notificationId,
        is_read: true,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Mark read error', { error, notificationId, userId });
      throw new KhaliaError('Failed to mark notification as read', 500, 'UPDATE_ERROR');
    }
  }

  /**
   * Mark all as read (T094)
   */
  async markAllAsRead(userId: string): Promise<any> {
    try {
      const result = await database.query(
        `UPDATE notifications 
         SET is_read = true, read_at = NOW()
         WHERE user_id = $1 AND is_read = false
         RETURNING id`,
        [userId],
      );

      logger.info('All notifications marked as read', { userId, count: result.rows.length });

      return {
        marked_as_read: result.rows.length,
      };
    } catch (error: any) {
      logger.error('Mark all read error', { error, userId });
      throw new KhaliaError('Failed to mark all notifications as read', 500, 'UPDATE_ERROR');
    }
  }

  /**
   * Helper: Generate notification message
   */
  private getNotificationContent(type: NotificationType, data: any): any {
    const templates: { [key: string]: any } = {
      contribution_due: {
        title: 'Contribution Due',
        message: `Your contribution of ₦${data.amount} is due by ${new Date(data.dueDate).toLocaleDateString()}`,
      },
      contribution_reminder: {
        title: 'Contribution Reminder',
        message: `Reminder: Your contribution to ${data.groupName} is due in ${data.daysRemaining} days`,
      },
      payout_ready: {
        title: 'Your Payout is Ready!',
        message: `Congratulations! You've been selected for payout. Amount: ₦${data.amount}`,
      },
      payout_completed: {
        title: 'Payout Completed',
        message: `Your payout of ₦${data.amount} has been processed and transferred to your bank account`,
      },
      profile_alert: {
        title: 'Profile Update Needed',
        message: data.message,
      },
      system_alert: {
        title: 'System Alert',
        message: data.message,
      },
    };

    return templates[type] || { title: 'Notification', message: 'You have a new notification' };
  }

  /**
   * Helper: Send email notification
   */
  private async sendEmailNotification(email: string, content: any): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES)
      // For MVP, just log
      logger.info('Email notification sent', { email, subject: content.title });
    } catch (error) {
      logger.error('Email send failed', { error, email });
    }
  }

  /**
   * Helper: Send SMS notification
   */
  private async sendSMSNotification(phoneNumber: string, content: any): Promise<void> {
    try {
      // In production, integrate with SMS provider (Twilio, AWS SNS)
      // For MVP, just log
      logger.info('SMS notification sent', { phoneNumber, message: content.message });
    } catch (error) {
      logger.error('SMS send failed', { error, phoneNumber });
    }
  }

  /**
   * Schedule contribution reminders (background job)
   */
  async scheduleContributionReminders(): Promise<void> {
    try {
      // Find all contributions due in 2 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);

      const contributions = await database.query(
        `SELECT c.id, c.user_id, c.amount_naira, g.name as group_name
         FROM contributions c
         JOIN groups g ON c.group_id = g.id
         WHERE c.status = 'pending' 
         AND DATE(c.due_date) = DATE($1)
         AND NOT EXISTS (
          SELECT 1 FROM notifications 
          WHERE user_id = c.user_id 
          AND type = 'contribution_reminder'
          AND DATE(created_at) = CURRENT_DATE
         )`,
        [dueDate],
      );

      for (const contribution of contributions.rows) {
        await this.sendNotification(
          contribution.user_id,
          'contribution_reminder',
          {
            groupName: contribution.group_name,
            amount: contribution.amount_naira,
            daysRemaining: 2,
          },
          ['sms', 'email'],
        );
      }

      logger.info('Contribution reminders scheduled', { count: contributions.rows.length });
    } catch (error) {
      logger.error('Schedule reminders error', { error });
    }
  }

  /**
   * Schedule payout ready notifications (background job)
   */
  async schedulePayoutNotifications(): Promise<void> {
    try {
      // Find all approved payouts that haven't been notified
      const payouts = await database.query(
        `SELECT p.id, p.recipient_id, p.amount_naira
         FROM payouts p
         WHERE p.status = 'approved'
         AND p.notified_at IS NULL`,
      );

      for (const payout of payouts.rows) {
        await this.sendNotification(
          payout.recipient_id,
          'payout_ready',
          {
            amount: payout.amount_naira,
          },
          ['email', 'sms'],
        );

        // Mark as notified
        await database.query(`UPDATE payouts SET notified_at = NOW() WHERE id = $1`, [payout.id]);
      }

      logger.info('Payout notifications scheduled', { count: payouts.rows.length });
    } catch (error) {
      logger.error('Schedule payout notifications error', { error });
    }
  }
}

export default new NotificationsService();
