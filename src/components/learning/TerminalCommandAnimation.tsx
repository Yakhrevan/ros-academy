import { useEffect, useRef, useState } from 'react';
import { FileText, Folder, Play, RotateCcw, SkipForward, Terminal } from 'lucide-react';

type Props = { command: string; output: string; cwd: string; title: string };
type Phase = 'ready' | 'typing' | 'submitted' | 'revealed' | 'verify-command' | 'verify-submitted' | 'verify-output';

export default function TerminalCommandAnimation({ command, output, cwd, title }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [typed, setTyped] = useState('');
  const [newDirectory, setNewDirectory] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const isCd = /^cd(?:\s|$)/.test(command.trim());

  const resolveDirectory = () => {
    const arg = command.trim().replace(/^cd\s*/, '') || '~';
    if (arg === '~' || arg === '$HOME' || arg === '-') return '/home/student';
    if (arg === '/') return '/';
    if (arg === '..') {
      const parts = cwd.split('/').filter(Boolean);
      parts.pop();
      return parts.length ? '/' + parts.join('/') : '/';
    }
    if (arg.startsWith('/')) return arg.replace(/\/$/, '') || '/';
    return (cwd === '/' ? '' : cwd) + '/' + arg.replace(/^\.\//, '');
  };

  const clearTimer = () => {
    if (timer.current !== undefined) window.clearInterval(timer.current);
    timer.current = undefined;
  };

  const reset = () => {
    clearTimer();
    setTyped('');
    setNewDirectory(null);
    setPhase('ready');
  };

  const play = () => {
    reset();
    setPhase('typing');
    let index = 0;
    timer.current = window.setInterval(() => {
      index += 1;
      setTyped(command.slice(0, index));
      if (index >= command.length) {
        clearTimer();
        window.setTimeout(() => setPhase('submitted'), 350);
        window.setTimeout(() => {
          if (isCd) setNewDirectory(resolveDirectory());
          setPhase('revealed');
        }, 950);
      }
    }, 75);
  };

  const stepForward = () => {
    clearTimer();
    if (phase === 'ready') { setTyped(command); setPhase('typing'); }
    else if (phase === 'typing') setPhase('submitted');
    else if (phase === 'submitted') { if (isCd) setNewDirectory(resolveDirectory()); setPhase('revealed'); }
    else if (phase === 'revealed' && isCd) setPhase('verify-command');
    else if (phase === 'verify-command') setPhase('verify-submitted');
    else if (phase === 'verify-submitted') setPhase('verify-output');
  };

  useEffect(() => { reset(); }, [command, output, cwd]);
  useEffect(() => () => clearTimer(), []);

  const shownDirectory = newDirectory || resolveDirectory();
  const shortPath = (path: string) => path.replace('/home/student', '~') || '/';

  return <article className="panel per-command-animation">
    <div className="panel-heading"><span className="step-number"><Terminal size={15}/></span><div><h2>Watch this command happen</h2><p>See the command typed, Enter pressed, and the result highlighted.</p></div></div>
    <div className="command-animation-window">
      <div className="command-animation-titlebar"><div className="window-dots"><i/><i/><i/></div><span>student@robot-lab:{shortPath(phase === 'revealed' && isCd ? shownDirectory : cwd)}</span><span className="safe-label">SIMULATED</span></div>
      <div className="command-animation-body">
        <div className="command-animation-caption">{title}</div>
        <div className="command-animation-prompt"><span>student@robot-lab</span><b>:{shortPath(cwd)}</b><strong>$</strong><code>{typed || (phase === 'ready' ? '' : command)}</code>{phase === 'typing' && <i className="typing-caret"/>}</div>
        {phase === 'submitted' && <div className="enter-indicator">↵ Enter pressed</div>}
        {phase === 'revealed' && (isCd ? <div className="command-animation-result"><span className="result-label">DIRECTORY CHANGED · HIGHLIGHTED</span><p className="directory-transition"><code>{cwd}</code><span>→</span><code className="directory-highlight">{shownDirectory}</code></p><p><b>What happened?</b> <code>cd</code> changed the shell's current directory. It usually prints no output, so the location change is shown visually.</p><div className="next-pwd-hint">Next: run <code>pwd</code> to verify the new location.</div></div> : isLs ? <div className="command-animation-result"><span className="result-label">DIRECTORY CONTENTS · VISUALIZED</span><div className="ls-current-location"><span>Listing the contents of</span><code>{cwd}</code></div><div className="ls-entry-grid">{listedEntries.map((entry, index) => { const folderLike = !entry.includes('.') || ['build','install','log','src','Desktop','Documents','projects','ros2_ws'].includes(entry); return <div className={'ls-entry ' + (folderLike ? 'is-folder' : 'is-file')} key={entry + index}>{folderLike ? <Folder size={19}/> : <FileText size={19}/>}<code>{entry}</code><span>{folderLike ? 'Directory' : 'File'}</span></div>; })}</div><p><b>What this tells you:</b> <code>ls</code> lists names inside the current directory. It does not move into a folder or change files. The folder entries are highlighted so you can choose a name to use with <code>cd</code>.</p><div className="next-pwd-hint">Try next: <code>cd ros2_ws</code>, then <code>pwd</code> to verify where you moved.</div></div> : <div className="command-animation-result"><span className="result-label">OUTPUT · RESULT</span><pre>{output || '(No output — this command may change state silently.)'}</pre><p><b>What this tells you:</b> {command.trim() === 'pwd' ? 'The printed absolute path tells you exactly which directory the shell is currently in.' : 'Compare the output with your goal. Successful commands can change state without printing a message, so verify when appropriate.'}</p></div>)}
        {phase === 'verify-command' && <><div className="command-animation-prompt after-cd-prompt"><span>student@robot-lab</span><b>:{shortPath(shownDirectory)}</b><strong>$</strong><code>pwd</code><i className="typing-caret"/></div><p className="pwd-transition-note">Now type pwd in the new directory…</p></>}
        {phase === 'verify-submitted' && <><div className="command-animation-prompt after-cd-prompt"><span>student@robot-lab</span><b>:{shortPath(shownDirectory)}</b><strong>$</strong><code>pwd</code></div><div className="enter-indicator">↵ Enter pressed</div></>}
        {phase === 'verify-output' && <div className="command-animation-result"><span className="result-label">P W D · VERIFICATION OUTPUT</span><pre className="directory-highlight">{shownDirectory}</pre><p><b>Confirmed:</b> <code>pwd</code> prints the current working directory. The output matches the highlighted directory, so you can verify where you are after <code>cd</code>.</p></div>}
        {phase === 'ready' && <div className="command-animation-placeholder">Press Play to watch the command execute step by step.</div>}
      </div>
    </div>
    <div className="command-animation-controls">
      <button className="button-primary" onClick={play}><Play size={14}/> {phase === 'ready' ? 'Play animation' : 'Replay animation'}</button>
      <button className="button-secondary" onClick={stepForward} disabled={phase === 'verify-output' || (phase === 'revealed' && !isCd)}><SkipForward size={14}/> Next animation step</button>
      <button className="button-secondary" onClick={reset}><RotateCcw size={14}/> Reset</button>
    </div>
    <p className="command-animation-note">This is a safe terminal simulation. Directory transitions are illustrative and do not execute commands on your device.</p>
  </article>;
}
