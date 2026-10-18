import { test } from "node:test";
import assert from "node:assert/strict";
import { demoApi } from "../services/mock";
import { current, commit, resetStore } from "../services/mock/store";
import { visibleEmployment } from "../services/mock/tracking";
import { canOpenSection } from "../lib/permissions";

Object.defineProperty(globalThis, "window", { value: {}, configurable: true });

test("optional staff permissions are denied by default, grantable, and revocable", async () => {
  await resetStore();
  await demoApi.selectDemoAccount("staff-1");
  await assert.rejects(() => demoApi.getReport("2026-01-01", "2026-10-19"));
  await assert.rejects(() =>
    demoApi.reviewAccreditation(
      "company-1",
      "Pending Review",
      "Recheck the sample accreditation documents.",
    ),
  );
  await demoApi.selectDemoAccount("admin-1");
  await demoApi.setStaffPermission(
    "reports",
    true,
    "Authorize staff to generate PESO reports.",
    true,
  );
  await demoApi.setStaffPermission(
    "accreditation",
    true,
    "Authorize staff accreditation review duties.",
    true,
  );
  await demoApi.selectDemoAccount("staff-1");
  assert.ok(await demoApi.getReport("2026-01-01", "2026-10-19"));
  assert.equal(
    canOpenSection(
      current(),
      current().users.find((u) => u.id === "staff-1")!,
      "reports",
    ),
    true,
  );
  await demoApi.reviewAccreditation(
    "company-1",
    "Pending Review",
    "Recheck the sample accreditation documents.",
  );
  await demoApi.selectDemoAccount("admin-1");
  await demoApi.setStaffPermission(
    "reports",
    false,
    "Revoke staff reporting access after review.",
    true,
  );
  await demoApi.selectDemoAccount("staff-1");
  await assert.rejects(() => demoApi.getReport("2026-01-01", "2026-10-19"));
});

test("linked employment, ownership, notifications, corrections, and hiring idempotency", async () => {
  await resetStore();
  await demoApi.selectDemoAccount("employer-user-1");
  await demoApi.updateApplication("application-1", "Hired");
  await demoApi.updateApplication("application-1", "Hired");
  let records = current().employmentRecords.filter(
    (r) => r.applicationId === "application-1",
  );
  assert.equal(records.length, 1);
  const id = records[0].id;
  const date = records[0].hiredAt.slice(0, 10);
  await demoApi.updateEmployment(id, {
    status: "Active",
    effectiveDate: date,
    remarks: "Confirmed first day with the company.",
    department: "Customer Support",
    classification: "Full-time",
    confirmed: true,
  });
  assert.equal(
    current().employmentRecords.find((r) => r.id === id)?.history.length,
    2,
  );
  assert.ok(
    current().notifications.some(
      (n) => n.userId === "seeker-1" && n.title === "Employment update: Active",
    ),
  );
  await demoApi.selectDemoAccount("employer-user-2");
  assert.ok(!visibleEmployment(current()).some((r) => r.id === id));
  await assert.rejects(() =>
    demoApi.updateEmployment(id, {
      status: "Regular",
      effectiveDate: date,
      remarks: "Should never change another company record.",
      department: "Support",
      classification: "Full-time",
      confirmed: true,
    }),
  );
  await demoApi.selectDemoAccount("seeker-1");
  assert.equal(
    visibleEmployment(current()).find((r) => r.id === id)?.status,
    "Active",
  );
  await assert.rejects(() =>
    demoApi.updateEmployment(id, {
      status: "Regular",
      effectiveDate: date,
      remarks: "Job seekers must never edit verified status.",
      department: "Support",
      classification: "Full-time",
      confirmed: true,
    }),
  );
  await demoApi.requestCorrection(
    id,
    "Please verify my department with the employer.",
  );
  await assert.rejects(() =>
    demoApi.requestCorrection(
      id,
      "Duplicate open correction must be rejected.",
    ),
  );
  await demoApi.selectDemoAccount("admin-1");
  const correction = current().correctionRequests[0];
  await demoApi.reviewCorrection(
    correction.id,
    "Verified with employer and recorded the review outcome.",
  );
  assert.equal(current().correctionRequests[0].status, "Reviewed");
  assert.equal(
    current().employmentRecords.find((r) => r.id === id)?.status,
    "Active",
  );
  assert.ok(
    current().auditLogs.some(
      (a) => a.target === id && a.action.includes("Employment status: Active"),
    ),
  );
});

test("restricted staff access, confirmed role changes, and last-admin protection", async () => {
  await resetStore();
  await demoApi.selectDemoAccount("staff-1");
  assert.equal(visibleEmployment(current()).length, 0);
  const staff = current().users.find((u) => u.id === "staff-1")!;
  assert.equal(canOpenSection(current(), staff, "role-management"), false);
  assert.equal(canOpenSection(current(), staff, "users"), false);
  await assert.rejects(() =>
    demoApi.updateAccess(
      "staff-1",
      "admin",
      true,
      "Unauthorized privilege escalation attempt.",
      true,
    ),
  );
  await demoApi.selectDemoAccount("admin-1");
  await assert.rejects(() =>
    demoApi.updateAccess(
      "admin-1",
      "staff",
      true,
      "Cannot downgrade the current elevated account.",
      true,
    ),
  );
  await assert.rejects(() =>
    demoApi.updateAccess(
      "staff-1",
      "admin",
      true,
      "Confirmation is required for this change.",
      false,
    ),
  );
  await demoApi.assignStaff(current().employmentRecords[0].id, "staff-1");
  await demoApi.selectDemoAccount("staff-1");
  assert.equal(visibleEmployment(current()).length, 1);
  await demoApi.selectDemoAccount("admin-1");
  await demoApi.updateAccess(
    "staff-1",
    "admin",
    true,
    "Authorized PESO administrator assignment.",
    true,
  );
  assert.equal(current().roleChangeLogs[0].previousRole, "staff");
  assert.equal(current().roleChangeLogs[0].newRole, "admin");
  await commit((s) => {
    s.users.find((u) => u.id === "staff-1")!.active = false;
    s.sessionUserId = "staff-1";
  });
  await assert.rejects(() =>
    demoApi.updateAccess(
      "admin-1",
      "staff",
      true,
      "Inactive actors must never manage access.",
      true,
    ),
  );
  await commit((s) => {
    s.sessionUserId = "admin-1";
  });
  await assert.rejects(() =>
    demoApi.setStaffPermission(
      "roles",
      true,
      "Cannot grant role management to restricted staff.",
      true,
    ),
  );
});
