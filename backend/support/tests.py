from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from .models import SupportReply, SupportTicket


class SupportTicketTests(APITestCase):
    def setUp(self):
        self.ticket_list_url = reverse('support:support-ticket-list')

        self.user = User.objects.create_user(
            email='user@example.com',
            password='StrongPass123!',
            name='Regular User',
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

        self.staff = User.objects.create_user(
            email='support@example.com',
            password='StrongPass123!',
            name='Support Staff',
            role='support',
        )

        self.authenticate(self.user)

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def detail_url(self, ticket_id):
        return reverse('support:support-ticket-detail', args=[ticket_id])

    def reply_url(self, ticket_id):
        return reverse('support:support-ticket-reply', args=[ticket_id])

    def test_unauthenticated_user_cannot_list_tickets(self):
        self.client.credentials()

        response = self.client.get(self.ticket_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_create_ticket(self):
        payload = {
            'subject': 'Payment failed',
            'message': 'My payment was declined but my bank says it went through.',
            'category': 'payment',
        }

        response = self.client.post(self.ticket_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['subject'], payload['subject'])
        self.assertEqual(response.data['status'], 'open')
        self.assertEqual(response.data['user']['email'], self.user.email)

        self.assertTrue(
            SupportTicket.objects.filter(user=self.user).exists()
        )

    def test_user_can_list_own_tickets_only(self):
        SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        SupportTicket.objects.create(
            user=self.other_user,
            subject='Other Ticket',
            message='Another issue.',
        )

        response = self.client.get(self.ticket_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        subjects = [ticket['subject'] for ticket in response.data]
        self.assertIn('My Ticket', subjects)
        self.assertNotIn('Other Ticket', subjects)

    def test_user_can_view_own_ticket(self):
        ticket = SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        response = self.client.get(self.detail_url(ticket.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], 'My Ticket')

    def test_user_cannot_view_another_users_ticket(self):
        ticket = SupportTicket.objects.create(
            user=self.other_user,
            subject='Other Ticket',
            message='Another issue.',
        )

        response = self.client.get(self.detail_url(ticket.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_reply_to_own_ticket(self):
        ticket = SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        response = self.client.post(
            self.reply_url(ticket.id),
            {'message': 'Here is more information.'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ticket.replies.count(), 1)

        reply = ticket.replies.first()
        self.assertEqual(reply.message, 'Here is more information.')
        self.assertEqual(reply.author, self.user)

    def test_reply_requires_message(self):
        ticket = SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        response = self.client.post(self.reply_url(ticket.id), {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_cannot_update_ticket_status(self):
        ticket = SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        response = self.client.patch(
            self.detail_url(ticket.id),
            {'status': 'resolved'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_view_all_tickets(self):
        SupportTicket.objects.create(
            user=self.user,
            subject='User Ticket',
            message='User issue.',
        )

        SupportTicket.objects.create(
            user=self.other_user,
            subject='Other Ticket',
            message='Other issue.',
        )

        self.authenticate(self.staff)

        response = self.client.get(self.ticket_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_staff_can_update_ticket_status_to_resolved(self):
        ticket = SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        self.authenticate(self.staff)

        response = self.client.patch(
            self.detail_url(ticket.id),
            {'status': 'resolved'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'resolved')

        ticket.refresh_from_db()
        self.assertEqual(ticket.status, SupportTicket.Status.RESOLVED)
        self.assertIsNotNone(ticket.resolved_at)

    def test_staff_reply_changes_open_ticket_to_in_progress(self):
        ticket = SupportTicket.objects.create(
            user=self.user,
            subject='My Ticket',
            message='My issue.',
        )

        self.authenticate(self.staff)

        response = self.client.post(
            self.reply_url(ticket.id),
            {'message': 'We are looking into this.'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        ticket.refresh_from_db()
        self.assertEqual(ticket.status, SupportTicket.Status.IN_PROGRESS)