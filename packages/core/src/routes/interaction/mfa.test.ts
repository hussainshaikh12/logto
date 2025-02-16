import { demoAppApplicationId, InteractionEvent, MfaFactor } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockTotpBind } from '#src/__mocks__/mfa-verification.js';
import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import type koaAuditLog from '#src/middleware/koa-audit-log.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

import { interactionPrefix } from './const.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { getInteractionStorage, storeInteractionResult } = await mockEsmWithActual(
  './utils/interaction.js',
  () => ({
    getInteractionStorage: jest.fn().mockReturnValue({
      event: InteractionEvent.SignIn,
    }),
    storeInteractionResult: jest.fn(),
  })
);

const { createLog, prependAllLogEntries } = createMockLogContext();

await mockEsmWithActual(
  '#src/middleware/koa-audit-log.js',
  (): { default: typeof koaAuditLog } => ({
    // eslint-disable-next-line unicorn/consistent-function-scoping
    default: () => async (ctx, next) => {
      ctx.createLog = createLog;
      ctx.prependAllLogEntries = prependAllLogEntries;

      return next();
    },
  })
);

const { verifyMfaSettings } = await mockEsmWithActual(
  './utils/sign-in-experience-validation.js',
  () => ({
    verifyMfaSettings: jest.fn(),
  })
);

const { bindMfaPayloadVerification, verifyMfaPayloadVerification } = await mockEsmWithActual(
  './verifications/mfa-payload-verification.js',
  () => ({
    bindMfaPayloadVerification: jest.fn(),
    verifyMfaPayloadVerification: jest.fn(),
  })
);

const { verifyIdentifier } = await mockEsmWithActual('./verifications/index.js', () => ({
  verifyIdentifier: jest.fn(),
}));

const baseProviderMock = {
  params: {},
  jti: 'jti',
  client_id: demoAppApplicationId,
};

const tenantContext = new MockTenant(
  createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
  {
    signInExperiences: {
      findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
    },
    users: {
      findUserById: jest.fn().mockResolvedValue(mockUserWithMfaVerifications),
    },
  }
);

const { default: interactionRoutes } = await import('./index.js');

describe('interaction routes (MFA verification)', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: interactionRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();

    getInteractionStorage.mockReturnValue({
      event: InteractionEvent.SignIn,
    });
  });

  describe('PUT /interaction/bind-mfa', () => {
    const path = `${interactionPrefix}/bind-mfa`;

    it('should return 204 and store results in session', async () => {
      bindMfaPayloadVerification.mockResolvedValue(mockTotpBind);

      const body = {
        type: MfaFactor.TOTP,
        code: '123456',
      };

      const response = await sessionRequest.put(path).send(body);
      expect(response.status).toEqual(204);
      expect(getInteractionStorage).toBeCalled();
      expect(verifyMfaSettings).toBeCalled();
      expect(bindMfaPayloadVerification).toBeCalled();
      expect(storeInteractionResult).toBeCalledWith(
        { bindMfa: mockTotpBind },
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('PUT /interaction/mfa', () => {
    const path = `${interactionPrefix}/mfa`;

    it('should throw for register event', async () => {
      getInteractionStorage.mockReturnValue({
        event: InteractionEvent.Register,
      });

      const response = await sessionRequest.put(path).send({
        type: MfaFactor.TOTP,
        code: '123456',
      });

      expect(response.status).toEqual(400);
    });

    it('should throw when account id is empty', async () => {
      getInteractionStorage.mockReturnValue({
        event: InteractionEvent.SignIn,
      });
      verifyIdentifier.mockResolvedValue({
        event: InteractionEvent.SignIn,
      });

      const response = await sessionRequest.put(path).send({
        type: MfaFactor.TOTP,
        code: '123456',
      });

      expect(response.status).toEqual(400);
    });

    it('should return 204 and store results in session', async () => {
      getInteractionStorage.mockReturnValue({
        event: InteractionEvent.SignIn,
      });
      verifyIdentifier.mockResolvedValue({
        event: InteractionEvent.SignIn,
        accountId: 'accountId',
      });
      verifyMfaPayloadVerification.mockResolvedValue({
        type: MfaFactor.TOTP,
        id: 'id',
      });

      const body = {
        type: MfaFactor.TOTP,
        code: '123456',
      };

      const response = await sessionRequest.put(path).send(body);
      expect(response.status).toEqual(204);
      expect(getInteractionStorage).toBeCalled();
      expect(verifyMfaPayloadVerification).toBeCalled();
      expect(storeInteractionResult).toBeCalledWith(
        {
          verifiedMfa: {
            type: MfaFactor.TOTP,
            id: 'id',
          },
        },
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });
  });
});
