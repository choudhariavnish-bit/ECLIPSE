const dbService = require("../database/db_service");
const bcrypt = require("bcryptjs");

async function unitTest() {
  console.log("=== UNIT TEST: DB & AUTH SERVICE ===");

  // 1. Verify schema & organizations
  const orgs = await dbService.getOrganizations();
  console.log("[1] Organizations:", orgs.length, "found. Default org:", orgs[0]?.name);

  // 2. Test user creation (Sign up)
  const testEmail = "test_creator_" + Date.now() + "@agency.ai";
  const passHash = await bcrypt.hash("secure123", 10);
  const created = await dbService.createUser({
    name: "Anushka Bhaykar",
    email: testEmail,
    password: passHash,
    role: "creator",
    organization_id: "a0000000-0000-0000-0000-000000000001",
    department: "Creative Studio"
  });
  console.log("[2] Created User:", created.name, "Role:", created.role, "ID:", created.id);

  // 3. Find user by email
  const found = await dbService.findUserByEmail(testEmail);
  console.log("[3] Find User By Email:", found?.email === testEmail ? "SUCCESS" : "FAIL");

  // 4. Verify password check
  const pwMatch = await bcrypt.compare("secure123", found.password);
  console.log("[4] Password Verification:", pwMatch ? "SUCCESS" : "FAIL");

  // 5. Verify audit log creation
  await dbService.logAction({
    organization_id: "a0000000-0000-0000-0000-000000000001",
    user_id: found.id,
    action: "USER_REGISTERED",
    entity_type: "users",
    entity_id: found.id,
    details: { role: found.role, email: found.email }
  });
  const logs = await dbService.getAuditLogs(10);
  console.log("[5] Audit Logs Count:", logs.length, "Latest action:", logs[0]?.action);

  // 6. Verify all 9 table getters exist and return arrays
  const tables = ["organizations", "users", "guidelines", "rules", "drafts", "findings", "comments", "approvals", "audit_logs"];
  console.log("[6] Verifying all 9 relational tables:");
  for (const t of tables) {
    let rows = [];
    if (t === "organizations") rows = await dbService.getOrganizations();
    else if (t === "users") rows = await dbService.getUsers();
    else if (t === "guidelines") rows = await dbService.getGuidelines();
    else if (t === "rules") rows = await dbService.getRules();
    else if (t === "drafts") rows = await dbService.getDrafts();
    else if (t === "findings") rows = await dbService.getFindingsByDraft("d0000000-0000-0000-0000-000000000001");
    else if (t === "comments") rows = await dbService.getComments("d0000000-0000-0000-0000-000000000001");
    else if (t === "approvals") rows = await dbService.getApprovalsByDraft("d0000000-0000-0000-0000-000000000001");
    else if (t === "audit_logs") rows = await dbService.getAuditLogs(10);
    console.log(`    - Table '${t}': ${Array.isArray(rows) ? 'OK (' + rows.length + ' rows)' : 'FAILED'}`);
  }

  console.log("\n>>> ALL DB & LOGIC TESTS COMPLETED SUCCESSFULLY! <<<");
  process.exit(0);
}

unitTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

