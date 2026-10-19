import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, CornerDownRight, Play, RotateCcw, Terminal, Lightbulb, GitBranch } from 'lucide-react';
import TerminalWalkthrough from './TerminalWalkthrough';
import TerminalCommandAnimation from './TerminalCommandAnimation';
import PathPredictionPractice from './PathPredictionPractice';
import FileOperationsPractice from './FileOperationsPractice';
import FileReadingPractice from './FileReadingPractice';
import PipelinePractice from './PipelinePractice';
import ProcessManagementPractice from './ProcessManagementPractice';
import TextSearchPractice from './TextSearchPractice';
import EnvironmentVariablesPractice from './EnvironmentVariablesPractice';
import ShellStartupPractice from './ShellStartupPractice';
import PackageSystemInspectionPractice from './PackageSystemInspectionPractice';
import PermissionsPractice from './PermissionsPractice';
import UserGroupPractice from './UserGroupPractice';
import NetworkingPractice from './NetworkingPractice';
import SSHRemoteAccessPractice from './SSHRemoteAccessPractice';
import LinuxServicesPractice from './LinuxServicesPractice';
import type { Lesson } from '../../types/lesson';
import type { CommandStep } from '../../types/commandLesson';
import { commandLessons } from '../../data/commandLessons';
import { executeCommand, type TerminalResult } from '../../simulators/linux/executeCommand';

type Props = {
  lesson: Lesson;
  completed: boolean;
  onBack: () => void;
  onComplete: (id: string) => void;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onProgressChange: (lessonId: string, practised: string[], passedChecks: string[]) => void;
};

const INITIAL_CWD = '/home/student';

