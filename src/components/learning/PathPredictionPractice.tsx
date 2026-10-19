import { useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw } from 'lucide-react';

const challenges = [
  { start: '/home/student/ros2_ws', command: 'cd ..', answer: '/home/student', why: '..' + ' means the parent directory, so the final path loses the last segment, ros2_ws.' },
  { start: '/home/student', command: 'cd ./projects', answer: '/home/student/projects', why: './projects' + ' is relative to the current directory; it enters the projects folder inside /home/student.' },
  { start: '/home/student/ros2_ws/src', command: 'cd ~', answer: '/home/student', why: '~' + ' is shorthand for the current user’s home directory.' },
  { start: '/home/student', command: 'cd /var/log', answer: '/var/log', why: 'An absolute path starts at /, so the current location does not affect the destination.' },
  { start: '/home/student/ros2_ws', command: 'cd .', answer: '/home/student/ros2_ws', why: '.' + ' means the current directory; it does not move you.' }
];

export default function PathPredictionPractice() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState(false);
  const task = challenges[index];
  const options = [task.answer, '/home/student/ros2_ws', '/home/student', '/var/log', '/home/student/projects']
    .filter((value, i, all) => all.indexOf(value) === i)
    .sort((a, b) => (a === task.answer ? -1 : b === task.answer ? 1 : a.localeCompare(b)));

  const reset = () => { setIndex(0); setChoice(''); setChecked(false); };
  const next = () => { setIndex((current) => (current + 1) % challenges.length); setChoice(''); setChecked(false); };

  return <section className="panel path-prediction-practice">
    <div className="panel-heading"><span className="step-number"><CircleHelp size={15}/></span><div><h2>Predict the destination</h2><p>Think before you run the command. Choose the final working directory.</p></div></div>
    <div className="path-practice-context"><span>Starting directory</span><code>{task.start}</code><span>Command to run</span><code className="path-practice-command">$ {task.command}</code></div>
    <fieldset className="path-practice-options" disabled={checked}>
      <legend>Where will the shell be after this command?</legend>
      {options.map(option => <label className={choice === option ? 'selected' : ''} key={option}><input type="radio" name="path-prediction" value={option} checked={choice === option} onChange={() => setChoice(option)}/><code>{option}</code></label>)}
    </fieldset>
    {checked && <div className={'path-practice-feedback ' + (choice === task.answer ? 'correct' : 'incorrect')}><b>{choice === task.answer ? <><CheckCircle2 size={16}/> Correct prediction</> : 'Not quite — inspect the path again.'}</b><p><strong>Answer:</strong> <code>{task.answer}</code></p><p>{task.why}</p></div>}
    <div className="path-practice-controls">
      {!checked ? <button className="button-primary" disabled={!choice} onClick={() => setChecked(true)}>Check prediction</button> : <button className="button-primary" onClick={next}>Next challenge</button>}
      <button className="button-secondary" onClick={reset}><RotateCcw size={14}/> Restart practice</button>
    </div>
    <p className="command-animation-note">These are safe simulated paths. No commands run on your device.</p>
  </section>;
}
