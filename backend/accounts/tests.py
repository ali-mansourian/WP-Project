from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_listener_url = reverse('accounts:register-listener')
        self.register_artist_url = reverse('accounts:register-artist')
        self.login_url = reverse('accounts:login')
        self.me_url = reverse('accounts:me')
        self.logout_url = reverse('accounts:logout')

    def test_register_listener_success(self):
        payload = {
            'email': 'listener@example.com',
            'name': 'Test Listener',
            'password': 'StrongPass123!',
            'date_of_birth': '2000-01-01',
            'gender': 'male',
        }

        response = self.client.post(self.register_listener_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], payload['email'])
        self.assertEqual(response.data['user']['role'], 'listener')
        self.assertEqual(response.data['user']['tier'], 'free')
        self.assertEqual(response.data['user']['status'], 'active')
        self.assertTrue(User.objects.filter(email=payload['email']).exists())

    def test_register_listener_duplicate_email_fails(self):
        payload = {
            'email': 'duplicate@example.com',
            'name': 'First User',
            'password': 'StrongPass123!',
        }

        first_response = self.client.post(self.register_listener_url, payload, format='json')
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        second_response = self.client.post(self.register_listener_url, payload, format='json')
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_artist_success_and_pending(self):
        payload = {
            'email': 'artist@example.com',
            'stage_name': 'Test Artist',
            'password': 'StrongPass123!',
        }

        response = self.client.post(self.register_artist_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], payload['email'])
        self.assertEqual(response.data['user']['role'], 'artist')
        self.assertEqual(response.data['user']['status'], 'pending')
        self.assertTrue(User.objects.filter(email=payload['email']).exists())

    def test_login_success(self):
        User.objects.create_user(
            email='login@example.com',
            password='StrongPass123!',
            name='Login User',
        )

        payload = {
            'email': 'login@example.com',
            'password': 'StrongPass123!',
        }

        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'login@example.com')

    def test_login_wrong_password_fails(self):
        User.objects.create_user(
            email='wrongpass@example.com',
            password='StrongPass123!',
            name='Wrong Pass User',
        )

        payload = {
            'email': 'wrongpass@example.com',
            'password': 'WrongPassword!',
        }

        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        User.objects.create_user(
            email='me@example.com',
            password='StrongPass123!',
            name='Me User',
        )

        login_payload = {
            'email': 'me@example.com',
            'password': 'StrongPass123!',
        }

        login_response = self.client.post(self.login_url, login_payload, format='json')
        token = login_response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'me@example.com')
        self.assertEqual(response.data['name'], 'Me User')

    def test_update_current_user_profile(self):
        user = User.objects.create_user(
            email='update@example.com',
            password='StrongPass123!',
            name='Old Name',
        )

        login_payload = {
            'email': 'update@example.com',
            'password': 'StrongPass123!',
        }

        login_response = self.client.post(self.login_url, login_payload, format='json')
        token = login_response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        payload = {
            'name': 'New Name',
            'preferences': {'theme': 'dark', 'volume': 80}
        }
        response = self.client.patch(self.me_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'New Name')
        self.assertEqual(response.data['preferences']['theme'], 'dark')
        
        user.refresh_from_db()
        self.assertEqual(user.name, 'New Name')
        self.assertEqual(user.preferences['theme'], 'dark')

    def test_logout_deletes_token(self):
        User.objects.create_user(
            email='logout@example.com',
            password='StrongPass123!',
            name='Logout User',
        )

        login_payload = {
            'email': 'logout@example.com',
            'password': 'StrongPass123!',
        }

        login_response = self.client.post(self.login_url, login_payload, format='json')
        token = login_response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        logout_response = self.client.post(self.logout_url)
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        self.client.credentials()
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_401_UNAUTHORIZED)