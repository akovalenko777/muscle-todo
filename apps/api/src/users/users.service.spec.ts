import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { TokensService } from "../tokens/token.service.js"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import bcrypt from 'bcrypt'
import { Mock } from "vitest"
import { JwtService } from "@nestjs/jwt"
import { FAKE_HASH } from "../tasks/helper/constants.js"
import { Prisma } from "../generated/prisma/client.js"

vi.mock('bcrypt', () => ({ default: { compare: vi.fn<typeof bcrypt.compare>(), hash: vi.fn<typeof bcrypt.hash>() } }))

const TEST_USER = {
  id: '1234567890',
  passwordHash: 'somePasswordHash',
  email: 'user@test.com',
  role: 'USER'
}

describe('UsersServices', () => {
  let prisma: { user: { findUnique: Mock, update: Mock } }
  let tokens: { upsertRefreshToken: Mock }
  let service: UsersService

  vi.resetAllMocks()

  beforeEach(async () => {
    prisma = { user: { findUnique: vi.fn(), update: vi.fn() } }
    tokens = { upsertRefreshToken: vi.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokensService, useValue: tokens },
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: {} }
      ]
    }).compile()

    service = module.get(UsersService)
  })

  it('update password for undefined user', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(
      service.updatePassword('unexpected_id', { currentPassword: '123', password: '234' })
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('update password with incorrect current password', async () => {
    prisma.user.findUnique.mockResolvedValue(TEST_USER)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any)
    await expect(
      service.updatePassword('1234567890', { currentPassword: '123', password: '234' })
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(bcrypt.compare).toHaveBeenCalledWith('123', 'somePasswordHash')
  })

  it('update password for OAuth user', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...TEST_USER, passwordHash: null })
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any)
    await expect(
      service.updatePassword('1234567890', { currentPassword: '123', password: '234' })
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(bcrypt.compare).toHaveBeenCalledWith('fakeCurrentPassword', FAKE_HASH)
  })

  it('success changing user password', async () => {
    prisma.user.findUnique.mockResolvedValue(TEST_USER)
    const resolveResult = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      user: {
        id: '1234567890',
        email: 'user@test.com',
        role: 'USER'
      }
    }
    tokens.upsertRefreshToken.mockResolvedValue(resolveResult)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
    vi.mocked(bcrypt.hash).mockResolvedValue('newPasswordHash' as any

    )
    await expect(
      service.updatePassword('1234567890', { currentPassword: 'Aa1', password: 'Aa2' })
    ).resolves.toMatchObject(resolveResult)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: TEST_USER.id },
      data: { passwordHash: 'newPasswordHash' },
      omit: { passwordHash: true }
    })
    expect(tokens.upsertRefreshToken).toHaveBeenCalledWith(TEST_USER)
  })

  it('unable change password for deleted user', async () => {
    prisma.user.findUnique.mockResolvedValue(TEST_USER)
    prisma.user.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('...', { code: 'P2025', clientVersion: '...' }))
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
    await expect(
      service.updatePassword('1234567890', { currentPassword: 'Aa1', password: 'Aa2' })
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(tokens.upsertRefreshToken).not.toHaveBeenCalled()
  })

})