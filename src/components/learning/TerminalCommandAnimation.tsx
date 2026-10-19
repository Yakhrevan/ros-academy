import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, SkipForward, Terminal } from 'lucide-react';

type Props = {
  command: string;
  output: string;
  cwd: string;
  title: string;
};

type Phase = 'ready' | 'typing' | 'submitted' | 'revealed';

export default function TerminalCommandAnimation({ command, output, cwd, title }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [typed, setTyped] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const clearTimer = () => {
    if (timer.current !== undefined) window.clearInterval(timer.current);
    timer.current = undefined;
  };

  const reset = () => {
    clearTimer();
    setAutoPlay(false);
    setTyped('');
    setPhase('ready');
  };

  const play = () => {
    reset();
    setAutoPlay(true);
    setPhase('typing');
    let index = 0;
    timer.current = window.setInterval(() => {
      index += 1;
      setTyped(command.slice(0, index));
      if (index >= command.length) {
        clearTimer();
        window.setTimeout(() => setPhase('submitted'), 350);
        window.setTimeout(() => { setPhase('revealed'); setAutoPlay(false); }, 950);
      }
    }, 75);
  };

  const stepForward = () => {
    clearTimer();
    setAutoPlay(false);
    if (phase === 'ready') { setTyped(command); setPhase('typing'); }
    else if (phase === 'typing') setPhase('submitted');
    else setPhase('revealed');
  };

  useEffect(() => reset(), [command, output, cwd]);

  useEffect(() => () => clearTimer(), []);

  return <article className="panel per-command-animation">
    <div className="panel-heading"><span className="step-number"><Terminal size={15}/></span><div><h2>Watch this command happen</h2><p>See the command typed, Enter pressed, and the result highlighted.</p></div></div>
    <div className="command-animation-window">
      <div className="command-animation-titlebar"><div className="window-dots"><i/><i/><i/></div><span>student@robot-lab:{cwd.replace('/home/student', '~') || '/'}</span><span className="safe-label">SIMULATED</span></div>
      <div className="command-animation-body">
        <div className="command-animation-caption">{title}</div>
        <div className="command-animation-prompt"><span>student@robot-lab</span><b>:{cwd.replace('/home/student', '~') || '/'}</b><strong>$</strong><code>{typed || (phase === 'ready' ? '' : command)}</code>{phase === 'typing' && <i className="typing-caret"/>}</div>
        {phase === 'submitted' && <div className="enter-indicator">↵ Enter pressed</div>}
        {phase === 'revealed' && <div className="command-animation-result"><span className="result-label">OUTPUT · RESULT</span><pre>{output || '(No output — this command may change state silently.)'}</pre><p><b>What this tells you:</b> {command.trim() === 'pwd' ? 'The printed absolute path tells you exactly which directory the shell is currently in.' : 'Compare the output with your goal. Successful commands can change state without printing a message, so verify when appropriate.'}</p></div>}
        {phase === 'ready' && <div className="command-animation-placeholder">Press Play to watch the command execute step by step.</div>}
      </div>
    </div>
    <div className="command-animation-controls">
      <button className="button-primary" onClick={play}><Play size={14}/> {phase === 'revealed' ? 'Replay animation' : 'Play animation'}</button>
      <button className="button-secondary" onClick={stepForward} disabled={phase === 'revealed'}><SkipForward size={14}/> Next animation step</button>
      <button className="button-secondary" onClick={reset}><RotateCcw size={14}/> Reset</button>
    </div>
    <p className="command-animation-note">This is an animated terminal simulation for learning—not a real screen recording or a shell running on your device.</p>
  </article>;
}
