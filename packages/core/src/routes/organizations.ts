import { Organizations } from '@logto/schemas';

import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from './types.js';

export default function organizationRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: { organizations },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(Organizations, new SchemaActions(organizations));

  originalRouter.use(router.routes());
}
