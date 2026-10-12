import { Role } from '../../../generated/prisma';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  // Bumped whenever sessions must be invalidated (e.g. password reset). A token
  // is rejected when this does not match the user's current token_version.
  ver: number;
}
