import fs from 'fs';
import { pathToFileURL } from 'url';

const [, , pluginPath, scenario] = process.argv;

if (!pluginPath || !['present', 'missing'].includes(scenario)) {
  console.error('Usage: node test-bootstrap-caching.mjs PLUGIN_PATH present|missing');
  process.exit(2);
}

let existsCount = 0;
let readCount = 0;

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;

fs.existsSync = function (...args) {
  if (isSuperpowersAgentPath(args[0])) {
    existsCount += 1;
  }
  return originalExistsSync.apply(this, args);
};

fs.readFileSync = function (...args) {
  if (isSuperpowersAgentPath(args[0])) {
    readCount += 1;
  }
  return originalReadFileSync.apply(this, args);
};

const mod = await import(pathToFileURL(pluginPath).href);
const plugin = await mod.SuperpowersPlugin({ client: {}, directory: '.' });

if (plugin['experimental.chat.messages.transform']) {
  fail('plugin should not inject bootstrap through experimental.chat.messages.transform');
}

const cleanConfig = {};
await plugin.config(cleanConfig);
const afterFirst = { existsCount, readCount };

const explicitDefaultConfig = { default_agent: 'build' };
await plugin.config(explicitDefaultConfig);
const afterSecond = { existsCount, readCount };

const result = {
  scenario,
  cleanDefaultAgent: cleanConfig.default_agent,
  explicitDefaultAgent: explicitDefaultConfig.default_agent,
  registeredAgent: cleanConfig.agent?.superpowers,
  explicitRegisteredAgent: explicitDefaultConfig.agent?.superpowers,
  firstReadCount: afterFirst.readCount,
  secondReadCount: afterSecond.readCount,
  firstExistsCount: afterFirst.existsCount,
  secondExistsCount: afterSecond.existsCount,
};

const failures = scenario === 'present'
  ? assertPresentAgent(result)
  : assertMissingAgent(result);

if (failures.length > 0) {
  console.error(JSON.stringify(result, null, 2));
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));

function isSuperpowersAgentPath(filePath) {
  return String(filePath).replaceAll('\\', '/').includes('agents/superpowers.md');
}

function assertPresentAgent(result) {
  const failures = [];
  if (result.cleanDefaultAgent !== 'superpowers') {
    failures.push(`expected clean config default_agent to be superpowers, got ${result.cleanDefaultAgent}`);
  }
  if (result.explicitDefaultAgent !== 'build') {
    failures.push(`expected explicit default_agent to be preserved, got ${result.explicitDefaultAgent}`);
  }
  if (!result.registeredAgent) {
    failures.push('expected config.agent.superpowers to be registered');
  } else {
    if (result.registeredAgent.mode !== 'primary') {
      failures.push(`expected mode primary, got ${result.registeredAgent.mode}`);
    }
    if (!result.registeredAgent.description) {
      failures.push('expected agent description');
    }
    if (!result.registeredAgent.prompt?.includes('If you think there is even a 1% chance a skill might apply')) {
      failures.push('expected migrated bootstrap prompt text in agent prompt');
    }
  }
  if (!result.explicitRegisteredAgent) {
    failures.push('expected superpowers agent to be registered even when default_agent is explicit');
  }
  if (result.firstReadCount !== 1) {
    failures.push(`expected first config load to read agent prompt once, got ${result.firstReadCount}`);
  }
  if (result.secondReadCount !== result.firstReadCount) {
    failures.push(`expected cached second config load to do no additional reads, got ${result.secondReadCount - result.firstReadCount}`);
  }
  if (result.secondExistsCount !== result.firstExistsCount) {
    failures.push(`expected cached second config load to do no additional exists checks, got ${result.secondExistsCount - result.firstExistsCount}`);
  }
  return failures;
}

function assertMissingAgent(result) {
  const failures = [];
  if (result.registeredAgent) {
    failures.push('expected no registered agent when prompt file is missing');
  }
  if (result.cleanDefaultAgent === 'superpowers') {
    failures.push('expected missing prompt not to set default_agent to superpowers');
  }
  if (result.firstReadCount !== 0 || result.secondReadCount !== 0) {
    failures.push(`expected missing agent file to avoid reads, got ${result.secondReadCount}`);
  }
  if (result.firstExistsCount < 1) {
    failures.push('expected first config load to check whether agent prompt exists');
  }
  if (result.secondExistsCount !== result.firstExistsCount) {
    failures.push(`expected missing-file result to be cached, got ${result.secondExistsCount - result.firstExistsCount} extra exists checks`);
  }
  return failures;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
