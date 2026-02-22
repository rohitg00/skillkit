import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { GitProviderAdapter, CloneOptions } from "./base.js";
import type { GitProvider, CloneResult } from "../types.js";
import { discoverSkills } from "../skills.js";

/**
 * Resolves `skills.sh/owner/repo/skill` references to their underlying
 * GitHub repos and clones them the same way the GitHubProvider does.
 */
export class SkillsShProvider implements GitProviderAdapter {
  readonly type: GitProvider = "skills-sh";
  readonly name = "Skills.sh";
  readonly baseUrl = "https://skills.sh";

  parseSource(
    source: string,
  ): { owner: string; repo: string; subpath?: string } | null {
    const cleaned = source
      .replace(/^https?:\/\//, "")
      .replace(/^skills\.sh\//, "");

    if (!this.isSkillsShSource(source)) return null;

    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    return {
      owner: parts[0],
      repo: parts[1],
      subpath: parts.length > 2 ? parts.slice(2).join("/") : undefined,
    };
  }

  matches(source: string): boolean {
    return this.isSkillsShSource(source);
  }

  getCloneUrl(owner: string, repo: string): string {
    return `https://github.com/${owner}/${repo}.git`;
  }

  getSshUrl(owner: string, repo: string): string {
    return `git@github.com:${owner}/${repo}.git`;
  }

  async clone(
    source: string,
    _targetDir: string,
    options: CloneOptions = {},
  ): Promise<CloneResult> {
    const parsed = this.parseSource(source);
    if (!parsed) {
      return { success: false, error: `Invalid skills.sh source: ${source}` };
    }

    const { owner, repo, subpath } = parsed;
    const cloneUrl = options.ssh
      ? this.getSshUrl(owner, repo)
      : this.getCloneUrl(owner, repo);

    const tempDir = join(tmpdir(), `skillkit-skillssh-${randomUUID()}`);

    try {
      const args = ["clone"];
      if (options.depth) {
        args.push("--depth", String(options.depth));
      }
      if (options.branch) {
        args.push("--branch", options.branch);
      }
      args.push(cloneUrl, tempDir);

      execFileSync("git", args, {
        stdio: ["pipe", "pipe", "pipe"],
        encoding: "utf-8",
      });

      const searchDir = subpath ? join(tempDir, subpath) : tempDir;

      if (!resolve(searchDir).startsWith(resolve(tempDir))) {
        rmSync(tempDir, { recursive: true, force: true });
        return {
          success: false,
          error: `Invalid subpath in source: ${source}`,
        };
      }

      const skills = discoverSkills(searchDir);

      return {
        success: true,
        path: searchDir,
        tempRoot: tempDir,
        skills: skills.map((s) => s.name),
        discoveredSkills: skills.map((s) => ({
          name: s.name,
          dirName: basename(s.path),
          path: s.path,
        })),
      };
    } catch (error) {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }

      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Failed to clone: ${message}` };
    }
  }

  private isSkillsShSource(source: string): boolean {
    return (
      source.startsWith("skills.sh/") ||
      source.startsWith("https://skills.sh/") ||
      source.startsWith("http://skills.sh/")
    );
  }
}
