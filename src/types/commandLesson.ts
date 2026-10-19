export type SyntaxToken = {
  token: string;
  role: string;
  meaning: string;
};

export type CommandStep = {
  id: string;
  title: string;
  command: string;
  purpose: string;
  syntax: string;
  tokens: SyntaxToken[];
  howItWorks: string[];
  expectedOutput: string;
  outputMeaning: string[];
  commonMistake: string;
  roboticsUse: string;
};

export type CommandLessonDefinition = {
  lessonId: string;
  intro: string;
  mentalModel: string;
  steps: CommandStep[];
};