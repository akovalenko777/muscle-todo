import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  const userShape = expect.objectContaining({
    id: expect.any(String),
    email: expect.any(String),
    name: expect.any(String),
    createdAt: expect.any(String)
  })

  const testUser = {
    email: 'new-test@test.com',
    name: 'Test User',
    password: 'Aa1'
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.task.deleteMany()

    const auth = await registerAndLogin(app, { email: 'admin@localhost.com' })
    accessToken = auth.accessToken
  })

  describe('Users flow', () => {
    it('create a user', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
        .then((response) => {
          expect(response.body).not.toHaveProperty('passwordHash')
        })
    })

    it('create a user with existed email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)

      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(400)
    })

    it('get users list', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `bearer ${accessToken}`)
      expect(status).toBe(200)
      expect(body).toStrictEqual(expect.arrayContaining([userShape]))
      body.forEach((user: unknown) => {
        expect(user).not.toHaveProperty('passwordHash')
      })
    })

    it('update user name', async () => {
      const newName = 'New User Name'
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
      const { status, body } = await request(app.getHttpServer())
        .patch(`/users/${userResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          name: newName
        })
      expect(status).toBe(200)
      expect(body.name).toBe(newName)
    })

    it('update user password', async () => {
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
      await request(app.getHttpServer())
        .patch(`/users/${userResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          password: 'newPass'
        })
        .expect(400)
    })

    it('delete user', async () => {
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
      await request(app.getHttpServer())
        .delete(`/users/${userResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204)
    })

    it('regular user cannot list all users', async () => {
      const { accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com' })
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `bearer ${userToken}`)
        .expect(403)
    })

    it('regular user cannot get user info', async () => {
      const { userId, accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com' })
      await request(app.getHttpServer())
        .get('/users/'+userId)
        .set('Authorization', `bearer ${userToken}`)
        .expect(403)
    })

    it('regular user cannot update profile by ID parameter', async () => {
      const { userId, accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com' })
      await request(app.getHttpServer())
        .patch('/users/'+userId)
        .set('Authorization', `bearer ${userToken}`)
        .send({ name: 'New Name' })
        .expect(403)
    })

    it('regular user cannot delete profile by ID parameter', async () => {
      const { userId, accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com' })
      await request(app.getHttpServer())
        .delete('/users/'+userId)
        .set('Authorization', `bearer ${userToken}`)
        .expect(403)
    })

    it('regular user can update profile by /me endpoint', async () => {
      const { accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com' })
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `bearer ${userToken}`)
        .send({ name: 'New Name' })
        .expect(200)
        .then((resp) => {
          expect(resp.body.name).toBe('New Name')
        })
    })

    it('regular user try change password without new password', async () => {
      const currentPassword = 'Aa1'
      const { accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com', password: currentPassword })
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `bearer ${userToken}`)
        .send({
          currentPassword
        })
        .expect(400)
    })
    it('regular user try change password with empty new password', async () => {
      const currentPassword = 'Aa1'
      const { accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com', password: currentPassword })
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `bearer ${userToken}`)
        .send({
          currentPassword,
          password: ''
        })
        .expect(400)
    })
    it('regular user try change password with weak new password', async () => {
      const currentPassword = 'Aa1'
      const { accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com', password: currentPassword })
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `bearer ${userToken}`)
        .send({
          currentPassword,
          password: 'AAAAAAAA'
        })
        .expect(400)
    })
    it('regular user try change password with wrong current password', async () => {
      const currentPassword = 'Aa1'
      const { accessToken: userToken } = await registerAndLogin(app, { email: 'regular@test.com', password: currentPassword })
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `bearer ${userToken}`)
        .send({
          currentPassword: currentPassword+'1',
          password: 'NewAa2'
        })
        .expect(400)
    })
    it('regular user try change password, success scenario', async () => {
      const email = 'regular@test.com'
      const currentPassword = 'Aa1'
      const newPassword = 'NewAa2'
      const { accessToken, refreshToken } = await registerAndLogin(app, { email, password: currentPassword })
      const response = await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          currentPassword: currentPassword,
          password: newPassword
        })
        .expect(200)
      const newRefreshToken = response.body.refreshToken
      // try to refresh with old token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401)
      // try to refresh with new token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(200)
      // logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      // other logout for unauthorized user will return 200 OK
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      // try to refresh token after logout  
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(401)
      // try to login with old password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send ({
          email,
          password: currentPassword
        })
        .expect(401)
      // try to login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send ({
          email,
          password: newPassword
        })
        .expect(200)
    })
    it('regular user try change password without token', async () => {
      const currentPassword = 'Aa1'
      await registerAndLogin(app, { email: 'regular@test.com', password: currentPassword })
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .send({
          currentPassword: currentPassword,
          password: 'NewAa2'
        })
        .expect(401)
    })
  })
})