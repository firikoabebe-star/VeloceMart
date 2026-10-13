import test from "node:test";
import assert from "node:assert/strict";
import {
  MESSAGE_MIN_LENGTH,
  validateContactForm,
} from "./contact-validation.ts";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  category: "GENERAL" as const,
  subject: "A question",
  message: "This message is definitely long enough.",
  orderReference: "",
};

test("validateContactForm accepts a complete submission", () => {
  assert.deepEqual(validateContactForm(valid), {});
});

test("validateContactForm requires a name", () => {
  assert.equal(validateContactForm({ ...valid, name: "  " }).name, "Please enter your name");
});

test("validateContactForm enforces a minimum name length", () => {
  assert.equal(
    validateContactForm({ ...valid, name: "A" }).name,
    "Name must be at least 2 characters",
  );
});

test("validateContactForm requires an email", () => {
  assert.equal(
    validateContactForm({ ...valid, email: "" }).email,
    "Email is required",
  );
});

test("validateContactForm rejects a malformed email", () => {
  assert.equal(
    validateContactForm({ ...valid, email: "not-an-email" }).email,
    "Invalid email address",
  );
});

test("validateContactForm requires a category", () => {
  assert.equal(
    validateContactForm({ ...valid, category: "" }).category,
    "Please choose a topic",
  );
});

test("validateContactForm enforces the minimum message length", () => {
  assert.equal(
    validateContactForm({ ...valid, message: "short" }).message,
    `Message must be at least ${MESSAGE_MIN_LENGTH} characters`,
  );
});

test("validateContactForm requires a subject", () => {
  assert.equal(
    validateContactForm({ ...valid, subject: "  " }).subject,
    "Subject is required",
  );
});
