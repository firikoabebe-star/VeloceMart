import test from "node:test";
import assert from "node:assert/strict";
import {
  INCOMPLETE_CODE_MESSAGE,
  validateResetEmail,
  validateResetForm,
} from "./password-reset-validation.ts";

test("validateResetEmail accepts a well-formed address", () => {
  assert.equal(validateResetEmail("user@example.com"), undefined);
});

test("validateResetEmail requires an address", () => {
  assert.equal(validateResetEmail(""), "Email is required");
});

test("validateResetEmail rejects a malformed address", () => {
  assert.equal(validateResetEmail("not-an-email"), "Invalid email address");
});

test("validateResetForm accepts a complete, matching submission", () => {
  assert.deepEqual(
    validateResetForm({
      code: "123456",
      newPassword: "Password123",
      confirmPassword: "Password123",
    }),
    {},
  );
});

test("validateResetForm flags an incomplete code", () => {
  const errors = validateResetForm({
    code: "123",
    newPassword: "Password123",
    confirmPassword: "Password123",
  });
  assert.equal(errors.code, INCOMPLETE_CODE_MESSAGE);
});

test("validateResetForm enforces the minimum password length", () => {
  const errors = validateResetForm({
    code: "123456",
    newPassword: "short",
    confirmPassword: "short",
  });
  assert.equal(errors.newPassword, "Password must be at least 8 characters");
});

test("validateResetForm requires a confirmation", () => {
  const errors = validateResetForm({
    code: "123456",
    newPassword: "Password123",
    confirmPassword: "",
  });
  assert.equal(errors.confirmPassword, "Please confirm your password");
});

test("validateResetForm rejects mismatched passwords", () => {
  const errors = validateResetForm({
    code: "123456",
    newPassword: "Password123",
    confirmPassword: "Password124",
  });
  assert.equal(errors.confirmPassword, "Passwords do not match");
});
