import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  validateHostManifest,
  validateDeepSeekBundle,
  validateMarketplace,
  validatePortableManifest,
  validateRepository,
  validateSkill,
} from "../scripts/validate-plugin.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function makeSkill(t, frontmatter, body = "# Example\n") {
  const root = await mkdtemp(path.join(tmpdir(), "fiveai-skill-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const skillDir = path.join(root, "example-skill");
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    path.join(skillDir, "SKILL.md"),
    `---\n${frontmatter}\n---\n\n${body}`,
    "utf8",
  );
  return skillDir;
}

test("the repository exposes all eleven FiveAI skills as one valid plugin", async () => {
  const result = await validateRepository(repoRoot);

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.skillNames, [
    "esx-framework",
    "fivem-basics",
    "fivem-nui",
    "fivem-security",
    "fivemanage",
    "lua-basics",
    "ox-inventory",
    "ox-target",
    "oxlib",
    "oxmysql",
    "qbcore-framework",
  ]);
});

test("an incomplete skill directory blocks repository validation", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "fiveai-plugin-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "skills", "incomplete-skill"), { recursive: true });

  const result = await validateRepository(root);

  assert.ok(
    result.errors.some((error) =>
      error.includes("skills/incomplete-skill: missing SKILL.md"),
    ),
  );
});

test("skill metadata accepts nested attribution but rejects legacy top-level keys", async (t) => {
  const validSkill = await makeSkill(
    t,
    'name: example-skill\ndescription: Example skill for validator tests.\nmetadata:\n  author: tester\n  version: "1.0.0"',
  );
  assert.deepEqual(await validateSkill(validSkill), []);

  const invalidSkill = await makeSkill(
    t,
    "name: example-skill\ndescription: Example skill for validator tests.\nauthor: tester\nversion: 1.0.0\nmcp-server: projecthub",
  );
  const errors = await validateSkill(invalidSkill);

  assert.ok(errors.some((error) => error.includes('unsupported frontmatter key "author"')));
  assert.ok(errors.some((error) => error.includes('unsupported frontmatter key "version"')));
  assert.ok(errors.some((error) => error.includes('unsupported frontmatter key "mcp-server"')));
});

test("skill references cannot escape the skill directory", async (t) => {
  const skillDir = await makeSkill(
    t,
    "name: example-skill\ndescription: Example skill for validator tests.",
    "# Example\n\nRead [outside](../outside.md).\n",
  );

  const errors = await validateSkill(skillDir);
  assert.ok(errors.some((error) => error.includes("escapes the skill directory")));
});

test("skill frontmatter rejects unquoted YAML colon-space scalars", async (t) => {
  const skillDir = await makeSkill(
    t,
    "name: example-skill\ndescription: Example docs: https://example.com",
  );

  const errors = await validateSkill(skillDir);
  assert.ok(errors.some((error) => error.includes("must quote values containing colon-space")));
});

test("skill frontmatter rejects unmatched scalar quotes", async (t) => {
  const skillDir = await makeSkill(
    t,
    'name: example-skill\ndescription: "unterminated',
  );

  const errors = await validateSkill(skillDir);
  assert.ok(errors.some((error) => error.includes("unmatched quote")));
});

test("skill frontmatter rejects invalid YAML escape sequences", async (t) => {
  const skillDir = await makeSkill(
    t,
    'name: example-skill\ndescription: "bad\\q"',
  );

  const errors = await validateSkill(skillDir);
  assert.ok(errors.some((error) => error.includes("invalid escape")));
});

test("portable manifests reject component paths outside the standard schema", () => {
  const errors = validatePortableManifest({
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: "fiveai-skills",
    skills: "./skills/",
  });

  assert.ok(errors.some((error) => error.includes('unsupported field "skills"')));
});

test("host manifests must preserve canonical public metadata", () => {
  const canonical = {
    name: "fiveai-skills",
    version: "0.1.0",
    description: "Curated FiveM development skills for coding agents.",
    author: { name: "germanfndez" },
    homepage: "https://github.com/germanfndez/fiveai-skills#readme",
    repository: "https://github.com/germanfndez/fiveai-skills",
  };
  const errors = validateHostManifest(
    "codebuddy",
    {
      ...canonical,
      homepage: "https://github.com/wrong/fiveai-skills#readme",
      skills: "./skills/",
    },
    canonical,
  );

  assert.ok(errors.some((error) => error.includes("codebuddy homepage")));
});

test("marketplace validation follows the portable manifest version", () => {
  const errors = validateMarketplace(
    "test/marketplace.json",
    {
      name: "fiveai",
      plugins: [
        {
          name: "fiveai-skills",
          version: "2.3.4",
          source: "./",
        },
      ],
    },
    "cursor",
    "2.3.4",
  );

  assert.deepEqual(errors, []);
});

test("DeepSeek Harness bundle mounts the canonical skills directory", () => {
  const patch = `- insert:
    - id: fiveai-skills
      name: '@deepseek-ai/dsh-skill-filesystem'
      config:
        providerName: fiveai-skills
        includeDefaultRoots: false
        bundledSkillDir: !!js "process.getBuiltinModule('node:url').fileURLToPath(new URL('skills/', baseUrl))"
`;
  const packageJson = {
    files: ["skills", "cordis.patch.yml"],
    dsh: { bundle: { patch: "./cordis.patch.yml" } },
  };

  assert.deepEqual(validateDeepSeekBundle(packageJson, patch), []);
  assert.ok(
    validateDeepSeekBundle(
      { ...packageJson, dsh: undefined },
      patch,
    ).some((error) => error.includes("dsh.bundle.patch")),
  );
});
