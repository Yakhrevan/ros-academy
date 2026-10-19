import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, FileText, Folder, RotateCcw, ShieldCheck } from 'lucide-react';

type Entry = { name: string; type: 'file' | 'directory' };
const initialEntries: Entry[] = [
  { name: 'README.md', type: 'file' },
  { name: 'src', type: 'directory' },
  { name: 'launch', type: 'directory' },
  { name: 'config', type: 'directory' }
];

const tasks = [
  { command: 'mkdir test_folder', label: 'Create a folder', explanation: 'mkdir creates a new directory entry. It does not move the shell into that folder.', kind: 'mkdir' },
  { command: 'touch notes.txt', label: 'Create an empty file', explanation: 'touch creates an empty file when the name does not exist. Existing-file timestamp behavior is simplified in this training demo.', kind: 'touch' },
  { command: 'cp README.md README-backup.md', label: 'Copy a file', explanation: 'cp leaves the original file in place and creates a second entry with the copied content.', kind: 'cp' },
  { command: 'mv README-backup.md release-notes.md', label: 'Rename a file', explanation: 'mv can move an entry or rename it. Here it changes the filename; the original name disappears.', kind: 'mv' },
  { command: 'rm notes.txt', label: 'Remove a file', explanation: 'rm removes the selected entry. There is no recycle bin in this terminal simulation, so inspect the target before confirming.', kind: 'rm' }
] as const;

export default function FileOperationsPractice() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [index, setIndex] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const task = tasks[index];

  const runTask = () => {
    if (task.kind === 'rm' && !pendingDelete) {
      setPendingDelete(true);
      setMessage('Safety check: confirm the exact target before removing it.');
      return;
    }
    setEntries(previous => {
      let next = [...previous];
      if (task.kind === 'mkdir' && !next.some(e => e.name === 'test_folder')) next.push({ name: 'test_folder', type: 'directory' });
      if (task.kind === 'touch' && !next.some(e => e.name === 'notes.txt')) next.push({ name: 'notes.txt', type: 'file' });
      if (task.kind === 'cp' && next.some(e => e.name === 'README.md') && !next.some(e => e.name === 'README-backup.md')) next.push({ name: 'README-backup.md', type: 'file' });
      if (task.kind === 'mv' && next.some(e => e.name === 'README-backup.md') && !next.some(e => e.name === 'release-notes.md')) next = next.map(e => e.name === 'README-backup.md' ? { ...e, name: 'release-notes.md' } : e);
      if (task.kind === 'rm') next = next.filter(e => e.name !== 'notes.txt');
      return next;
    });
    setHistory(previous => [...previous, '$ ' + task.command]);
    setMessage(task.kind === 'rm' ? 'Removed notes.txt from the simulated workspace.' : task.kind === 'mv' ? 'Renamed the file in the simulated workspace.' : task.kind === 'cp' ? 'Created a separate copy; the original remains.' : task.kind === 'mkdir' ? 'Created test_folder in the simulated workspace.' : 'Created notes.txt in the simulated workspace.');
    setPendingDelete(false);
  };

  const reset = () => { setEntries(initialEntries); setIndex(0); setPendingDelete(false); setMessage('Workspace reset to the original training state.'); setHistory([]); };
  const next = () => { setIndex(current => (current + 1) % tasks.length); setPendingDelete(false); setMessage(''); };

  return <section className="panel file-operations-practice">
    <div className="panel-heading"><span className="step-number"><Copy size={15}/></span><div><h2>File operations: watch the workspace change</h2><p>Run safe examples and compare the virtual filesystem before and after each command.</p></div></div>
    <div className="file-ops-grid">
      <div className="file-ops-terminal">
        <div className="file-ops-terminal-bar"><span className="file-ops-dot"/><span className="file-ops-dot"/><span className="file-ops-dot"/><b>student@robot-lab: ~/ros2_ws/src/demo_robot</b></div>
        <div className="file-ops-terminal-body"><span className="file-ops-prompt">student@robot-lab:~/ros2_ws/src/demo_robot$</span><code>{task.command}</code>{history.map((line,i)=><div className="file-ops-history" key={line+i}>{line}</div>)}{message && <p className="file-ops-message">{message}</p>}</div>
      </div>
      <div className="file-ops-explanation"><span className="file-ops-kicker">CURRENT CHALLENGE</span><h3>{task.label}</h3><p>{task.explanation}</p><div className="file-ops-syntax"><span>Command</span><code>{task.command}</code></div><div className="file-ops-actions">{pendingDelete ? <><p className="file-ops-warning"><AlertTriangle size={15}/> This action removes <code>notes.txt</code> from the simulated workspace. Confirm only if that is the intended target.</p><button className="button-primary" onClick={runTask}>Confirm simulated removal</button><button className="button-secondary" onClick={() => {setPendingDelete(false);setMessage('Removal cancelled. The file remains in the workspace.');}}>Cancel</button></> : <button className="button-primary" onClick={runTask}>Run simulated command</button>}<button className="button-secondary" onClick={next}>Next operation</button><button className="button-secondary" onClick={reset}><RotateCcw size={14}/> Reset workspace</button></div></div>
    </div>
    <div className="file-ops-workspace-heading"><div><h3>Virtual workspace contents</h3><p>Every change below is local to this lesson's simulation.</p></div><span><ShieldCheck size={14}/> Safe sandbox</span></div>
    <div className="file-ops-entries">{entries.map(entry => <div className={'file-ops-entry ' + entry.type} key={entry.name}>{entry.type === 'directory' ? <Folder size={19}/> : <FileText size={19}/>}<code>{entry.name}</code><span>{entry.type === 'directory' ? 'Directory' : 'File'}</span></div>)}</div>
    {message && <div className="file-ops-status"><CheckCircle2 size={15}/><span>{message}</span></div>}
    <p className="command-animation-note">Training simulation only: it does not access or change files on your computer. Real Linux commands may behave differently with permissions, existing targets, or shell quoting.</p>
  </section>;
}
