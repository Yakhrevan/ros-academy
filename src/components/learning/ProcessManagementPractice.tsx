import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CircleStop, RotateCcw, Search, ShieldCheck } from 'lucide-react';

type Process = { pid: number; user: string; cpu: string; memory: string; command: string; status: 'running' | 'sleeping' };
const initial: Process[] = [
  { pid: 1420, user: 'student', cpu: '0.4', memory: '1.2', command: 'ros2 launch demo_robot bringup.launch.py', status: 'running' },
  { pid: 1468, user: 'student', cpu: '2.1', memory: '3.4', command: 'ros2 run sensor_bridge sensor_bridge', status: 'running' },
  { pid: 1512, user: 'student', cpu: '0.0', memory: '0.8', command: 'robot_state_publisher', status: 'sleeping' },
  { pid: 1599, user: 'student', cpu: '0.3', memory: '1.1', command: 'rviz2', status: 'running' },
  { pid: 1710, user: 'student', cpu: '0.0', memory: '0.2', command: 'bash', status: 'sleeping' }
];

const lessons = [
  { command: 'ps aux', label: 'List processes', help: 'ps shows a snapshot of processes. PID is the process ID; %CPU and %MEM describe resource use; COMMAND shows what was started.' },
  { command: 'ps aux | grep sensor_bridge', label: 'Find one process', help: 'The pipe sends the process list to grep, which keeps lines containing sensor_bridge. In a real terminal, the grep process may also appear in its own results.' },
  { command: 'top', label: 'Monitor live usage', help: 'top refreshes a live process view. Press q to quit in a real terminal. This lesson shows a static, illustrative snapshot rather than live system telemetry.' },
  { command: 'kill -TERM 1468', label: 'Request graceful stop', help: 'SIGTERM asks a process to stop and gives it a chance to clean up. It does not guarantee immediate termination. Verify the PID before signaling it.' },
  { command: 'kill -KILL 1468', label: 'Force stop (concept only)', help: 'SIGKILL cannot be caught or handled by the target process. It prevents cleanup and should be a last resort. This demo never sends a real signal.' }
];

export default function ProcessManagementPractice() {
  const [index, setIndex] = useState(0);
  const [processes, setProcesses] = useState(initial);
  const [search, setSearch] = useState('sensor_bridge');
  const [confirmPid, setConfirmPid] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const task = lessons[index];
  const visible = useMemo(() => processes.filter(p => !search || (index === 1 ? p.command.toLowerCase().includes(search.toLowerCase()) : true)), [processes, search, index]);

  const run = () => {
    if (index === 3 || index === 4) {
      if (confirmPid === null) { setConfirmPid(1468); setMessage('Safety check: confirm the target PID and understand the signal before continuing.'); return; }
      setMessage(index === 3 ? 'Simulation: SIGTERM request shown for PID 1468. The process remains visible until a follow-up check confirms its state.' : 'Simulation: SIGKILL would force-stop PID 1468 without cleanup. No real signal was sent.');
      setConfirmPid(null);
      return;
    }
    setMessage(index === 0 ? 'Snapshot captured from illustrative training data.' : index === 1 ? 'Filtered the sample process list by command name.' : 'Static top-style snapshot shown. Real top refreshes continuously.');
  };

  const next = () => { setIndex(v => (v + 1) % lessons.length); setConfirmPid(null); setMessage(''); };
  const reset = () => { setIndex(0); setProcesses(initial); setSearch('sensor_bridge'); setConfirmPid(null); setMessage(''); };

  return <section className="panel process-management-practice">
    <div className="panel-heading"><span className="step-number"><Activity size={15}/></span><div><h2>Inspect and understand Linux processes</h2><p>Learn to find ROS 2 processes and read resource usage before considering any stop signal.</p></div></div>
    <div className="process-command-tabs">{lessons.map((lesson,i)=><button key={lesson.command} className={index===i?'active':''} onClick={()=>{setIndex(i);setConfirmPid(null);setMessage('');}}>{lesson.command}</button>)}</div>
    <div className="process-terminal">
      <div className="process-terminal-bar"><span>student@robot-lab · SIMULATED</span><span>sample process table</span></div>
      <div className="process-command-line"><b>$</b><code>{task.command}</code></div>
      {index===1&&<label className="process-search"><Search size={14}/><span>Filter</span><input value={search} onChange={e=>setSearch(e.target.value)} /></label>}
      {index===4&&<div className="process-danger-note"><AlertTriangle size={15}/> Force termination is destructive. Never use a PID copied from stale output; re-check the target first.</div>}
      <div className="process-table-wrap"><table className="process-table"><thead><tr><th>PID</th><th>USER</th><th>%CPU</th><th>%MEM</th><th>STATE</th><th>COMMAND</th></tr></thead><tbody>{visible.map(p=><tr key={p.pid}><td>{p.pid}</td><td>{p.user}</td><td>{p.cpu}</td><td>{p.memory}</td><td><span className={'process-state '+p.status}>{p.status}</span></td><td>{p.command}</td></tr>)}</tbody></table>{visible.length===0&&<p className="process-empty">No matching process in this sample.</p>}</div>
      {(index===3||index===4)&&<div className="process-confirm"><p><b>Target:</b> PID 1468 — <code>ros2 run sensor_bridge sensor_bridge</code></p><p>Only confirm in this simulation after checking that this is the intended process.</p>{confirmPid===null?<button className="button-primary" onClick={run}>Review target PID</button>:<><button className="button-primary" onClick={run}>{index===3?'Simulate SIGTERM request':'Explain SIGKILL effect'}</button><button className="button-secondary" onClick={()=>{setConfirmPid(null);setMessage('Action cancelled. No process was signalled.');}}>Cancel</button></>}</div>}
    </div>
    <div className="process-explanation"><span>{task.label}</span><p>{task.help}</p>{message&&<div className="process-feedback"><ShieldCheck size={15}/>{message}</div>}<div className="process-next"><span><b>Rule of thumb:</b> inspect first, identify the exact PID, then choose the least disruptive action.</span><button className="button-secondary" onClick={next}>Next example</button><button className="button-secondary" onClick={reset}><RotateCcw size={14}/> Reset</button></div></div>
    <p className="command-animation-note">All PIDs and metrics are fictional training data. No process is inspected, stopped, or signalled on your device.</p>
  </section>;
}
