import { INestApplication } from "@nestjs/common";
import request from "supertest";

export async function registerAndLogin(
  app: INestApplication,
  overrides: Partial<{email: string, name: string, password: string}> = {}
) {
  const user = {
    email: 'test-user@test.com',
    name: 'Test User',
    password: 'Aa1',
    ...overrides
  }

  await request(app.getHttpServer())
    .post('/users')
    .send(user)
    .expect(201)

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: user.password
    })
    .expect(200)

  return {
    user,
    accessToken: loginResponse.body.accessToken as string
  }
}