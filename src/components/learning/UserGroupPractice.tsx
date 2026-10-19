import { useState } from 'react';
import { Users, ShieldCheck, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

type Scenario='whoami'|'id'|'groups'|'ownership'|'sudo';
const scenarios:{id:Scenario;command:string;title:string;explain:string}[]=[
{id:'whoami',command:'whoami',title:'Identify the current user',explain:'whoami prints the effective username. It is a quick way to confirm which account a command is running as.'},
{id:'id',command:'id',title:'Inspect UID, primary GID, and supplementary groups',explain:'id reports user and group identifiers. Access checks use numeric IDs and group membership, not just the display names you expect.'},
{id:'groups',command:'groups',title:'List group membership',explain:'groups shows the groups associated with your current session. If you were just added to a group, an existing session may not reflect the change until you start a new session or refresh group membership.'},
{id:'ownership',command:'ls -l notes.txt',title:'Read owner and group columns',explain:'In a typical long listing, the owner and group appear after the permission bits. Ownership affects which rwx class is used for access checks.'},
{id:'sudo',command:'sudo -l',title:'Inspect permitted sudo commands',explain:'sudo -l lists commands the current user is permitted to run with sudo under the configured policy. Access depends on system policy; never assume every user has unrestricted sudo.'}
];
export default function UserGroupPractice(){
 const [selected,setSelected]=useState<Scenario>('id');
 const [username,setUsername]=useState('student');
 const [inRobotics,setInRobotics]=useState(true);
 const [inDialout,setInDialout]=useState(false);
 const [showTrace,setShowTrace]=useState(false);
 const [message,setMessage]=useState('');
 const current=scenarios.find(s=>s.id===selected)!;
 const groups=[...(inRobotics?['robotics']:[]),...(inDialout?['dialout']:[]),'student'];
 const reset=()=>{setSelected('id');setUsername('student');setInRobotics(true);setInDialout(false);setShowTrace(false);setMessage('');};
 const output=selected==='whoami'?username:selected==='id'?'uid=1000('+username+') gid=1000('+username+') groups=1000('+username+')'+(inRobotics?',1201(robotics)':'')+(inDialout?',20(dialout)':''):selected==='groups'?username+(groups.length?': '+groups.join(' '):''):selected==='ownership'?'-rw-r----- 1 root robotics 1842 Oct 19 10:30 notes.txt':'User '+username+' may run the following commands on robot-lab:\n    (ALL : ALL) /usr/bin/apt, /usr/bin/systemctl';
 return <section className="panel user-group-practice">
  <div className="panel-heading"><span className="step-number"><Users size={15}/></span><div><h2>Users, groups, ownership, and sudo policy</h2><p>Trace how Linux identifies a user and evaluates group membership before changing permissions.</p></div></div>
  <div className="user-command-tabs">{scenarios.map(s=><button key={s.id} className={selected===s.id?'active':''} onClick={()=>{setSelected(s.id);setMessage('');}}>{s.command}</button>)}</div>
  <div className="user-terminal"><div className="user-terminal-bar"><span>SIMULATED UBUNTU SHELL</span><span>robot-lab</span></div><div className="user-command"><b>$</b><code>{current.command}</code></div>
   <div className="user-controls"><label>Current user<input value={username} onChange={e=>setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g,'')||'student')}/></label><label className="user-check"><input type="checkbox" checked={inRobotics} onChange={e=>setInRobotics(e.target.checked)}/> Member of robotics</label><label className="user-check"><input type="checkbox" checked={inDialout} onChange={e=>setInDialout(e.target.checked)}/> Member of dialout</label></div>
   <pre className="user-output">{output}</pre>
   <div className="user-terminal-actions"><button className="button-secondary" onClick={()=>setShowTrace(v=>!v)}>{showTrace?'Hide access trace':'Trace the access check'}</button><button className="button-secondary" onClick={reset}><RotateCcw size={13}/> Reset</button></div>
   {showTrace&&<div className="user-trace"><b>How Linux reasons about access</b><p>1. Identify the process's effective UID and group IDs.</p><ArrowRight size={14}/><p>2. Compare them with the file owner and group.</p><ArrowRight size={14}/><p>3. Apply the matching owner, group, or others permission bits, along with directory traversal and any ACL/security-policy rules.</p></div>}
  </div>
  <div className="user-explanation"><b>{current.title}</b><p>{current.explain}</p>{selected==='ownership'&&<div className="user-owner-breakdown"><span><code>-rw-r-----</code> permission bits</span><span><code>root</code> owner</span><span><code>robotics</code> group</span></div>}{selected==='sudo'&&<div className="user-safety"><AlertTriangle size={15}/><span>This is illustrative sudo policy output. Do not edit sudoers directly; use <code>sudo visudo</code> when an authorized administrator must change policy.</span></div>}</div>
  <div className="user-group-exercise"><h3>Predict before you inspect</h3><p>A file is owned by <code>root:robotics</code> and has mode <code>640</code>. A user who belongs to <code>robotics</code> can read it, but cannot write it through these mode bits. Toggle group membership above and inspect <code>id</code> or <code>groups</code> to see the identity context.</p><button className="button-primary" onClick={()=>setMessage(inRobotics?'In this example, the user matches the file group and can read via group permission r--, but group write is disabled.':'The user is not in the robotics group in this example; the others permission is --- so the file is not accessible through these mode bits.')}>Check scenario</button>{message&&<p className="user-feedback"><ShieldCheck size={15}/>{message}</p>}</div>
  <p className="command-animation-note">Illustrative user IDs, groups, ownership, and sudo policy only. This simulator does not inspect real accounts or alter system access.</p>
 </section>;
}
