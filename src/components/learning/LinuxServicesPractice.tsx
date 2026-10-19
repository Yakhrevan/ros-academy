import { useState } from 'react';
import { Activity, CircleAlert, CheckCircle2, RotateCcw, FileText, Play } from 'lucide-react';

type Topic='status'|'logs'|'failure'|'restart';
const topics:{id:Topic;command:string;title:string;description:string}[]=[
{id:'status',command:'systemctl status robot-agent.service',title:'Read service status',description:'systemctl status shows whether a service is active, failed, or inactive, along with recent log lines and process information. The sample service is fictional; replace its name with a real unit on your machine.'},
{id:'logs',command:'journalctl -u robot-agent.service -n 30',title:'Read recent service logs',description:'journalctl queries the systemd journal. -u filters by unit and -n 30 limits output to the most recent 30 entries. Logs often reveal the first meaningful error before a service exits.'},
{id:'failure',command:'journalctl -u robot-agent.service -b --no-pager',title:'Investigate failures from this boot',description:'-b filters messages from the current boot, while --no-pager prints output directly. Look for missing files, permission problems, invalid configuration, unavailable devices, and dependency failures.'},
{id:'restart',command:'sudo systemctl restart robot-agent.service',title:'Restart a service after diagnosis',description:'restart asks systemd to stop and start the named service. It changes system state and may interrupt work. Check status and logs first; do not restart safety-critical robot services blindly.'}
];
const outputs:Record<Topic,string>={
status:'● robot-agent.service - Robot Agent (example)\n     Loaded: loaded (/etc/systemd/system/robot-agent.service; enabled)\n     Active: failed (Result: exit-code) since Mon 2026-10-19 10:24:31 IST\n    Process: 1420 ExecStart=/opt/robot/bin/robot-agent (code=exited, status=1/FAILURE)\n\nOct 19 10:24:31 robot-lab robot-agent[1420]: Config file not found: /etc/robot/agent.yaml',
logs:'Oct 19 10:24:30 robot-lab systemd[1]: Started Robot Agent (example).\nOct 19 10:24:31 robot-lab robot-agent[1420]: Loading configuration...\nOct 19 10:24:31 robot-lab robot-agent[1420]: Config file not found: /etc/robot/agent.yaml\nOct 19 10:24:31 robot-lab systemd[1]: robot-agent.service: Main process exited, code=exited, status=1/FAILURE\nOct 19 10:24:31 robot-lab systemd[1]: robot-agent.service: Failed with result \'exit-code\'.',
failure:'Oct 19 10:24:31 robot-lab robot-agent[1420]: Config file not found: /etc/robot/agent.yaml\nHint: check the configured path and file permissions.\n\nDo not create or edit system configuration until you confirm the intended file path and source.',
restart:'Restart requested for robot-agent.service (illustrative).\n\nNext verify: systemctl status robot-agent.service\nThen inspect: journalctl -u robot-agent.service -n 30'
};
export default function LinuxServicesPractice(){
 const [selected,setSelected]=useState<Topic>('status');
 const [showSteps,setShowSteps]=useState(true);
 const [checked,setChecked]=useState<string[]>([]);
 const [feedback,setFeedback]=useState('');
 const current=topics.find(t=>t.id===selected)!;
 const checklist=['Read systemctl status and note the active/failed state.','Find the first meaningful application error in the journal.','Verify the unit name, executable path, and configuration path.','Check user/group permissions and required devices or dependencies.','Only after diagnosis, decide whether a restart is safe.'];
 const reset=()=>{setSelected('status');setShowSteps(true);setChecked([]);setFeedback('');};
 return <section className="panel linux-services-practice">
  <div className="panel-heading"><span className="step-number"><Activity size={15}/></span><div><h2>Linux processes, systemd services, and logs</h2><p>Diagnose why a background service fails before restarting it or changing system configuration.</p></div></div>
  <div className="services-tabs">{topics.map(t=><button key={t.id} className={selected===t.id?'active':''} onClick={()=>{setSelected(t.id);setFeedback('');}}>{t.id==='status'?'status':t.id==='logs'?'journalctl -u':t.id==='failure'?'current boot':'restart'}</button>)}</div>
  <div className="services-terminal"><div className="services-terminal-bar"><span>SIMULATED SYSTEMD JOURNAL</span><span>robot-lab · example unit</span></div><div className="services-command"><b>$</b><code>{current.command}</code></div><pre className="services-output">{outputs[selected]}</pre><div className="services-actions"><button className="button-secondary" onClick={()=>setShowSteps(v=>!v)}>{showSteps?'Hide command breakdown':'Explain command tokens'}</button><button className="button-secondary" onClick={reset}><RotateCcw size={13}/> Reset</button></div>
   {showSteps&&<div className="services-breakdown">{current.command.split(' ').map((token)=><div key={token}><code>{token}</code><span>{token==='systemctl'?'Ask systemd to inspect or control a unit':token==='status'?'Read service state, process information, and recent messages':token==='journalctl'?'Query the systemd journal':token==='-u'?'Filter journal entries by unit name':token==='-n'?'Limit the number of recent entries':token==='30'?'Return the most recent 30 entries':token==='-b'?'Limit messages to the current boot':token==='--no-pager'?'Print directly without opening a pager':token==='restart'?'Stop and start the service; this changes system state':token==='sudo'?'Request authorized elevated privileges':'Service unit or argument'}</span></div>)}</div>}
  </div>
  <div className="services-explanation"><b>{current.title}</b><p>{current.description}</p>{selected==='restart'&&<div className="services-warning"><CircleAlert size={15}/><span>Robot services can control motors, sensors, or communications. Confirm the robot is in a safe state and that restarting the service will not interrupt an active operation.</span></div>}</div>
  <div className="services-triage"><h3>Failure-triage checklist</h3><p>Work through the evidence before changing anything.</p>{checklist.map(item=><label key={item} className={checked.includes(item)?'checked':''}><input type="checkbox" checked={checked.includes(item)} onChange={e=>setChecked(old=>e.target.checked?[...old,item]:old.filter(x=>x!==item))}/><span>{item}</span></label>)}<button className="button-primary" onClick={()=>setFeedback(checked.length===checklist.length?'Triage complete. Record the root cause, make the smallest justified change, then verify service status and logs again.':'Complete the remaining '+(checklist.length-checked.length)+' evidence check(s) before deciding on a fix.')}>Review triage</button>{feedback&&<p className="services-feedback"><CheckCircle2 size={15}/>{feedback}</p>}</div>
  <div className="services-quick-reference"><h3>Useful read-only checks</h3><pre>systemctl --failed\nsystemctl status robot-agent.service\njournalctl -u robot-agent.service -n 50\njournalctl -b -p warning</pre><p>Use a real service name on your own machine. Unit names and permissions vary by system.</p></div>
  <p className="command-animation-note">All output is illustrative. This lesson does not inspect, start, stop, or restart real services.</p>
 </section>;
}