export default function LinuxCommandLessonPlayer({ lesson, completed, onBack, onComplete, onPreviousLesson, onNextLesson, canGoPrevious, canGoNext, onProgressChange }: Props) {
  const definition = commandLessons[lesson.id];
  const navigationOrder = ['pwd', 'ls', 'cd-into-workspace', 'ls-workspace', 'cd-src', 'ls-src', 'cd-package', 'cd-back-one', 'cd-back-two', 'cd-home', 'cd-absolute', 'cd-previous', 'cd-wrong-path', 'ls-details'];
  const steps = (definition?.steps ?? []).filter((item) => !['cd-ros2-ws', 'pwd-verify', 'cd-parent'].includes(item.id)).slice().sort((a, b) => {
    const aIndex = navigationOrder.indexOf(a.id);
    const bIndex = navigationOrder.indexOf(b.id);
    if (aIndex < 0 && bIndex < 0) return 0;
    if (aIndex < 0) return 1;
    if (bIndex < 0) return -1;
    return aIndex - bIndex;
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [activeStage, setActiveStage] = useState<'learn' | 'watch' | 'practice' | 'check'>('learn');
  const [cwd, setCwd] = useState(INITIAL_CWD);
  const [input, setInput] = useState(steps[0]?.command ?? 'pwd');
  const [result, setResult] = useState<TerminalResult>({ command: 'pwd', output: INITIAL_CWD, status: 'Ready. Run a command to experiment in this simulated shell.', cwd: INITIAL_CWD });
  const [history, setHistory] = useState<TerminalResult[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [ranCurrentStep, setRanCurrentStep] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progressLoadedFor, setProgressLoadedFor] = useState('');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [passedChecks, setPassedChecks] = useState<string[]>([]);
  const [checksLoadedFor, setChecksLoadedFor] = useState('');
  const [positionLoadedFor, setPositionLoadedFor] = useState('');
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const previousStepIndex = useRef(stepIndex);

  useEffect(() => {
    let startedAt = Date.now();
    try {
      const saved = window.localStorage.getItem('ros-academy:session-start:' + lesson.id);
      const parsed = saved ? Number(saved) : NaN;
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= Date.now()) startedAt = parsed;
      else window.localStorage.setItem('ros-academy:session-start:' + lesson.id, String(startedAt));
    } catch {
      // Session timing is optional when browser storage is unavailable.
    }
    setSessionStartedAt(startedAt);
    const updateElapsed = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [lesson.id]);

  useEffect(() => {
    if (previousStepIndex.current !== stepIndex) {
      previousStepIndex.current = stepIndex;
      document.getElementById('command-step-description')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stepIndex]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('ros-academy:lesson-position:' + lesson.id);
      if (saved) {
        const position = JSON.parse(saved) as { stepIndex?: number; activeStage?: string; cwd?: string; input?: string };
        if (typeof position.stepIndex === 'number' && Number.isFinite(position.stepIndex)) {
          setStepIndex(Math.max(0, Math.min(steps.length - 1, Math.floor(position.stepIndex))));
        }
        if (position.activeStage === 'learn' || position.activeStage === 'watch' || position.activeStage === 'practice' || position.activeStage === 'check') {
          setActiveStage(position.activeStage);
        }
        if (typeof position.cwd === 'string' && position.cwd.startsWith('/home/student')) setCwd(position.cwd);
        if (typeof position.input === 'string') setInput(position.input.slice(0, 500));
      }
    } catch {
      // A missing or invalid resume position should never block the lesson.
    } finally {
      setPositionLoadedFor(lesson.id);
    }
  }, [lesson.id]);

  useEffect(() => {
    if (positionLoadedFor !== lesson.id) return;
    try {
      window.localStorage.setItem('ros-academy:lesson-position:' + lesson.id, JSON.stringify({ stepIndex, activeStage, cwd, input }));
    } catch {
      // Resume position remains available in this session if storage is unavailable.
    }
  }, [lesson.id, stepIndex, activeStage, cwd, input, positionLoadedFor]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('ros-academy:completed-commands:' + lesson.id);
      setCompletedSteps(saved ? JSON.parse(saved) as string[] : []);
      setProgressLoadedFor(lesson.id);
    } catch {
      setCompletedSteps([]);
      setProgressLoadedFor(lesson.id);
    }
  }, [lesson.id]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('ros-academy:passed-checks:' + lesson.id);
      setPassedChecks(saved ? JSON.parse(saved) as string[] : []);
      setChecksLoadedFor(lesson.id);
    } catch {
      setPassedChecks([]);
      setChecksLoadedFor(lesson.id);
    }
  }, [lesson.id]);

  useEffect(() => {
    if (progressLoadedFor !== lesson.id || checksLoadedFor !== lesson.id) return;
    onProgressChange(lesson.id, completedSteps, passedChecks);
  }, [lesson.id, completedSteps, passedChecks, progressLoadedFor, checksLoadedFor, onProgressChange]);

  useEffect(() => {
    if (checksLoadedFor !== lesson.id) return;
    try {
      window.localStorage.setItem('ros-academy:passed-checks:' + lesson.id, JSON.stringify(passedChecks));
    } catch {
      // Quiz progress remains available for this session when storage is unavailable.
    }
  }, [passedChecks, lesson.id, checksLoadedFor]);

  useEffect(() => {
    if (progressLoadedFor !== lesson.id) return;
    try {
      window.localStorage.setItem('ros-academy:completed-commands:' + lesson.id, JSON.stringify(completedSteps));
    } catch {
      // Progress remains available for this session when storage is unavailable.
    }
  }, [completedSteps, lesson.id, progressLoadedFor]);

  useEffect(() => {
    const first = commandLessons[lesson.id]?.steps[0];
    setStepIndex(0);
    setActiveStage('learn');
    setCwd(INITIAL_CWD);
    setInput(first?.command ?? 'pwd');
    setResult({ command: 'pwd', output: INITIAL_CWD, status: 'Ready. Run a command to experiment in this simulated shell.', cwd: INITIAL_CWD });
    setHistory([]);
    setShowHints(false);
    setRanCurrentStep(false);
  }, [lesson.id]);

  const step: CommandStep | undefined = steps[stepIndex];
  const quiz = step ? (step.id === 'pwd'
    ? { question: 'What does pwd print?', options: ['The current working directory path', 'All files in the directory', 'The Linux user password'], correct: 0, explanation: 'pwd prints the absolute path of the current working directory.' }
    : step.id.startsWith('cd')
      ? { question: 'What is the main effect of cd ros2_ws when that folder exists?', options: ['It deletes ros2_ws', 'It changes the shell into ros2_ws', 'It prints every file in ros2_ws'], correct: 1, explanation: 'cd changes the shell’s current working directory; it normally prints no output on success.' }
      : step.id === 'ls' || step.id === 'ls-details'
        ? { question: 'What does ls do by itself?', options: ['Moves into the first folder', 'Lists directory entries', 'Changes file permissions'], correct: 1, explanation: 'ls lists directory entries. Options such as -l add details; -a includes hidden entries.' }
        : { question: 'What is the safest way to verify what a command did?', options: ['Assume it worked if there is no error', 'Run random commands until the output changes', 'Compare the result with the expected state and inspect it'], correct: 2, explanation: 'Compare the output and system state with your prediction; inspect before making further changes.' }) : null;
  const progress = steps.length ? ((stepIndex + 1) / steps.length) * 100 : 0;
  const allChecksPassed = steps.length > 0 && steps.every((item) => passedChecks.includes(item.id));
  const allPracticeCompleted = steps.length > 0 && steps.every((item) => completedSteps.includes(item.id));
  const canCompleteLesson = allChecksPassed && allPracticeCompleted;
  const pathParts = useMemo(() => cwd.split('/').filter(Boolean), [cwd]);

  useEffect(() => {
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setQuizPassed(false);
  }, [step?.id]);

  if (!definition || !step) {
    return <section className="lesson-page"><button className="back-link" onClick={onBack}>← Back to learning path</button><article className="panel"><h1>{lesson.title}</h1><p>The command-by-command lesson is being prepared for this topic.</p><button className="button-secondary" onClick={onBack}>Back to path</button></article></section>;
  }

  const run = (raw: string) => {
    const next = executeCommand(raw, cwd, steps);
    setCwd(next.cwd);
    setResult(next);
    setHistory((previous) => [next, ...previous].slice(0, 8));
    setInput('');
    if (raw.trim() === step.command) {
      setRanCurrentStep(true);
      setCompletedSteps((previous) => previous.includes(step.id) ? previous : [...previous, step.id]);
    }
  };

  const chooseStep = (nextIndex: number) => {
    const nextStep = steps[nextIndex];
    if (!nextStep) return;
    setStepIndex(nextIndex);
    setInput(nextStep.command);
    setResult({ command: '', output: '', status: 'Example loaded. Press Run example or edit the command and experiment.', cwd });
    setRanCurrentStep(false);
    setShowHints(false);
  };

  const resetTerminal = () => {
    setCwd(INITIAL_CWD);
    setInput(step.command);
    setResult({ command: '', output: '', status: 'Terminal reset to the starting directory. No real system was changed.', cwd: INITIAL_CWD });
    setHistory([]);
    setRanCurrentStep(false);
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) chooseStep(stepIndex + 1);
    else onNextLesson();
  };

  return <section className="lesson-page command-lesson-page" data-learning-stage={activeStage}>
    <button className="back-link" onClick={onBack}>← Back to {lesson.phase}</button>
    <div className="command-lesson-hero">
      <div>
        <span className="eyebrow">LINUX ENGINEERING FOUNDATIONS · HANDS-ON</span>
        <h1>{lesson.title}</h1>
        <p>{definition.intro}</p>
        <div className="hero-meta"><span><Terminal size={14}/> Simulated Linux shell</span><span><GitBranch size={14}/> Ubuntu 22.04 · ROS 2 Humble learning track</span></div>
      </div>
      <div className="command-hero-mark"><Terminal size={34}/><span>LEARN BY DOING</span></div>
    </div>

    {lesson.id === 'linux-files' && <details className="linux-extra-practice">
      <summary>
        <span className="linux-extra-practice-icon"><Terminal size={19}/></span>
        <span className="linux-extra-practice-summary"><b>Extra practice labs</b><small>Optional deep dives · Open one section when you are ready</small></span>
        <span className="linux-extra-practice-count">15 labs</span>
      </summary>
      <div className="linux-extra-practice-content">
        <p className="linux-extra-practice-intro">Finish the command walkthrough first. These focused labs are optional practice, grouped here so they do not interrupt the main lesson.</p>
        <TerminalWalkthrough />
        <PathPredictionPractice />
        <FileOperationsPractice />
        <FileReadingPractice />
        <PipelinePractice />
        <ProcessManagementPractice />
        <TextSearchPractice />
        <EnvironmentVariablesPractice />
        <ShellStartupPractice />
        <PackageSystemInspectionPractice />
        <PermissionsPractice />
        <UserGroupPractice />
        <NetworkingPractice />
        <SSHRemoteAccessPractice />
        <LinuxServicesPractice />
      </div>
    </details>}

    <div className="command-progress">
      <div><span>COMMAND {String(stepIndex + 1).padStart(2, '0')} OF {String(steps.length).padStart(2, '0')} · {completedSteps.length} PRACTISED · {passedChecks.length} CHECKS PASSED</span><b>{step.title}</b></div>
      <div className="command-progress-track"><i style={{ width: progress + '%' }}/></div>
      <span className="command-progress-count">{Math.round(progress)}%</span>
    </div>

    <nav className="lesson-stage-nav" aria-label="Lesson stages">
      {([
        { id: 'learn', number: '01', title: 'Learn', detail: 'Understand the idea' },
        { id: 'watch', number: '02', title: 'Watch', detail: 'See it in action' },
        { id: 'practice', number: '03', title: 'Practise', detail: 'Run the command' },
        { id: 'check', number: '04', title: 'Check', detail: 'Test your understanding' },
      ] as const).map((stage) => <button key={stage.id} type="button" className={activeStage === stage.id ? 'active' : ''} aria-current={activeStage === stage.id ? 'step' : undefined} onClick={() => { setActiveStage(stage.id); document.getElementById('lesson-stage-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
        <span className="lesson-stage-number">{stage.number}</span><span className="lesson-stage-copy"><b>{stage.title}</b><small>{stage.detail}</small></span>{activeStage === stage.id && <span className="lesson-stage-active-dot" />}
      </button>)}
    </nav>

    <div id="lesson-stage-content">
      <div className="lesson-stage-watch"><TerminalCommandAnimation key={step.id} command={step.command} output={step.expectedOutput} cwd={cwd} title={step.title} /></div>

    <div className="command-learning-layout">
      <div className="command-learning-main lesson-stage-learn">
        <article className="panel command-concept-panel">
          <div className="panel-heading"><span className="step-number">01</span><div><h2>Understand before typing</h2><p>What it does, when to use it, and what changes.</p></div></div>
          <h3 id="command-step-description" className="command-step-title">{step.title}</h3>
          <p className="body-copy">{step.purpose}</p>
          <div className="beginner-explanation"><h4>Plain-English explanation</h4><p>{step.id === 'pwd' ? 'Think of Linux as a huge building made of folders. pwd is like asking, “Which room am I standing in?” It prints the complete address of the current folder, starting from /. It does not list the room’s contents or move you anywhere.' : step.id === 'ls' || step.id === 'ls-details' ? 'Imagine opening a folder in a file manager. ls gives you a text list of what is inside the folder you are currently in. It is an inspection command: by itself, it does not move you, create files, or delete anything.' : step.id.startsWith('cd') ? 'Think of the terminal as a person standing in one folder. cd tells that person to move to another folder. A relative destination is interpreted from where you are now; an absolute destination starts at /. After moving, use pwd to confirm the new location.' : 'This command asks Linux to inspect or change a specific part of the system. Read the command, identify its target, run it, and compare the result with the state before the command.'}</p><p><b>Beginner habit:</b> before you run a command, say what you expect to happen. After it runs, compare the real output with your prediction. If the result differs, inspect the current state before trying random commands.</p></div>
          <div className="mental-model-box"><Lightbulb size={18}/><div><b>Mental model</b><p>{definition.mentalModel}</p></div></div>
          <div className="syntax-block">
            <span className="eyebrow">SYNTAX</span>
            <code>{step.syntax}</code>
          </div>
          <div className="token-breakdown">
            <span className="eyebrow">BREAK DOWN EVERY PART</span>
            {step.tokens.map((token, index) => <div className="token-row" key={token.token + index}>
              <code>{token.token}</code><div><b>{token.role}</b><p>{token.meaning}</p></div>
            </div>)}
          </div>
          <div className="how-it-works">
            <span className="eyebrow">WHAT HAPPENS INSIDE LINUX?</span>
            <ol>{step.howItWorks.map((line, index) => <li key={line}><span>{index + 1}</span><p>{line}</p></li>)}</ol>
          </div>
        </article>

        <article className="panel command-visual-panel">
          <div className="panel-heading"><span className="step-number">02</span><div><h2>See the system state</h2><p>Track where the simulated shell is standing.</p></div></div>
          <div className="filesystem-visual">
            <div className="filesystem-top"><GitBranch size={16}/><span>VIRTUAL FILESYSTEM</span><b>{cwd}</b></div>
            <div className="filesystem-breadcrumb">
              <button onClick={() => { setCwd('/'); setResult({ command: 'cd /', output: '', status: 'Moved to the filesystem root.', cwd: '/' }); }}>root /</button>
              {pathParts.map((part, index) => {
                const target = '/' + pathParts.slice(0, index + 1).join('/');
                return <span key={target}><ArrowRight size={12}/><button className={target === cwd ? 'current' : ''} onClick={() => { setCwd(target); setResult({ command: 'cd ' + target, output: '', status: 'Moved to ' + target + '.', cwd: target }); }}>{part}</button></span>;
              })}
            </div>
            <div className="filesystem-state">
              <div className="filesystem-state-icon"><Terminal size={22}/></div>
              <div><b>Current working directory</b><code>{cwd}</code><p>{cwd === '/home/student/ros2_ws' ? 'You are inside the example ROS 2 workspace. This directory contains src/, build/, install/ and log/.' : cwd === '/home/student' ? 'You are in the learner home directory. The ros2_ws folder is available here.' : cwd === '/' ? 'You are at the top of the filesystem tree.' : 'The terminal is currently located here. Run pwd to print this path.'}</p></div>
            </div>
            <div className="filesystem-entries"><span className="eyebrow">VISIBLE ENTRIES HERE</span><div>{(cwd === '/home/student' ? ['Desktop','Documents','projects','ros2_ws'] : cwd === '/home/student/ros2_ws' ? ['src','build','install','log','README.md'] : cwd === '/' ? ['home','etc','dev','opt','usr','var'] : cwd === '/home/student/ros2_ws/src' ? ['demo_robot','my_robot_bringup'] : ['..','(directory contents depend on this simulated path)']).map((entry) => <span key={entry}>{entry}</span>)}</div></div>
          </div>
          <div className="visual-explanation"><CheckCircle2 size={17}/><p><b>Observe the effect.</b> Commands such as <code>pwd</code> only report state; <code>cd</code> changes the shell location. The visual state updates when the simulated command runs.</p></div>
        </article>

        {lesson.id === 'linux-files' && <article className="panel command-scenario-panel">
          <div className="panel-heading"><span className="step-number">REAL</span><div><h2>Practice with project-style examples</h2><p>Use the same navigation skills with two different folder structures.</p></div></div>
          <div className="scenario-example">
            <div className="scenario-label"><span className="scenario-dot learning"/>Learning / practice project</div>
            <h3>Coding practice workspace</h3>
            <p>Imagine your practice files are stored under a project folder in your home directory. This is an original fictional training workspace created for ROS Academy.</p>
            <div className="scenario-command"><code>cd ~/projects/coding-practice-lab</code><button onClick={() => setInput('cd ~/projects/coding-practice-lab')}>Use command</button></div>
            <div className="scenario-command"><code>ls</code><button onClick={() => setInput('ls')}>Use command</button></div>
            <div className="scenario-command"><code>cd ..</code><button onClick={() => setInput('cd ..')}>Use command</button></div>
            <p className="scenario-hint">Goal: enter the practice folder, inspect its contents, then return to projects.</p>
          </div>
          <div className="scenario-example">
            <div className="scenario-label"><span className="scenario-dot robotics"/>Engineering / robotics project</div>
            <h3>Autonomous mobile robot (AMR) project</h3>
            <p>Imagine a robotics repository with source code, configuration and launch folders. This is an original fictional robotics project created for ROS Academy.</p>
            <div className="scenario-command"><code>cd ~/projects/enterprise-amr-demo</code><button onClick={() => setInput('cd ~/projects/enterprise-amr-demo')}>Use command</button></div>
            <div className="scenario-command"><code>cd src</code><button onClick={() => setInput('cd src')}>Use command</button></div>
            <div className="scenario-command"><code>cd -</code><button onClick={() => setInput('cd -')}>Use command</button></div>
            <p className="scenario-hint">Goal: move into the project, inspect source folders, and switch back to the previous directory.</p>
          </div>
          <div className="scenario-workflow"><b>Recommended practice loop</b><p>Run <code>pwd</code> → use one <code>cd</code> command → run <code>pwd</code> again → use <code>ls</code> → navigate back. If a path fails, inspect the current location instead of guessing.</p></div>
        </article>}
        <article className="panel command-reasoning-panel">
          <div className="panel-heading"><span className="step-number">03</span><div><h2>How to read the result</h2><p>Do not just memorize the output—interpret it.</p></div></div>
          <div className="expected-result"><span className="eyebrow">EXPECTED OUTPUT · EXAMPLE</span><pre>{step.expectedOutput}</pre><ul>{step.outputMeaning.map((line) => <li key={line}><CheckCircle2 size={15}/>{line}</li>)}</ul></div>
          <div className="mistake-box"><CircleHelp size={18}/><div><b>Common mistake</b><p>{step.commonMistake}</p></div></div>
          <div className="robotics-connection"><span className="eyebrow">WHY A ROBOTICS ENGINEER USES THIS</span><p>{step.roboticsUse}</p></div>
        </article>
      </div>

      <aside className="command-practice-column">
        <article className="panel embedded-terminal-panel lesson-stage-practice">
          <div className="panel-heading"><span className="step-number">04</span><div><h2>Try it here</h2><p>Example and terminal in one workspace.</p></div></div>
          <div className="embedded-terminal">
            <div className="embedded-terminal-title"><div className="window-dots"><i/><i/><i/></div><span>student@robot-lab</span><span className="safe-label">SIMULATED</span></div>
            <div className="embedded-terminal-cwd">~/ {cwd.replace('/home/student', '').replace(/^\//, '')}</div>
            <form className="embedded-terminal-form" onSubmit={(event) => { event.preventDefault(); run(input); }}>
              <label htmlFor="linux-command-input"><span>$</span><input id="linux-command-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a command…" autoComplete="off" spellCheck={false}/></label>
              <button type="submit" className="button-primary"><Play size={14}/> Run</button>
            </form>
            <div className="terminal-action-row"><button onClick={() => { setInput(step.command); run(step.command); }}><Play size={13}/> Run example</button><button onClick={resetTerminal}><RotateCcw size={13}/> Reset</button></div>
            <div className="embedded-terminal-output">
              <div className="terminal-output-command"><span>student@robot-lab:{cwd.replace('/home/student', '~') || '/'}$</span> {result.command || 'waiting for command'}</div>
              {result.output ? <pre>{result.output}</pre> : <p className="terminal-no-output">No output yet. Some successful commands, such as <code>cd</code>, normally print nothing.</p>}
              <div className="terminal-status"><CheckCircle2 size={14}/><span>{result.status}</span></div>
            </div>
          </div>
          <div className="terminal-practice-note"><b>Safe practice environment</b><p>This is a deterministic simulator. It does not run shell commands on your phone or computer, inspect your real hardware, or change real files.</p></div>
          <div className="terminal-command-shortcuts"><span className="eyebrow">TAP TO INSERT A COMMAND</span><div>{Array.from(new Set([step.command, 'pwd', 'ls', 'cd ..', 'ls -la'])).map((command) => <button key={command} onClick={() => setInput(command)}><code>{command}</code></button>)}</div></div>
          {history.length > 0 && <div className="terminal-recent-history"><span className="eyebrow">RECENT PRACTICE</span>{history.slice(0, 4).map((item, index) => <button key={item.command + index} onClick={() => { setInput(item.command); setResult(item); setCwd(item.cwd); }}><code>{item.command}</code><span>{item.output.split('\n')[0] || item.status}</span></button>)}</div>}
        </article>
        <article className="panel command-check-panel lesson-stage-check">
          <div className="panel-heading"><span className="step-number purple">05</span><div><h2>Knowledge check</h2><p>Answer correctly to pass this command’s check.</p></div></div>
          {quiz && <div className="knowledge-check">
            <p className="knowledge-check-question">{quiz.question}</p>
            <div className="knowledge-check-options">{quiz.options.map((option, index) => <button type="button" key={option} disabled={quizSubmitted} className={quizSubmitted && index === quiz.correct ? 'correct' : quizSubmitted && index === quizAnswer ? 'incorrect' : quizAnswer === index ? 'selected' : ''} onClick={() => setQuizAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
            {!quizSubmitted ? <button className="button-primary knowledge-check-submit" disabled={quizAnswer === null} onClick={() => { setQuizSubmitted(true); setQuizPassed(quizAnswer === quiz.correct); if (quizAnswer === quiz.correct) setPassedChecks((previous) => previous.includes(step.id) ? previous : [...previous, step.id]); }}>{'Check answer'}</button> : <div className={'knowledge-check-feedback ' + (quizPassed ? 'passed' : 'retry')}><b>{quizPassed ? 'Correct — check passed' : 'Not quite — try again'}</b><p>{quiz.explanation}</p>{!quizPassed && <button className="button-secondary" onClick={() => { setQuizAnswer(null); setQuizSubmitted(false); }}>Try again</button>}</div>}
          </div>}
          <div className="command-step-navigation">
            <button className="button-secondary" disabled={stepIndex === 0} onClick={() => chooseStep(stepIndex - 1)}><ArrowLeft size={15}/> Previous command</button>
            <button className="button-primary" onClick={nextStep} disabled={stepIndex === steps.length - 1}>{stepIndex === steps.length - 1 ? 'All commands complete' : 'Next command'} {stepIndex === steps.length - 1 ? <CheckCircle2 size={15}/> : <ArrowRight size={15}/>}</button>
          </div>
          {stepIndex === steps.length - 1 && <><p className="lesson-completion-requirement">{canCompleteLesson ? 'Practice and knowledge checks are complete. You can finish this lesson.' : `Complete all practice commands (${completedSteps.length}/${steps.length}) and pass all knowledge checks (${passedChecks.length}/${steps.length}) to finish this lesson.`}</p><button className={'button-secondary full command-complete-button ' + (completed ? 'is-complete' : '')} onClick={() => onComplete(lesson.id)} disabled={!canCompleteLesson}>{completed ? <><CheckCircle2 size={16}/> Lesson completed</> : <>Complete lesson <CheckCircle2 size={16}/></>}</button></>}
          {completed && <section className="lesson-completion-summary" aria-live="polite"><div className="lesson-completion-summary-icon"><CheckCircle2 size={22}/></div><div className="lesson-completion-summary-heading"><span className="eyebrow">LESSON SUMMARY</span><h3>Lesson completed</h3><p>You finished this lesson and can review your progress before moving on.</p></div><div className="lesson-completion-summary-stats"><div><b>{completedSteps.length}/{steps.length}</b><span>Commands practised</span></div><div><b>{passedChecks.length}/{steps.length}</b><span>Knowledge checks passed</span></div><div><b>{steps.length ? Math.round((passedChecks.length/steps.length)*100) : 0}%</b><span>Assessment success rate</span></div><div><b>{Math.floor(elapsedSeconds/60)}m {elapsedSeconds%60}s</b><span>Elapsed lesson time</span></div></div><p className="lesson-session-time-note">Elapsed time since this lesson was opened in this browser; it is not an active-focus timer.</p><div className="lesson-completion-summary-next"><span>Recommended next step</span><b>{canGoNext ? 'Continue to the next lesson' : 'Return to the learning path and choose your next topic'}</b><button className="button-primary" onClick={canGoNext ? onNextLesson : onBack}>{canGoNext ? 'Next lesson' : 'Back to learning path'} <ArrowRight size={15}/></button></div></section>}
          <div className="step-dots" aria-label="Command steps">{steps.map((item, index) => <button key={item.id} className={index === stepIndex ? 'active' : completedSteps.includes(item.id) ? 'visited completed' : ''} aria-label={(completedSteps.includes(item.id) ? 'Completed: ' : 'Go to ') + item.title} title={(completedSteps.includes(item.id) ? 'Completed · ' : '') + item.title} onClick={() => chooseStep(index)}>{completedSteps.includes(item.id) ? '✓' : ''}</button>)}</div>
        </article>
        <div className="command-bottom-navigation"><div className="lesson-navigation-label"><b>Lesson navigation</b><span>Move between topics independently of command steps.</span></div><div className="lesson-navigation-actions"><button className="button-secondary" disabled={!canGoPrevious} onClick={onPreviousLesson}><ArrowLeft size={15}/> Previous lesson</button><button className="button-primary" disabled={!canGoNext} onClick={onNextLesson}>Next lesson <ArrowRight size={15}/></button></div></div>
      </aside>
    </div>
    </div>
  </section>;
}
