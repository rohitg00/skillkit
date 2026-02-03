#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Cli, Builtins } from 'clipanion';
import {
  InstallCommand,
  SyncCommand,
  ReadCommand,
  ListCommand,
  EnableCommand,
  DisableCommand,
  UpdateCommand,
  RemoveCommand,
  InitCommand,
  ValidateCommand,
  FixCommand,
  CreateCommand,
  UICommand,
  TranslateCommand,
  ContextCommand,
  RecommendCommand,
  StatusCommand,
  PauseCommand,
  ResumeCommand,
  WorkflowRunCommand,
  WorkflowListCommand,
  WorkflowCreateCommand,
  WorkflowPipelineCommand,
  WorkflowPipelineListCommand,
  RunCommand,
  TestCommand,
  MarketplaceCommand,
  MemoryCommand,
  SettingsCommand,
  CICDCommand,
  TeamCommand,
  PluginCommand,
  MethodologyCommand,
  HookCommand,
  HookTemplateListCommand,
  HookTemplateApplyCommand,
  HookTemplateShowCommand,
  PlanCommand,
  CommandCmd,
  CommandAvailableCommand,
  CommandInstallCommand,
  AICommand,
  AuditCommand,
  PublishCommand,
  PublishSubmitCommand,
  AgentCommand,
  AgentListCommand,
  AgentShowCommand,
  AgentCreateCommand,
  AgentFromSkillCommand,
  AgentTranslateCommand,
  AgentSyncCommand,
  AgentValidateCommand,
  AgentInstallCommand,
  AgentAvailableCommand,
  CheckCommand,
  FindCommand,
  ManifestCommand,
  ManifestInitCommand,
  ManifestAddCommand,
  ManifestRemoveCommand,
  ManifestInstallCommand,
  ManifestGenerateCommand,
  PrimerCommand,
  MeshCommand,
  MessageCommand,
  LearnCommand,
  PatternStatusCommand,
  PatternFeedbackCommand,
  PatternApproveCommand,
  PatternRejectCommand,
  PatternExportCommand,
  PatternImportCommand,
  PatternClusterCommand,
  SessionCommand,
  SessionStatusCommand,
  SessionStartCommand,
  SessionLoadCommand,
  SessionListCommand,
  SessionNoteCommand,
  SessionCompleteCommand,
  SessionInProgressCommand,
  ProfileCommand,
  ProfileListCommand,
  ProfileCreateCommand,
  ProfileRemoveCommand,
  GuidelineCommand,
  GuidelineListCommand,
  GuidelineShowCommand,
  GuidelineEnableCommand,
  GuidelineDisableCommand,
  GuidelineCreateCommand,
  GuidelineRemoveCommand,
  TreeCommand,
  QuickCommand,
  SkillMdValidateCommand,
  SkillMdInitCommand,
  SkillMdCheckCommand,
  ServeCommand,
} from '@skillkit/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version || '1.2.0';

const cli = new Cli({
  binaryLabel: 'skillkit',
  binaryName: 'skillkit',
  binaryVersion: version,
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.register(InstallCommand);
cli.register(SyncCommand);
cli.register(ReadCommand);
cli.register(ListCommand);
cli.register(EnableCommand);
cli.register(DisableCommand);
cli.register(UpdateCommand);
cli.register(RemoveCommand);
cli.register(InitCommand);
cli.register(ValidateCommand);
cli.register(FixCommand);
cli.register(CreateCommand);
cli.register(UICommand);
cli.register(TranslateCommand);
cli.register(ContextCommand);
cli.register(RecommendCommand);
cli.register(StatusCommand);
cli.register(PauseCommand);
cli.register(ResumeCommand);
cli.register(WorkflowRunCommand);
cli.register(WorkflowListCommand);
cli.register(WorkflowCreateCommand);
cli.register(RunCommand);
cli.register(TestCommand);
cli.register(MarketplaceCommand);
cli.register(MemoryCommand);
cli.register(SettingsCommand);
cli.register(CICDCommand);
cli.register(TeamCommand);
cli.register(PluginCommand);
cli.register(MethodologyCommand);
cli.register(HookCommand);
cli.register(PlanCommand);
cli.register(CommandCmd);
cli.register(AICommand);
cli.register(AuditCommand);
cli.register(PublishCommand);
cli.register(PublishSubmitCommand);
cli.register(AgentCommand);
cli.register(AgentListCommand);
cli.register(AgentShowCommand);
cli.register(AgentCreateCommand);
cli.register(AgentFromSkillCommand);
cli.register(AgentTranslateCommand);
cli.register(AgentSyncCommand);
cli.register(AgentValidateCommand);

cli.register(CheckCommand);
cli.register(FindCommand);
cli.register(ManifestCommand);
cli.register(ManifestInitCommand);
cli.register(ManifestAddCommand);
cli.register(ManifestRemoveCommand);
cli.register(ManifestInstallCommand);
cli.register(ManifestGenerateCommand);
cli.register(PrimerCommand);
cli.register(MeshCommand);
cli.register(MessageCommand);

cli.register(WorkflowPipelineCommand);
cli.register(WorkflowPipelineListCommand);

cli.register(HookTemplateListCommand);
cli.register(HookTemplateApplyCommand);
cli.register(HookTemplateShowCommand);

cli.register(CommandAvailableCommand);
cli.register(CommandInstallCommand);

cli.register(AgentInstallCommand);
cli.register(AgentAvailableCommand);

cli.register(LearnCommand);
cli.register(PatternStatusCommand);
cli.register(PatternFeedbackCommand);
cli.register(PatternApproveCommand);
cli.register(PatternRejectCommand);
cli.register(PatternExportCommand);
cli.register(PatternImportCommand);
cli.register(PatternClusterCommand);

cli.register(SessionCommand);
cli.register(SessionStatusCommand);
cli.register(SessionStartCommand);
cli.register(SessionLoadCommand);
cli.register(SessionListCommand);
cli.register(SessionNoteCommand);
cli.register(SessionCompleteCommand);
cli.register(SessionInProgressCommand);

cli.register(ProfileCommand);
cli.register(ProfileListCommand);
cli.register(ProfileCreateCommand);
cli.register(ProfileRemoveCommand);

cli.register(GuidelineCommand);
cli.register(GuidelineListCommand);
cli.register(GuidelineShowCommand);
cli.register(GuidelineEnableCommand);
cli.register(GuidelineDisableCommand);
cli.register(GuidelineCreateCommand);
cli.register(GuidelineRemoveCommand);

cli.register(TreeCommand);

cli.register(QuickCommand);
cli.register(SkillMdValidateCommand);
cli.register(SkillMdInitCommand);
cli.register(SkillMdCheckCommand);

cli.register(ServeCommand);

cli.runExit(process.argv.slice(2));
