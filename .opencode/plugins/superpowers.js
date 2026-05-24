/**
 * Superpowers plugin for OpenCode.ai
 *
 * Auto-registers the superpowers primary agent and skills directory via the
 * config hook (no symlinks needed).
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple frontmatter extraction (avoid dependency on skills-core for bootstrap)
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// Module-level cache for the agent prompt. The prompt file does not change
// during a session, so reading + parsing it once eliminates redundant disk
// work on each config load. See #1202 for the original bootstrap analysis.
let _agentPromptCache = undefined; // undefined = not yet loaded, null = file missing

export const SuperpowersPlugin = async ({ client, directory }) => {
  const superpowersSkillsDir = path.resolve(__dirname, '../../skills');
  const superpowersAgentPath = path.resolve(__dirname, '../../agents/superpowers.md');

  // Helper to load the superpowers agent prompt (cached after first call)
  const getSuperpowersAgent = () => {
    if (_agentPromptCache !== undefined) return _agentPromptCache;

    if (!fs.existsSync(superpowersAgentPath)) {
      _agentPromptCache = null;
      return null;
    }

    const fullContent = fs.readFileSync(superpowersAgentPath, 'utf8');
    const { frontmatter, content } = extractAndStripFrontmatter(fullContent);

    _agentPromptCache = {
      description: frontmatter.description || 'Activates Superpowers workflows and requires relevant skill invocation before responses or actions.',
      mode: frontmatter.mode || 'primary',
      prompt: content.trimStart(),
    };

    return _agentPromptCache;
  };

  return {
    // Inject skills path into live config so OpenCode discovers superpowers skills
    // without requiring manual symlinks or config file edits.
    // This works because Config.get() returns a cached singleton — modifications
    // here are visible when skills are lazily discovered later.
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }

      const superpowersAgent = getSuperpowersAgent();
      if (superpowersAgent) {
        config.agent = config.agent || {};
        config.agent.superpowers = {
          ...config.agent.superpowers,
          ...superpowersAgent,
        };

        if (!config.default_agent) {
          config.default_agent = 'superpowers';
        }
      }
    }
  };
};
