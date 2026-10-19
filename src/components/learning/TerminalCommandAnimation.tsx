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
  const isLs = /^ls(?:\s|$)/.test(command.trim());
  const isLongListing = isLs && (/(?:^|\s)-[^\s]*l/.test(command.trim()) || command.trim().includes('--long'));
  const listedEntries: string[] = output.split(/\s+/).filter(Boolean);

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
        {phase === 'revealed' && (isCd ? <div className="command-animation-result"><span className="result-label">DIRECTORY CHANGED · HIGHLIGHTED</span><p className="directory-transition"><code>{cwd}</code><span>→</span><code className="directory-highlight">{shownDirectory}</code></p><p><b>What happened?</b> <code>cd</code> changed the shell's current directory. It usually prints no output, so the location change is shown visually.</p><div className="next-pwd-hint">Next: run <code>pwd</code> to verify the new location.</div></div> : isLs && isLongListing ? <div className="command-animation-result"><span className="result-label">LONG LISTING · PERMISSIONS AND METADATA</span><div className="ls-current-location"><span>Detailed listing of</span><code>{cwd}</code></div><div className="ls-metadata-table"><div className="ls-metadata-head"><span>PERMISSIONS</span><span>OWNER / GROUP</span><span>SIZE</span><span>NAME</span></div>{[{perm:'-rw-r--r--',owner:'student',group:'student',size:'2.1 KB',name:'.bashrc',kind:'file'},{perm:'-rw-r--r--',owner:'student',group:'student',size:'1.4 KB',name:'README.md',kind:'file'},{perm:'drwxr-xr-x',owner:'student',group:'student',size:'4.0 KB',name:'projects',kind:'folder'},{perm:'drwxr-xr-x',owner:'student',group:'student',size:'4.0 KB',name:'ros2_ws',kind:'folder'}].map(item=><div className="ls-metadata-row" key={item.name}><code className="ls-permission">{item.perm}</code><span>{item.owner} / {item.group}</span><span>{item.size}</span><span className={item.kind==='folder'?'ls-metadata-folder':'ls-metadata-file'}>{item.kind==='folder'?<Folder size={14}/>:<FileText size={14}/>}<code>{item.name}</code></span></div>)}</div><p><b>Read the columns:</b> the first character <code>d</code> means directory; <code>-</code> means regular file. The next nine permission characters are grouped as owner, group, and others. Owner/group identify account ownership; size is the displayed byte count converted for readability. The hidden <code>.bashrc</code> appears because <code>-a</code> includes dotfiles.</p><div className="permission-breakdown"><h3>Decode a permission string</h3><p className="permission-example"><code>drwxr-xr-x</code><span>→</span><b>directory + owner + group + others</b></p><div className="permission-groups"><div className="permission-group type"><code>d</code><b>Type</b><span>Directory</span></div><div className="permission-group owner"><code>rwx</code><b>Owner</b><span>Read, write, enter/search</span></div><div className="permission-group group"><code>r-x</code><b>Group</b><span>Read and enter/search; no write</span></div><div className="permission-group others"><code>r-x</code><b>Others</b><span>Read and enter/search; no write</span></div></div><div className="permission-key"><span><b>r</b> = read</span><span><b>w</b> = write</span><span><b>x</b> = execute file / enter directory</span><span><b>-</b> = permission absent</span></div><p><b>Important:</b> on a directory, <code>x</code> means you can traverse/search it; it does not mean “run the folder”. This example is illustrative and does not change permissions.</p></div><p className="ls-training-note">Training example: owner, group, sizes and entries are illustrative, not read from your device.</p></div> : isLs ? <div className="command-animation-result"><span className="result-label">DIRECTORY CONTENTS · VISUALIZED</span><div className="ls-current-location"><span>Listing the contents of</span><code>{cwd}</code></div><div className="ls-entry-grid">{listedEntries.map((entry, index) => { const folderLike = !entry.includes('.') || ['build','install','log','src','Desktop','Documents','projects','ros2_ws'].includes(entry); return <div className={'ls-entry ' + (folderLike ? 'is-folder' : 'is-file')} key={entry + index}>{folderLike ? <Folder size={19}/> : <FileText size={19}/>}<code>{entry}</code><span>{folderLike ? 'Directory' : 'File'}</span></div>; })}</div><p><b>What this tells you:</b> <code>ls</code> lists names inside the current directory. It does not move into a folder or change files. The folder entries are highlighted so you can choose a name to use with <code>cd</code>.</p><div className="next-pwd-hint">Try next: <code>cd ros2_ws</code>, then <code>pwd</code> to verify where you moved.</div></div> : <div className="command-animation-result"><span className="result-label">OUTPUT · RESULT</span><pre>{output || '(No output — this command may change state silently.)'}</pre><p><b>What this tells you:</b> {command.trim() === 'pwd' ? 'The printed absolute path tells you exactly which directory the shell is currently in.' : 'Compare the output with your goal. Successful commands can change state without printing a message, so verify when appropriate.'}</p></div>)}
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
