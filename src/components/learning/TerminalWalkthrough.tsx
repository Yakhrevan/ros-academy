import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, StepForward, Volume2 } from 'lucide-react';

type Scene = { command: string; output: string; location: string; title: string; explanation: string; };

const scenes: Scene[] = [
  { command: 'pwd', output: '/home/student', location: '/home/student', title: '1. Find your location', explanation: 'pwd means “print working directory”. It asks the shell to show the full path of the folder you are standing in. It reports your location; it does not move you.' },
  { command: 'ls', output: 'Desktop  Documents  projects  ros2_ws', location: '/home/student', title: '2. Look around', explanation: 'ls lists the entries inside your current directory. Here, ros2_ws is the example ROS 2 workspace. Seeing a folder in this list does not mean you have entered it yet.' },
  { command: 'cd ros2_ws', output: '(no output)', location: '/home/student/ros2_ws', title: '3. Enter the workspace', explanation: 'cd means “change directory”. ros2_ws is a relative path, so Linux looks for that folder inside your current location. A successful cd usually prints nothing; the location changes silently.' },
  { command: 'pwd', output: '/home/student/ros2_ws', location: '/home/student/ros2_ws', title: '4. Verify the change', explanation: 'Run pwd again instead of guessing. The path now ends in /ros2_ws, confirming that the shell moved into the workspace.' },
  { command: 'ls', output: 'README.md  build  install  log  src', location: '/home/student/ros2_ws', title: '5. Inspect the workspace', explanation: 'A typical built ROS 2 workspace may contain src (your source packages), build (build outputs), install (installed packages and setup scripts), and log (build logs). This training filesystem is illustrative, not your computer.' },
  { command: 'cd ..', output: '(no output)', location: '/home/student', title: '6. Go back one level', explanation: 'The two dots mean the parent directory. From /home/student/ros2_ws, cd .. returns to /home/student. This is different from cd ~, which returns to your home directory from almost anywhere.' }
];

export default function TerminalWalkthrough() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scene = scenes[index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setIndex(current => {
      if (current >= scenes.length - 1) { setPlaying(false); return current; }
      return current + 1;
    }), 4200);
    return () => window.clearInterval(timer);
  }, [playing]);

  const reset = () => { setIndex(0); setPlaying(false); };
  const next = () => { setPlaying(false); setIndex(current => Math.min(current + 1, scenes.length - 1)); };

  return <section className="panel terminal-walkthrough" aria-label="Animated Linux terminal walkthrough">
    <div className="panel-heading"><span className="step-number">WATCH</span><div><h2>Watch the terminal workflow</h2><p>A short animated walkthrough before you try it yourself.</p></div></div>
    <div className="walkthrough-screen">
      <div className="walkthrough-bar"><div className="window-dots"><i/><i/><i/></div><span>student@robot-lab: {scene.location.replace('/home/student', '~') || '/'}</span><span className="safe-label">SIMULATED</span></div>
      <div className="walkthrough-scene-title">{scene.title}</div>
      <div className="walkthrough-command"><span>$</span><code>{scene.command}</code><span className="walkthrough-cursor" /></div>
      <pre className={scene.output === '(no output)' ? 'muted-output' : ''}>{scene.output}</pre>
      <div className="walkthrough-location"><span>Current directory</span><code>{scene.location}</code></div>
    </div>
    <div className="walkthrough-explanation"><Volume2 size={17}/><p>{scene.explanation}</p></div>
    <div className="walkthrough-controls">
      <button className="button-primary" onClick={() => index === scenes.length - 1 ? reset() : setPlaying(value => !value)}>{playing ? <><Pause size={15}/> Pause walkthrough</> : index === scenes.length - 1 ? <><RotateCcw size={15}/> Replay</> : <><Play size={15}/> {index === 0 ? 'Play walkthrough' : 'Continue playback'}</>}</button>
      <button className="button-secondary" onClick={next} disabled={index === scenes.length - 1}><StepForward size={15}/> Next step</button>
      <button className="button-secondary" onClick={reset}><RotateCcw size={15}/> Start over</button>
    </div>
    <div className="walkthrough-progress" aria-label={'Step ' + (index + 1) + ' of ' + scenes.length}>{scenes.map((item, i) => <button key={item.command + i} className={i === index ? 'active' : i < index ? 'done' : ''} title={item.title} aria-label={item.title} onClick={() => { setPlaying(false); setIndex(i); }}/>)}</div>
    <p className="walkthrough-disclaimer">This is an animated, step-by-step terminal demonstration—not a prerecorded video. It is safe to replay and does not execute commands on your device.</p>
  </section>;
}
