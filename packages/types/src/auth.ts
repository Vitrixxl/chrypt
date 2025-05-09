import { auth } from '../../../apps/back/src/libs/auth';
export type ServerAuth = typeof auth;
export type User = typeof auth.$Infer.Session.user;
