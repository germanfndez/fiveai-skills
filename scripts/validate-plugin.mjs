import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AGENT_PLUGIN_SCHEMA =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const PLUGIN_NAME = "fiveai-skills";
const MARKETPLACE_NAME = "fiveai";
const PUBLISHER = "wojzj57";
const REPOSITORY_URL = "https://github.com/wojzj57/fiveai-skills";
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PORTABLE_PLUGIN_NAME_PATTERN =
  /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const ALLOWED_SKILL_KEYS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);
const ALLOWED_PORTABLE_FIELDS = new Set([
  "$schema",
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
  "extensions",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function isQuotedScalar(value) {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  );
}

function validateQuotedScalar(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if (quote !== '"' && quote !== "'") return null;
  if (trimmed.length < 2 || !trimmed.endsWith(quote)) {
    return "has an unmatched quote";
  }

  const content = trimmed.slice(1, -1);
  if (quote === "'") {
    for (let index = 0; index < content.length; index += 1) {
      if (content[index] !== "'") continue;
      if (content[index + 1] !== "'") return "contains an unescaped single quote";
      index += 1;
    }
    return null;
  }

  const simpleEscapes = new Set([
    "0",
    "a",
    "b",
    "t",
    "n",
    "v",
    "f",
    "r",
    "e",
    " ",
    '"',
    "/",
    "\\",
    "N",
    "_",
    "L",
    "P",
  ]);
  const hexadecimalEscapes = { x: 2, u: 4, U: 8 };
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === '"') return "contains an unescaped double quote";
    if (content[index] !== "\\") continue;

    const escape = content[index + 1];
    if (simpleEscapes.has(escape)) {
      index += 1;
      continue;
    }
    const hexadecimalLength = hexadecimalEscapes[escape];
    if (hexadecimalLength !== undefined) {
      const digits = content.slice(index + 2, index + 2 + hexadecimalLength);
      if (digits.length === hexadecimalLength && /^[0-9A-Fa-f]+$/.test(digits)) {
        index += hexadecimalLength + 1;
        continue;
      }
    }
    return `contains an invalid escape \\${escape ?? ""}`;
  }
  return null;
}

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { data: {}, errors: ["missing YAML frontmatter"] };
  }

  const data = {};
  const errors = [];
  let parentKey = null;

  for (const [index, rawLine] of match[1].split(/\r?\n/).entries()) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indentation = rawLine.length - rawLine.trimStart().length;
    const field = rawLine.trim().match(/^([A-Za-z0-9-]+):(?:\s*(.*))?$/);
    if (!field) {
      errors.push(`invalid frontmatter syntax on line ${index + 2}`);
      continue;
    }

    const [, key, rawValue = ""] = field;
    const quotedScalarError = validateQuotedScalar(rawValue);
    if (quotedScalarError) {
      errors.push(`frontmatter value for "${key}" ${quotedScalarError}`);
    }
    if (rawValue.includes(": ") && !isQuotedScalar(rawValue)) {
      errors.push(
        `frontmatter value for "${key}" must quote values containing colon-space`,
      );
    }
    if (indentation === 0) {
      parentKey = null;
      if (Object.hasOwn(data, key)) {
        errors.push(`duplicate frontmatter key "${key}"`);
        continue;
      }
      if (rawValue === "") {
        data[key] = {};
        parentKey = key;
      } else {
        data[key] = parseScalar(rawValue);
      }
      continue;
    }

    if (indentation === 2 && parentKey && isPlainObject(data[parentKey])) {
      data[parentKey][key] = parseScalar(rawValue);
      continue;
    }

    errors.push(`unsupported frontmatter indentation on line ${index + 2}`);
  }

  return { data, errors };
}

async function listMarkdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(entryPath);
    }
  }
  return files;
}

