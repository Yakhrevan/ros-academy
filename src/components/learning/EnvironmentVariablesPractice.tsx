import { useState } from 'react';
import { GitBranch, RefreshCw, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';

type LessonKey = 'echo' | 'env' | 'export' | 'path' | 'source';
const lessons: {id:LessonKey;command:string;title:string;explanation:string}[] = [
  {id:'echo',command:'echo $ROS_DISTRO',title:'Read a variable',explanation:'The shell expands $ROS_DISTRO to the value stored in that variable, then echo prints the result. An empty line often means the variable is unset in this shell.'},
  {id:'env',command:'env',title:'Inspect the environment',explanation:'env prints environment variables as NAME=value pairs. A process receives a copy of its parent process environment when it starts.'},
  {id:'export',command:'export ROBOT_NAME=demo_bot',title:'Export a variable',explanation:'The assignment creates a shell variable and export marks it for inheritance by subsequently started child processes. Variable names are case-sensitive.'},
  {id:'path',command:'echo $PATH',title:'Understand command lookup',explanation:'PATH is a colon-separated list of directories. When you type a command without a slash, the shell searches these directories in order for an executable.'},
  {id:'source',command:'source /opt/ros/humble/setup.bash',title:'Load ROS 2 setup',explanation:'source executes the setup script in the current shell, so its environment changes remain available in that shell. Running the script as a separate process would not update your current shell.'}
];

export default function EnvironmentVariablesPractice() {
  const [selected, setSelected] = useState<LessonKey>('source');
  const [robotName, setRobotName] = useState('demo_bot');
  const [showFlow, setShowFlow] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const lesson = lessons.find(item=>item.id===selected)!;
  const command = selected==='export' ? 'export ROBOT_NAME='+robotName : lesson.command;
  const output = selected==='echo' ? (loaded ? 'humble' : '') : selected==='env' ? 'HOME=/home/student\nUSER=student\nROS_DISTRO='+(loaded?'humble':'(not set)')+'\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'+(loaded?':/opt/ros/humble/bin':'') : selected==='export' ? 'ROBOT_NAME='+robotName+'\n(available to child processes in this simulation)' : selected==='path' ? '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'+(loaded?':/opt/ros/humble/bin':'') : loaded ? 'ROS_DISTRO=humble\nAMENT_PREFIX_PATH=/opt/ros/humble\nPATH includes /opt/ros/humble/bin\nROS 2 environment loaded in this simulated shell.' : 'Before sourcing: ROS_DISTRO is not set in this simulated shell.';

  const choose=(id:LessonKey)=>{setSelected(id);setMessage('');};
  const run=()=>{if(selected==='source'){setLoaded(true);setMessage('Simulated setup sourced. ROS variables now appear in this lesson only.')}else if(selected==='export'){setMessage('Simulated variable exported to child processes.')}else{setMessage('Displayed illustrative output for the selected command.')}};
  const reset=()=>{setSelected('source');setRobotName('demo_bot');setShowFlow(true);setLoaded(false);setMessage('');};

  return <section className="panel environment-practice">
    <div className="panel-heading"><span className="step-number"><Terminal size={15}/></span><div><h2>Environment variables and ROS 2 setup</h2><p>Explore shell variables, PATH lookup, export, and why sourcing the ROS setup matters.</p></div></div>
    <div className="environment-tabs">{lessons.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>choose(item.id)}>{item.id==='path'?'$PATH':item.id==='source'?'source':item.id}</button>)}</div>
    <div className="environment-terminal">
      <div className="environment-terminal-bar"><span>SIMULATED BASH</span><span>Ubuntu 22.04 · ROS 2 Humble example</span></div>
      <div className="environment-command"><b>$</b><code>{command}</code></div>
      {selected==='export'&&<label className="environment-input">ROBOT_NAME value<input value={robotName} onChange={e=>setRobotName(e.target.value.replace(/[^a-zA-Z0-9_-]/g,''))} aria-label="Robot name variable value"/></label>}
      <pre className="environment-output">{output||'(empty output — this variable is not set in the simulated shell)'}</pre>
      <div className="environment-actions"><button className="button-primary" onClick={run}>{selected==='source'?'Source setup (simulate)':selected==='export'?'Export variable (simulate)':'Show command result'}</button><button className="button-secondary" onClick={()=>setShowFlow(v=>!v)}>{showFlow?'Hide execution flow':'Show execution flow'}</button><button className="button-secondary" onClick={reset}><RefreshCw size={13}/> Reset</button></div>
      {message&&<div className="environment-feedback"><CheckCircle2 size={15}/>{message}</div>}
    </div>
    {showFlow&&<div className="environment-flow"><div><small>1 · COMMAND</small><code>{selected==='source'?'source setup.bash':selected==='export'?'export NAME=value':selected==='path'?'echo $PATH':'echo / env'}</code></div><span>→</span><div><small>2 · SHELL ACTION</small><code>{selected==='source'?'Current shell changes':selected==='export'?'Mark variable exported':selected==='path'?'Search executable directories':'Expand variable / list values'}</code></div><span>→</span><div><small>3 · RESULT</small><code>{selected==='source'?'ROS variables available':selected==='export'?'Child process inherits value':selected==='path'?'Colon-separated lookup list':'Printed terminal output'}</code></div></div>}
    <div className="environment-explanation"><b>{lesson.title}</b><p>{lesson.explanation}</p>{selected==='source'&&<div className="environment-warning"><AlertTriangle size={15}/><span>On your Ubuntu 22.04 machine, use this command only if ROS 2 Humble is installed at <code>/opt/ros/humble</code>. This website demo does not access your computer.</span></div>}{selected==='path'&&<p><b>Important:</b> do not replace PATH with a single directory accidentally. Append or prepend while preserving the existing value, for example <code>export PATH="$HOME/bin:$PATH"</code>.</p>}</div>
    <p className="command-animation-note">All values and state changes are simulated for learning. The page does not source scripts or alter your actual shell environment.</p>
  </section>;
}
