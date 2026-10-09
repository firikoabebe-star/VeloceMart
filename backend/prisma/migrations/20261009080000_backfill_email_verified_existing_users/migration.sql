-- Grandfather accounts that existed before email verification was introduced.
-- New registrations always create an EmailOtp row, so they are excluded and
-- must still verify their email. This is a non-destructive backfill.
UPDATE "users" AS u
SET "email_verified" = true
WHERE NOT EXISTS (
  SELECT 1 FROM "email_otps" AS o WHERE o."user_id" = u."id"
);