function localReferences(content) {
  const references = new Set();
  const markdownLink = /!?\[[^\]]*\]\(([^)]+)\)/g;
  const bareBundledPath =
    /(?:^|[\s`'"(])((?:rules|references|scripts|assets)\/[A-Za-z0-9._/-]+\.(?:md|json|ya?ml|lua|js|mjs|ts|py|sh))/gm;

  for (const match of content.matchAll(markdownLink)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (
      target &&
      !target.startsWith("#") &&
      !/^(?:https?:|mailto:)/i.test(target)
    ) {
      references.add(target);
    }
  }
  for (const match of content.matchAll(bareBundledPath)) {
    references.add(match[1]);
  }
  return references;
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function validateSkill(skillDir) {
  const errors = [];
  const skillFile = path.join(skillDir, "SKILL.md");
  let content;
  try {
    content = await readFile(skillFile, "utf8");
  } catch (error) {
    return [`${skillFile}: cannot read SKILL.md (${error.message})`];
  }

  const parsed = parseFrontmatter(content);
  errors.push(...parsed.errors.map((error) => `${skillFile}: ${error}`));
  const metadata = parsed.data;

  for (const key of Object.keys(metadata)) {
    if (!ALLOWED_SKILL_KEYS.has(key)) {
      errors.push(`${skillFile}: unsupported frontmatter key "${key}"`);
    }
  }

  const expectedName = path.basename(skillDir);
  if (typeof metadata.name !== "string" || !SKILL_NAME_PATTERN.test(metadata.name)) {
    errors.push(`${skillFile}: name must be lowercase kebab-case`);
  } else if (metadata.name !== expectedName) {
    errors.push(`${skillFile}: name must match directory "${expectedName}"`);
  }
  if (
    typeof metadata.description !== "string" ||
    metadata.description.length === 0 ||
    metadata.description.length > 1024
  ) {
    errors.push(`${skillFile}: description must contain 1-1024 characters`);
  }
  if (metadata.metadata !== undefined) {
    if (!isPlainObject(metadata.metadata)) {
      errors.push(`${skillFile}: metadata must be a mapping`);
    } else {
      for (const [key, value] of Object.entries(metadata.metadata)) {
        if (typeof value !== "string" || value.length === 0) {
          errors.push(`${skillFile}: metadata.${key} must be a non-empty string`);
        }
      }
    }
  }

  const skillRoot = path.resolve(skillDir);
  for (const markdownFile of await listMarkdownFiles(skillDir)) {
    const markdown = await readFile(markdownFile, "utf8");
    for (const reference of localReferences(markdown)) {
      const withoutFragment = reference.split(/[?#]/, 1)[0];
      let decodedReference;
      try {
        decodedReference = decodeURIComponent(withoutFragment);
      } catch {
        errors.push(`${markdownFile}: invalid encoded reference "${reference}"`);
        continue;
      }
      const resolved = path.resolve(skillRoot, decodedReference);
      const relative = path.relative(skillRoot, resolved);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        errors.push(`${markdownFile}: reference "${reference}" escapes the skill directory`);
      } else if (!(await pathExists(resolved))) {
        errors.push(`${markdownFile}: referenced file "${reference}" does not exist`);
      }
    }
  }

  return errors;
}

export function validatePortableManifest(manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) return ["plugin.json must contain an object"];

  for (const field of Object.keys(manifest)) {
    if (!ALLOWED_PORTABLE_FIELDS.has(field)) {
      errors.push(`plugin.json: unsupported field "${field}"`);
    }
  }
  if (manifest.$schema !== AGENT_PLUGIN_SCHEMA) {
    errors.push(`plugin.json: $schema must be ${AGENT_PLUGIN_SCHEMA}`);
  }
  if (
    typeof manifest.name !== "string" ||
    manifest.name.length > 64 ||
    !PORTABLE_PLUGIN_NAME_PATTERN.test(manifest.name)
  ) {
    errors.push("plugin.json: invalid plugin name");
  }
  if (
    manifest.version !== undefined &&
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
      manifest.version,
    )
  ) {
    errors.push("plugin.json: version must use Semantic Versioning");
  }
  if (manifest.author !== undefined && !isPlainObject(manifest.author)) {
    errors.push("plugin.json: author must be an object");
  }
  if (manifest.keywords !== undefined && !Array.isArray(manifest.keywords)) {
    errors.push("plugin.json: keywords must be an array");
  }
  return errors;
}

async function readJson(root, relativePath, errors) {
  const absolutePath = path.join(root, ...relativePath.split("/"));
  try {
    return JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function requireEqual(errors, label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function validateDeepSeekBundle(packageJson, patchContent) {
  const errors = [];
  requireEqual(
    errors,
    "DeepSeek Harness dsh.bundle.patch",
    packageJson?.dsh?.bundle?.patch,
    "./cordis.patch.yml",
  );
  for (const requiredFile of ["skills", "cordis.patch.yml"]) {
    if (!Array.isArray(packageJson?.files) || !packageJson.files.includes(requiredFile)) {
      errors.push(`DeepSeek Harness package files must include "${requiredFile}"`);
    }
  }
  for (const fragment of [
    "name: '@deepseek-ai/dsh-skill-filesystem'",
    "providerName: fiveai-skills",
    "includeDefaultRoots: false",
    "bundledSkillDir: !!js",
    "new URL('skills/', baseUrl)",
  ]) {
    if (typeof patchContent !== "string" || !patchContent.includes(fragment)) {
      errors.push(`cordis.patch.yml: missing ${JSON.stringify(fragment)}`);
    }
  }
  return errors;
}

export function validateHostManifest(host, manifest, canonical) {
  const errors = [];
  if (!isPlainObject(manifest)) return [`${host} plugin manifest must contain an object`];
  for (const field of [
    "name",
    "version",
    "description",
    "homepage",
    "repository",
  ]) {
    requireEqual(errors, `${host} ${field}`, manifest[field], canonical?.[field]);
  }
  requireEqual(errors, `${host} publisher`, manifest.author?.name, canonical?.author?.name);
  requireEqual(errors, `${host} skills path`, manifest.skills, "./skills/");
  if (JSON.stringify(manifest.keywords) !== JSON.stringify(canonical?.keywords)) {
    errors.push(`${host} keywords: must match portable plugin.json`);
  }
  return errors;
}

export function validateMarketplace(
  relativePath,
  marketplace,
  sourceKind,
  expectedVersion,
) {
  const errors = [];
  if (!marketplace) return errors;
  requireEqual(errors, `${relativePath} name`, marketplace.name, MARKETPLACE_NAME);
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length !== 1) {
    errors.push(`${relativePath}: plugins must contain exactly one entry`);
    return errors;
  }
  const entry = marketplace.plugins[0];
  requireEqual(errors, `${relativePath} plugin name`, entry.name, PLUGIN_NAME);
  requireEqual(errors, `${relativePath} plugin version`, entry.version, expectedVersion);
  if (sourceKind === "codex") {
    requireEqual(errors, `${relativePath} source type`, entry.source?.source, "url");
    requireEqual(errors, `${relativePath} source URL`, entry.source?.url, "./");
    requireEqual(
      errors,
      `${relativePath} installation policy`,
      entry.policy?.installation,
      "AVAILABLE",
    );
    requireEqual(
      errors,
      `${relativePath} authentication policy`,
      entry.policy?.authentication,
      "ON_INSTALL",
    );
  } else {
    requireEqual(errors, `${relativePath} source`, entry.source, "./");
  }
  return errors;
}

export async function validateRepository(root) {
  const errors = [];
  const skillsDir = path.join(root, "skills");
  let skillEntries = [];
  try {
    skillEntries = (await readdir(skillsDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    errors.push(`skills/: ${error.message}`);
  }

  const skillNames = [];
  for (const entry of skillEntries) {
    const skillDir = path.join(skillsDir, entry.name);
    if (!(await pathExists(path.join(skillDir, "SKILL.md")))) {
      errors.push(`skills/${entry.name}: missing SKILL.md`);
      continue;
    }
    skillNames.push(entry.name);
    errors.push(...(await validateSkill(skillDir)));
  }
  if (skillNames.length === 0) errors.push("skills/: no skills discovered");

  const portable = await readJson(root, "plugin.json", errors);
  if (portable) errors.push(...validatePortableManifest(portable));

  const manifests = {
    codex: await readJson(root, ".codex-plugin/plugin.json", errors),
    claude: await readJson(root, ".claude-plugin/plugin.json", errors),
    codebuddy: await readJson(root, ".codebuddy-plugin/plugin.json", errors),
  };
  const packageJson = await readJson(root, "package.json", errors);
  let deepSeekPatch = null;
  try {
    deepSeekPatch = await readFile(path.join(root, "cordis.patch.yml"), "utf8");
  } catch (error) {
    errors.push(`cordis.patch.yml: ${error.message}`);
  }

  for (const [host, manifest] of Object.entries(manifests)) {
    if (!manifest) continue;
    errors.push(...validateHostManifest(host, manifest, portable));
  }
  if (portable) {
    requireEqual(errors, "portable plugin name", portable.name, PLUGIN_NAME);
    requireEqual(errors, "portable plugin version", portable.version, packageJson?.version);
    requireEqual(errors, "portable publisher", portable.author?.name, PUBLISHER);
    requireEqual(errors, "portable repository", portable.repository, REPOSITORY_URL);
  }
  if (packageJson) {
    requireEqual(errors, "package name", packageJson.name, PLUGIN_NAME);
    requireEqual(errors, "package version", packageJson.version, portable?.version);
    requireEqual(errors, "package private flag", packageJson.private, true);
    errors.push(...validateDeepSeekBundle(packageJson, deepSeekPatch));
  }

  const marketplaces = {
    codex: [
      ".agents/plugins/marketplace.json",
      await readJson(root, ".agents/plugins/marketplace.json", errors),
    ],
    cursor: [
      ".cursor-plugin/marketplace.json",
      await readJson(root, ".cursor-plugin/marketplace.json", errors),
    ],
    claude: [
      ".claude-plugin/marketplace.json",
      await readJson(root, ".claude-plugin/marketplace.json", errors),
    ],
    codebuddy: [
      ".codebuddy-plugin/marketplace.json",
      await readJson(root, ".codebuddy-plugin/marketplace.json", errors),
    ],
  };
  for (const [host, [relativePath, marketplace]] of Object.entries(marketplaces)) {
    errors.push(
      ...validateMarketplace(relativePath, marketplace, host, portable?.version),
    );
  }

  return { errors, skillNames };
}

async function main() {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  const result = await validateRepository(root);
  if (result.errors.length > 0) {
    console.error(`FiveAI plugin validation failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`FiveAI plugin validation passed (${result.skillNames.length} skills).`);
}

const isCli =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) await main();
