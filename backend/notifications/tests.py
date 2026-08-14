from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Notification


class NotificationTests(APITestCase):
    def setUp(self):
        self.notification_list_url = reverse('notifications:notification-list')
        self.unread_count_url = reverse('notifications:notification-unread-count')
        self.mark_all_read_url = reverse('notifications:notification-mark-all-read')

        self.user = User.objects.create_user(
            email='listener@example.com',
            password='StrongPass123!',
            name='Listener',
            role='listener',
            tier='free',
        )

        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='StrongPass123!',
            name='Other User',
            role='listener',
            tier='free',
        )

        self.authenticate(self.user)

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def mark_read_url(self, notification_id):
        return reverse(
            'notifications:notification-mark-read',
            args=[notification_id],
        )

    def test_unauthenticated_user_cannot_list_notifications(self):
        self.client.credentials()

        response = self.client.get(self.notification_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_list_own_notifications_only(self):
        Notification.objects.create(
            user=self.user,
            title='My Notification',
            message='Something happened.',
        )

        Notification.objects.create(
            user=self.other_user,
            title='Other Notification',
            message='Something else happened.',
        )

        response = self.client.get(self.notification_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [notification['title'] for notification in response.data]
        self.assertIn('My Notification', titles)
        self.assertNotIn('Other Notification', titles)

    def test_unread_only_filter(self):
        Notification.objects.create(
            user=self.user,
            title='Unread Notification',
            message='Unread message.',
            read=False,
        )

        Notification.objects.create(
            user=self.user,
            title='Read Notification',
            message='Read message.',
            read=True,
        )

        response = self.client.get(self.notification_list_url + '?unread_only=true')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Unread Notification')

    def test_unread_count(self):
        Notification.objects.create(
            user=self.user,
            title='First Unread',
            message='First unread message.',
            read=False,
        )

        Notification.objects.create(
            user=self.user,
            title='Second Unread',
            message='Second unread message.',
            read=False,
        )

        Notification.objects.create(
            user=self.user,
            title='Read',
            message='Read message.',
            read=True,
        )

        response = self.client.get(self.unread_count_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 2)

    def test_mark_notification_read(self):
        notification = Notification.objects.create(
            user=self.user,
            title='Unread Notification',
            message='Unread message.',
            read=False,
        )

        response = self.client.post(self.mark_read_url(notification.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['read'])

        notification.refresh_from_db()
        self.assertTrue(notification.read)

    def test_cannot_mark_other_users_notification_read(self):
        notification = Notification.objects.create(
            user=self.other_user,
            title='Other Notification',
            message='Other message.',
            read=False,
        )

        response = self.client.post(self.mark_read_url(notification.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_all_notifications_read(self):
        Notification.objects.create(
            user=self.user,
            title='First Unread',
            message='First unread message.',
            read=False,
        )

        Notification.objects.create(
            user=self.user,
            title='Second Unread',
            message='Second unread message.',
            read=False,
        )

        Notification.objects.create(
            user=self.user,
            title='Already Read',
            message='Already read message.',
            read=True,
        )

        response = self.client.post(self.mark_all_read_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['marked_read'], 2)

        unread_count = Notification.objects.filter(
            user=self.user,
            read=False,
        ).count()

        self.assertEqual(unread_count, 0)