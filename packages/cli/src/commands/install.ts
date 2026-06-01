import {
  existsSync,
  mkdirSync,
  cpSync,
  rmSync,
  symlinkSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
import { Command, Option } from "clipanion";
import {
  detectProvider,
  isLocalPath,
  getProvider,
  evaluateSkillDirectory,
  SkillScanner,
  formatSummary,
  Severity,
  WellKnownProvider,
  AgentsMdParser,
  AgentsMdGenerator,
  SkillsShRegistry,
  TrustScorer,
  readSkillContent,
  computeSkillChecksum,
  addSkillToLock,
} from "@skillkit/core";
import type { SkillsShStats } from "@skillkit/core";
import type { SkillMetadata, GitProvider, AgentType } from "@skillkit/core";
import { isPathInside } from "@skillkit/core";
import { getAdapter, detectAgent, getAllAdapters } from "@skillkit/agents";
import { getInstallDir, saveSkillMetadata, formatCount } from "../helpers.js";
import skillsData from "../../../../marketplace/skills.json" with { type: "json" };
import {
  welcome,
  colors,
  symbols,
  formatAgent,
  getAgentIcon,
  isCancel,
  spinner,
  quickAgentSelect,
  quickSkillSelect,
  selectInstallMethod,
  confirm,
  outro,
  cancel,
  step,
  success,
  error,
  warn,
  showInstallSummary,
  showNextSteps,
  saveLastAgents,
  getLastAgents,
  formatQualityBadge,
  getQualityGradeFromScore,
  formatTrustBadge,
  type InstallResult,
} from "../onboarding/index.js";

export class InstallCommand extends Command {
  static override paths = [["install"], ["i"], ["add"]];

  static override usage = Command.Usage({
    description:
      "Install skills from GitHub, GitLab, Bitbucket, skills.sh, or local path",
    examples: [
      ["Install from GitHub", "$0 install owner/repo"],
      ["Install from skills.sh", "$0 install skills.sh/owner/repo/skill-name"],
      ["Install from GitLab", "$0 install gitlab:owner/repo"],
      ["Install from Bitbucket", "$0 install bitbucket:owner/repo"],
      ["Install specific skill", "$0 install owner/repo --skill=pdf"],
      [
        "Install multiple skills (CI/CD)",
        "$0 install owner/repo --skills=pdf,xlsx",
      ],
      ["Install all skills non-interactively", "$0 install owner/repo --all"],
      ["Install from local path", "$0 install ./my-skills"],
      ["Install globally", "$0 install owner/repo --global"],
      ["List available skills", "$0 install owner/repo --list"],
      [
        "Install to specific agents",
        "$0 install owner/repo --agent claude-code --agent cursor",
      ],
    ],
  });

  source = Option.String({ required: true });

  skills = Option.String("--skills,--skill,-s", {
    description: "Comma-separated list of skills to install (non-interactive)",
  });

  all = Option.Boolean("--all,-a", false, {
    description: "Install all discovered skills (non-interactive)",
  });

  yes = Option.Boolean("--yes,-y", false, {
    description: "Skip confirmation prompts",
  });

  global = Option.Boolean("--global,-g", false, {
    description: "Install to global skills directory",
  });

  force = Option.Boolean("--force,-f", false, {
    description: "Overwrite existing skills",
  });

  provider = Option.String("--provider,-p", {
    description: "Force specific provider (github, gitlab, bitbucket)",
  });

  list = Option.Boolean("--list,-l", false, {
    description: "List available skills without installing",
  });

  agent = Option.Array("--agent", {
    description: "Target specific agents (can specify multiple)",
  });

  quiet = Option.Boolean("--quiet,-q", false, {
    description: "Minimal output (no logo)",
  });

  scan = Option.Boolean("--scan", true, {
    description: "Run security scan before installing (default: true)",
  });

  json = Option.Boolean("--json", false, {
    description: "Output as JSON",
  });

  async execute(): Promise<number> {
    const isInteractive =
      process.stdin.isTTY && !this.skills && !this.all && !this.yes && !this.json;
    const s = this.json ? { start: () => {}, stop: () => {}, message: () => {} } : spinner();
    let cloneResult: Awaited<ReturnType<typeof this.resolveSource>>["cloneResult"] = null;

    try {
      if (process.stdin.isTTY && !this.quiet && !this.json) {
        welcome();
      }

      const resolved = await this.resolveSource(s);
      if (!resolved.providerAdapter || !resolved.cloneResult) return 1;
      const providerAdapter = resolved.providerAdapter;
      cloneResult = resolved.cloneResult;

      const discoveredSkills = cloneResult.discoveredSkills || [];

      if (this.list) {
        return this.listSkills(discoveredSkills, cloneResult);
      }

      const skillSelection = await this.selectSkills(discoveredSkills, isInteractive);
      if (!skillSelection.skills) return skillSelection.exitCode;
      const skillsToInstall = skillSelection.skills;

      const agentSelection = await this.selectAgents(isInteractive);
      if (!agentSelection.agents) return agentSelection.exitCode;
      const targetAgents = agentSelection.agents;

      const installMethod = await this.selectMethod(isInteractive, targetAgents);
      if (!installMethod) return 0;

      await this.runSecurityScan(skillsToInstall, cloneResult);

      if (isInteractive && !this.yes) {
        const confirmed = await this.confirmInstall(skillsToInstall, targetAgents);
        if (!confirmed) return 0;
      }

      const installResults = await this.performInstall(
        skillsToInstall, targetAgents, installMethod, providerAdapter, cloneResult, s,
      );

      this.updateAgentsMd(installResults.length);
      await this.showResults(installResults, targetAgents, providerAdapter, isInteractive);

      return 0;
    } catch (err) {
      if (this.json) {
        console.log(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
      } else {
        s.stop(colors.error("Installation failed"));
        console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      }
      return 1;
    } finally {
      if (cloneResult) this.cleanupTemp(cloneResult);
    }
  }

  private async resolveSource(s: ReturnType<typeof spinner>): Promise<{
    providerAdapter: ReturnType<typeof detectProvider> | null;
    cloneResult: {
      success: boolean;
      path?: string;
      tempRoot?: string;
      error?: string;
      skills?: string[];
      discoveredSkills?: Array<{ name: string; dirName: string; path: string }>;
    } | null;
  }> {
    if (!detectProvider(this.source) && !this.provider && !this.source.startsWith("http") && !this.source.startsWith("./") && !this.source.startsWith("~") && !this.source.startsWith("/")) {
      const match = (skillsData.skills || []).find(
        (e: { name?: string; id?: string; source?: string }) =>
          (e.name && e.name.toLowerCase() === this.source.toLowerCase()) ||
          (e.id && e.id.toLowerCase() === this.source.toLowerCase()),
      );
      if (match?.source) {
        console.log(colors.muted(`Resolved "${this.source}" to ${match.source} via marketplace catalog`));
        this.source = match.source;
      }
    }

    let providerAdapter = detectProvider(this.source);
    let result: {
      success: boolean;
      path?: string;
      tempRoot?: string;
      error?: string;
      skills?: string[];
      discoveredSkills?: Array<{ name: string; dirName: string; path: string }>;
    } | null = null;

    const isUrl = this.source.startsWith("http://") || this.source.startsWith("https://");
    if (isUrl && !this.provider && !providerAdapter) {
      s.start("Checking for well-known skills...");
      const wellKnown = new WellKnownProvider();
      const discovery = await wellKnown.discoverFromUrl(this.source);
      if (discovery.success) {
        s.stop(`Found ${discovery.skills?.length || 0} skill(s) via well-known discovery`);
        providerAdapter = wellKnown;
        result = discovery;
      } else {
        s.stop("No well-known skills found");
        warn(`No well-known skills found at ${this.source}`);
        console.log(colors.muted("You can save this URL as a skill instead:"));
        console.log(colors.muted(`  skillkit save ${this.source}`));
        return { providerAdapter: null, cloneResult: null };
      }
    }

    if (this.provider) {
      providerAdapter = getProvider(this.provider as GitProvider);
    }

    if (!providerAdapter) {
      error(`Could not detect provider for: ${this.source}`);
      console.log(colors.muted("Use --provider flag or specify source as:"));
      console.log(colors.muted("  GitHub:     owner/repo or https://github.com/owner/repo"));
      console.log(colors.muted("  Skills.sh:  skills.sh/owner/repo/skill-name"));
      console.log(colors.muted("  GitLab:     gitlab:owner/repo or https://gitlab.com/owner/repo"));
      console.log(colors.muted("  Bitbucket:  bitbucket:owner/repo"));
      console.log(colors.muted("  Local:      ./path or ~/path"));
      return { providerAdapter: null, cloneResult: null };
    }

    if (!result) {
      s.start(`Cloning from ${providerAdapter.name}...`);
      result = await providerAdapter.clone(this.source, "", {
        depth: 1,
        onProgress: (msg) => {
          s.message(`${providerAdapter!.name} — ${msg}`);
        },
      });

      if (!result.success || !result.path) {
        s.stop(colors.error(result.error || "Failed to fetch source"));
        return { providerAdapter: null, cloneResult: null };
      }

      s.stop(`Found ${result.skills?.length || 0} skill(s)`);
    }

    return { providerAdapter, cloneResult: result };
  }

  private listSkills(
    discoveredSkills: Array<{ name: string; path: string }>,
    cloneResult: { tempRoot?: string; path?: string },
  ): number {
    if (discoveredSkills.length === 0) {
      warn("No skills found in this repository");
    } else {
      console.log("");
      console.log(colors.bold("Available skills:"));
      console.log("");
      for (const skill of discoveredSkills) {
        const quality = evaluateSkillDirectory(skill.path);
        const qualityBadge = quality ? ` ${formatQualityBadge(quality.overall)}` : "";
        console.log(`  ${colors.success(symbols.stepActive)} ${colors.primary(skill.name)}${qualityBadge}`);
      }
      console.log("");
      console.log(colors.muted(`Total: ${discoveredSkills.length} skill(s)`));
      console.log(colors.muted("To install: skillkit install <source> --skill=name"));
    }

    this.cleanupTemp(cloneResult);
    return 0;
  }

  private async selectSkills(
    discoveredSkills: Array<{ name: string; dirName: string; path: string }>,
    isInteractive: boolean,
  ): Promise<{ skills: Array<{ name: string; dirName: string; path: string }> | null; exitCode: number }> {
    if (this.skills) {
      const requestedSkills = this.skills.split(",").map((s) => s.trim());
      const available = discoveredSkills.map((s) => s.name);
      const notFound = requestedSkills.filter((s) => !available.includes(s));

      if (notFound.length > 0) {
        error(`Skills not found: ${notFound.join(", ")}`);
        console.log(colors.muted(`Available: ${available.join(", ")}`));
        return { skills: null, exitCode: 1 };
      }

      return { skills: discoveredSkills.filter((s) => requestedSkills.includes(s.name)), exitCode: 0 };
    }

    if (this.all || this.yes) {
      return { skills: discoveredSkills, exitCode: 0 };
    }

    if (isInteractive && discoveredSkills.length > 1) {
      step(`Source: ${colors.cyan(this.source)}`);

      const skillResult = await quickSkillSelect({
        skills: discoveredSkills.map((s) => ({ name: s.name })),
      });

      if (isCancel(skillResult)) {
        cancel("Installation cancelled");
        return { skills: null, exitCode: 0 };
      }

      const selected = (skillResult as { skills: string[] }).skills;
      const result = discoveredSkills.filter((s) => selected.includes(s.name));
      if (result.length === 0) {
        warn("No skills to install");
        return { skills: null, exitCode: 0 };
      }
      return { skills: result, exitCode: 0 };
    }

    return { skills: discoveredSkills, exitCode: 0 };
  }

  private async selectAgents(isInteractive: boolean): Promise<{ agents: AgentType[] | null; exitCode: number }> {
    if (this.agent && this.agent.length > 0) {
      const allValid = getAllAdapters().map((a) => a.type);
      const invalid = this.agent.filter((a) => !allValid.includes(a as AgentType));
      if (invalid.length > 0) {
        error(`Unknown agent(s): ${invalid.join(", ")}`);
        console.log(colors.muted(`Available: ${allValid.join(", ")}`));
        return { agents: null, exitCode: 1 };
      }
      return { agents: this.agent as AgentType[], exitCode: 0 };
    }

    if (isInteractive) {
      const allAgentTypes = getAllAdapters().map((a) => a.type);
      const lastAgents = getLastAgents();
      const rawDetected = await detectAgent().catch(() => undefined);
      const detectedAgent = rawDetected && rawDetected !== 'universal' ? rawDetected : undefined;

      step(`Detected ${allAgentTypes.length} agents`);

      const agentResult = await quickAgentSelect({
        message: "Install to",
        agents: allAgentTypes,
        lastSelected: lastAgents,
        detected: detectedAgent,
      });

      if (isCancel(agentResult)) {
        cancel("Installation cancelled");
        return { agents: null, exitCode: 0 };
      }

      const targetAgents = (agentResult as { agents: string[] }).agents as AgentType[];
      if (targetAgents.length === 0) {
        cancel("Installation cancelled");
        return { agents: null, exitCode: 0 };
      }
      saveLastAgents(targetAgents);
      return { agents: targetAgents, exitCode: 0 };
    }

    const detectedAgent = await detectAgent();
    return { agents: [detectedAgent], exitCode: 0 };
  }

  private async selectMethod(
    isInteractive: boolean,
    targetAgents: AgentType[],
  ): Promise<"symlink" | "copy" | null> {
    if (isInteractive && targetAgents.length > 1) {
      const methodResult = await selectInstallMethod({});

      if (isCancel(methodResult)) {
        cancel("Installation cancelled");
        return null;
      }

      return methodResult as "symlink" | "copy";
    }
    return "copy";
  }

  private async runSecurityScan(
    skillsToInstall: Array<{ name: string; path: string }>,
    cloneResult: { tempRoot?: string; path?: string },
  ): Promise<void> {
    if (!this.scan) return;

    const scanner = new SkillScanner({ failOnSeverity: Severity.HIGH });
    for (const skill of skillsToInstall) {
      const scanResult = await scanner.scan(skill.path);

      if (scanResult.verdict === "fail" && !this.force) {
        error(`Security scan FAILED for "${skill.name}"`);
        console.log(formatSummary(scanResult));
        console.log(colors.muted("Use --force to install anyway, or --no-scan to skip scanning"));
        this.cleanupTemp(cloneResult);
        throw new Error(`Security scan failed for ${skill.name}`);
      }

      if (scanResult.verdict === "warn" && !this.quiet) {
        warn(`Security warnings for "${skill.name}" (${scanResult.stats.medium} medium, ${scanResult.stats.low} low)`);
      }
    }
  }

  private async confirmInstall(
    skillsToInstall: Array<{ name: string; path: string }>,
    targetAgents: AgentType[],
  ): Promise<boolean> {
    console.log("");

    const lowQualitySkills = skillsToInstall
      .map((skill) => {
        const quality = evaluateSkillDirectory(skill.path);
        return quality && quality.overall < 60
          ? { name: skill.name, score: quality.overall, warnings: quality.warnings.slice(0, 2) }
          : null;
      })
      .filter(Boolean) as Array<{ name: string; score: number; warnings: string[] }>;

    if (lowQualitySkills.length > 0) {
      console.log(
        colors.warning(`${symbols.warning} Warning: ${lowQualitySkills.length} skill(s) have low quality scores (< 60)`),
      );
      for (const lq of lowQualitySkills) {
        const grade = getQualityGradeFromScore(lq.score);
        const warningText = lq.warnings.length > 0 ? ` - ${lq.warnings.join(", ")}` : "";
        console.log(colors.muted(`    - ${lq.name} [${grade}]${warningText}`));
      }
      console.log("");
    }

    const officialSources = [
      "anthropics/skills",
      "vercel-labs/agent-skills",
      "expo/skills",
      "remotion-dev/skills",
      "supabase/agent-skills",
      "stripe/ai",
    ];
    const sourceProvider = detectProvider(this.source);
    const parsedSource = sourceProvider?.parseSource(this.source);
    const normalizedSource = parsedSource ? `${parsedSource.owner}/${parsedSource.repo}` : this.source;
    const isOfficial = sourceProvider?.type === "github" && officialSources.includes(normalizedSource);

    const scorer = new TrustScorer();
    for (const skill of skillsToInstall) {
      const content = readSkillContent(skill.path);
      if (content) {
        const result = scorer.score(content);
        const badge = formatTrustBadge({
          isOfficial,
          officialSource: isOfficial ? this.source : undefined,
          grade: result.grade,
          score: result.score,
          source: this.source,
        });
        console.log(`  ${colors.primary(skill.name)}: ${badge}`);
      }
    }
    console.log("");

    const agentDisplay =
      targetAgents.length <= 3
        ? targetAgents.map(formatAgent).join(", ")
        : `${targetAgents.slice(0, 2).map(formatAgent).join(", ")} +${targetAgents.length - 2} more`;

    const confirmResult = await confirm({
      message: `Install ${skillsToInstall.length} skill(s) to ${agentDisplay}?`,
      initialValue: true,
    });

    if (isCancel(confirmResult) || !confirmResult) {
      cancel("Installation cancelled");
      return false;
    }
    return true;
  }

  private async performInstall(
    skillsToInstall: Array<{ name: string; dirName: string; path: string }>,
    targetAgents: AgentType[],
    installMethod: "symlink" | "copy",
    providerAdapter: ReturnType<typeof detectProvider>,
    cloneResult: { tempRoot?: string; path?: string },
    s: ReturnType<typeof spinner>,
  ): Promise<InstallResult[]> {
    const installResults: InstallResult[] = [];

    for (const skill of skillsToInstall) {
      const skillName = skill.name;
      const sourcePath = skill.path;
      const installedAgents: string[] = [];
      let primaryPath: string | null = null;

      for (const agentType of targetAgents) {
        const adapter = getAdapter(agentType);
        const installDir = getInstallDir(this.global, agentType);

        if (!existsSync(installDir)) {
          mkdirSync(installDir, { recursive: true });
        }

        let isStandaloneFile: boolean;
        try {
          isStandaloneFile = statSync(sourcePath).isFile();
        } catch {
          if (!this.quiet) {
            warn(`Skipping ${skillName} for ${adapter.name} (source not accessible)`);
          }
          continue;
        }
        const targetPath = isStandaloneFile
          ? join(installDir, skillName.endsWith(".md") ? skillName : `${skillName}.md`)
          : join(installDir, skillName);

        if (existsSync(targetPath) && !this.force) {
          if (!this.quiet) {
            warn(`Skipping ${skillName} for ${adapter.name} (already exists, use --force)`);
          }
          continue;
        }

        const securityRoot = cloneResult.tempRoot || cloneResult.path || "";
        if (!securityRoot || !isPathInside(sourcePath, securityRoot)) {
          error(`Skipping ${skillName} (path traversal detected)`);
          continue;
        }

        const isSymlinkMode = installMethod === "symlink" && targetAgents.length > 1;
        const useSymlink = isSymlinkMode && primaryPath !== null;

        s.start(`Installing ${skillName} to ${adapter.name}${useSymlink ? " (symlink)" : ""}...`);

        try {
          if (existsSync(targetPath)) {
            rmSync(targetPath, { recursive: true, force: true });
          }

          if (useSymlink && primaryPath) {
            symlinkSync(primaryPath, targetPath, isStandaloneFile ? "file" : "dir");
          } else {
            if (isStandaloneFile) {
              cpSync(sourcePath, targetPath);
            } else {
              cpSync(sourcePath, targetPath, { recursive: true, dereference: true });
            }
            if (isSymlinkMode && primaryPath === null) {
              primaryPath = targetPath;
            }

            if (!isStandaloneFile) {
              const packageJsonPath = join(targetPath, "package.json");
              if (existsSync(packageJsonPath)) {
                s.stop(`Installed ${skillName} to ${adapter.name}`);
                s.start(`Installing npm dependencies for ${skillName}...`);
                try {
                  await execFileAsync("npm", ["install", "--omit=dev"], { cwd: targetPath });
                  s.stop(`Installed dependencies for ${skillName}`);
                } catch {
                  s.stop(colors.warning(`Dependencies failed for ${skillName}`));
                  console.log(colors.muted("Run manually: npm install in " + targetPath));
                }
                s.start(`Finishing ${skillName} installation...`);
              }
            }
          }

          const metadata: SkillMetadata = {
            name: skillName,
            description: "",
            source: this.source,
            sourceType: providerAdapter!.type,
            subpath: skillName,
            installedAt: new Date().toISOString(),
            enabled: true,
          };
          metadata.checksum = computeSkillChecksum(targetPath);
          saveSkillMetadata(targetPath, metadata);

          installedAgents.push(agentType);
          s.stop(`Installed ${skillName} to ${adapter.name}${useSymlink ? " (symlink)" : ""}`);
        } catch (err) {
          s.stop(colors.error(`Failed to install ${skillName} to ${adapter.name}`));
          console.log(colors.muted(err instanceof Error ? err.message : String(err)));
        }
      }

      if (installedAgents.length > 0) {
        const firstAgentInstallDir = getInstallDir(this.global, installedAgents[0] as AgentType);
        const isStandalone = existsSync(join(firstAgentInstallDir, skillName.endsWith(".md") ? skillName : `${skillName}.md`));
        const actualPath = isStandalone
          ? join(firstAgentInstallDir, skillName.endsWith(".md") ? skillName : `${skillName}.md`)
          : join(firstAgentInstallDir, skillName);
        addSkillToLock(skillName, {
          source: this.source,
          sourceType: providerAdapter!.type,
          installedAt: new Date().toISOString(),
          checksum: computeSkillChecksum(actualPath),
          agents: installedAgents,
          path: actualPath,
        });
        installResults.push({
          skillName,
          method: installMethod,
          agents: installedAgents,
          path: actualPath,
        });
      }
    }

    return installResults;
  }

  private cleanupTemp(cloneResult: { tempRoot?: string; path?: string }): void {
    const cleanupPath = cloneResult.tempRoot || cloneResult.path;
    if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
      rmSync(cleanupPath, { recursive: true, force: true });
    }
  }

  private updateAgentsMd(totalInstalled: number): void {
    if (totalInstalled === 0) return;
    try {
      const agentsMdPath = join(process.cwd(), "AGENTS.md");
      if (existsSync(agentsMdPath)) {
        const parser = new AgentsMdParser();
        const existing = readFileSync(agentsMdPath, "utf-8");
        if (parser.hasManagedSections(existing)) {
          const gen = new AgentsMdGenerator({ projectPath: process.cwd() });
          const genResult = gen.generate();
          const updated = parser.updateManagedSections(
            existing,
            genResult.sections.filter((s) => s.managed),
          );
          writeFileSync(agentsMdPath, updated, "utf-8");
        }
      }
    } catch {
      warn("Failed to update AGENTS.md");
    }
  }

  private async showResults(
    installResults: InstallResult[],
    targetAgents: AgentType[],
    providerAdapter: ReturnType<typeof detectProvider>,
    isInteractive: boolean,
  ): Promise<void> {
    if (this.json) {
      console.log(JSON.stringify({
        success: true,
        installed: installResults.map((r) => r.skillName),
        agents: targetAgents,
        total: installResults.length,
      }));
      return;
    }

    if (installResults.length > 0) {
      if (isInteractive) {
        showInstallSummary({
          totalSkills: installResults.length,
          totalAgents: targetAgents.length,
          results: installResults,
          source: this.source,
        });

        await this.showSkillsShStats(
          installResults.map((r) => r.skillName),
          providerAdapter!,
        );

        outro("Installation complete!");

        if (!this.yes) {
          showNextSteps({
            skillNames: installResults.map((r) => r.skillName),
            agentTypes: targetAgents,
            syncNeeded: true,
          });
          this.showProTips(installResults.map((r) => r.skillName));
        }
      } else {
        success(`Installed ${installResults.length} skill(s) to ${targetAgents.length} agent(s)`);
        for (const r of installResults) {
          console.log(
            colors.muted(`  ${symbols.success} ${r.skillName} ${symbols.arrowRight} ${r.agents.map(getAgentIcon).join(" ")}`),
          );
        }
        console.log("");
        console.log(colors.muted("Run `skillkit sync` to update agent configs"));
      }
    } else {
      warn("No skills were installed");
    }
  }

  private async showSkillsShStats(
    skillNames: string[],
    provider: {
      type: string;
      parseSource: (s: string) => { owner: string; repo: string } | null;
    },
  ): Promise<void> {
    try {
      if (provider.type === "local") return;
      const parsed = provider.parseSource(this.source);
      if (!parsed) return;

      const registry = new SkillsShRegistry();
      const statsResults: SkillsShStats[] = [];

      for (const name of skillNames) {
        const stats = await registry.getSkillStats(
          parsed.owner,
          parsed.repo,
          name,
        );
        if (stats) statsResults.push(stats);
      }

      if (statsResults.length > 0) {
        console.log("");
        console.log(colors.bold("Skills.sh Popularity:"));
        for (const s of statsResults) {
          const rank =
            s.rank <= 10
              ? colors.success(`#${s.rank}`)
              : colors.muted(`#${s.rank}`);
          const installs = s.installs > 0 ? formatCount(s.installs) : "n/a";
          console.log(
            `  ${rank} ${colors.primary(s.skillName)} ${colors.muted(`(${installs} installs)`)}`,
          );
        }
      }
    } catch {
      // Non-critical, silently skip
    }
  }

  private showProTips(skillNames: string[]): void {
    const tips = [
      `Translate to any agent format: ${colors.bold(`skillkit translate ${skillNames[0] || "skill-name"} --to cursor`)}`,
      `Get AI recommendations: ${colors.bold("skillkit recommend")}`,
      `Score quality: ${colors.bold(`skillkit evaluate ${skillNames[0] || "skill-name"}`)}`,
      `Browse all skills: ${colors.bold("skillkit find --top")}`,
    ];

    const tip = tips[Math.floor(Math.random() * tips.length)];
    console.log("");
    console.log(colors.muted(`Pro tip: ${tip}`));
  }
}
