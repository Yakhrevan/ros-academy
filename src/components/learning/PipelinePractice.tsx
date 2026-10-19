import { useMemo, useState } from 'react';
import { GitBranch, Search, ArrowRight, RotateCcw } from 'lucide-react';

const logLines = [
  '[INFO] [controller]: Controller initialized',
  '[INFO] [sensor_bridge]: Sensor bridge started',
  '[WARN] [lidar_driver]: Scan rate below target',
  '[INFO] [navigation]: Waiting for map',
  '[ERROR] [camera_node]: Failed to open camera device',
  '[INFO] [sensor_bridge]: Publishing /imu/data',
  '[ERROR] [navigation]: Transform lookup timed out',
  '[WARN] [lidar_driver]: Packet delay detected',
  '[INFO] [navigation]: Goal accepted',
  '[ERROR] [sensor_bridge]: CAN frame timeout'
];

const examples = [
  { command: 'grep "ERROR" robot.log', explain: 'grep selects lines containing the text ERROR. The other log lines are filtered out.', input: 'robot.log' },
  { command: 'grep "ERROR" robot.log | wc -l', explain: 'The left command filters matching lines. The pipe sends those lines to wc -l, which counts them. Here the result is the number of error lines.', input: 'robot.log' },
  { command: 'grep "WARN" robot.log | sort', explain: 'grep keeps warning lines, then sort orders those remaining lines alphabetically. A pipeline passes text between commands; it does not pass file objects.', input: 'robot.log' },
  { command: 'grep -i "camera" robot.log', explain: 'The -i option makes the search case-insensitive, so Camera, CAMERA, and camera all match.', input: 'robot.log' }
];

export default function PipelinePractice() {
  const [example, setExample] = useState(1);
  const [query, setQuery] = useState('ERROR');
  const [showFlow, setShowFlow] = useState(true);
  const current = examples[example];
  const matching = useMemo(() => logLines.filter(line => example === 3 ? line.toLowerCase().includes(query.toLowerCase()) : line.includes(example === 2 ? 'WARN' : query)), [example, query]);
  const result = example === 1 ? String(logLines.filter(line => line.includes('ERROR')).length) : example === 2 ? matching.slice().sort((a,b)=>a.localeCompare(b)).join('\n') : matching.join('\n') || 'No matching lines.';
  const reset = () => { setExample(1); setQuery('ERROR'); setShowFlow(true); };

  return <section className="panel pipeline-practice">
    <div className="panel-heading"><span className="step-number"><GitBranch size={15}/></span><div><h2>Connect commands with pipes</h2><p>Follow text from a log file through filters and into a second command.</p></div></div>
    <div className="pipeline-examples">{examples.map((item,index)=><button key={item.command} className={example===index?'active':''} onClick={()=>setExample(index)}>{item.command}</button>)}</div>
    <div className="pipeline-terminal">
      <div className="pipeline-terminal-bar"><span>SIMULATED TERMINAL</span><span>robot.log · sample data</span></div>
      <div className="pipeline-command"><b>$</b><code>{current.command}</code></div>
      {example===3 && <label className="pipeline-search"><Search size={14}/><span>Search term</span><input value={query} onChange={e=>setQuery(e.target.value)} /></label>}
      {showFlow && <div className="pipeline-flow"><div><small>INPUT</small><code>robot.log</code><pre>{logLines.slice(0,4).join('\n')}<br/>…</pre></div><ArrowRight size={18}/><div><small>FILTER</small><code>{example===2?'grep "WARN"':example===3?'grep -i "'+query+'"':'grep "'+(example===0?'ERROR':query)+'"'}</code><pre>{matching.slice(0,3).join('\n')||'No matches'}{matching.length>3?'\n…':''}</pre></div>{example===1&&<><ArrowRight size={18}/><div><small>COUNT</small><code>wc -l</code><strong className="pipeline-count">{result}</strong></div></>}</div>}
      <div className="pipeline-result"><div><span>FINAL OUTPUT</span><button onClick={()=>setShowFlow(v=>!v)}>{showFlow?'Hide flow':'Show flow'}</button></div><pre>{result}</pre></div>
    </div>
    <div className="pipeline-explain"><b>How this works</b><p>{current.explain}</p><p><code>|</code> is the pipe operator. Standard output from the command on its left becomes standard input for the command on its right. Commands run in sequence through the pipeline.</p></div>
    <div className="pipeline-footer"><span><Search size={14}/> ROS debugging example: filter noisy logs before counting or inspecting errors.</span><button className="button-secondary" onClick={reset}><RotateCcw size={14}/> Reset</button></div>
    <p className="command-animation-note">Sample log data only. This pipeline is visualized for learning and does not run on your computer.</p>
  </section>;
}
