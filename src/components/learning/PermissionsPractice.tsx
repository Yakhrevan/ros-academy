import { useMemo, useState } from 'react';
import { ShieldCheck, LockKeyhole, Users, RotateCcw, AlertTriangle } from 'lucide-react';

type Permission = 'r'|'w'|'x'|'-';
const modes = [
 {id:'644',mode:'rw-r--r--',octal:'644',meaning:'Owner can read and write; group and others can only read.',bits:[1,1,0,1,0,0,1,0,0]},
 {id:'755',mode:'rwxr-xr-x',octal:'755',meaning:'Owner can read, write, and enter/execute; group and others can read and enter/execute.',bits:[1,1,1,1,0,1,1,0,1]},
 {id:'600',mode:'rw-------',octal:'600',meaning:'Only the owner can read and write. Group and others have no access.',bits:[1,1,0,0,0,0,0,0,0]},
 {id:'700',mode:'rwx------',octal:'700',meaning:'Only the owner can read, write, and execute/enter.',bits:[1,1,1,0,0,0,0,0,0]}
];
const roles=['Owner','Group','Others'];
const perms=['Read (r)','Write (w)','Execute (x)'];
const initial=[true,true,false,true,false,false,true,false,false];
export default function PermissionsPractice(){
 const [bits,setBits]=useState<boolean[]>(initial);
 const [fileType,setFileType]=useState<'file'|'directory'>('file');
 const [selected,setSelected]=useState('644');
 const [scenario,setScenario]=useState('owner');
 const [feedback,setFeedback]=useState('');
 const [username,setUsername]=useState('student');
 const [showSudo,setShowSudo]=useState(false);
 const octal=useMemo(()=>[0,3,6].map(start=>bits.slice(start,start+3).reduce((sum,on,i)=>sum+(on?[4,2,1][i]:0),0)).join(''),[bits]);
 const symbolic=useMemo(()=>bits.map((on,i)=>on?['r','w','x'][i%3]:'-').join(''),[bits]);
 const apply=(id:string)=>{const item=modes.find(x=>x.id===id)!;setBits(item.bits.map(Boolean));setSelected(id);setFeedback('');};
 const toggle=(i:number)=>{setBits(old=>old.map((v,j)=>i===j?!v:v));setSelected('custom');setFeedback('');};
 const check=()=>{
   if(scenario==='owner')setFeedback('Correct rule: the owner has read and write permission, so editing is allowed in this example.');
   else if(scenario==='group')setFeedback('Correct rule: the group has read permission only. Writing requires a write bit for the applicable identity class, or another valid access rule.');
   else if(scenario==='directory')setFeedback('Correct rule: directory execute (x) means search/traverse permission. Without it, a user may be unable to access entries even if the directory is readable.');
   else setFeedback('Correct rule: sudo can run an authorized command with elevated privileges, but it should not be used to bypass understanding or fix permissions blindly.');
 };
 const reset=()=>{setBits(initial);setFileType('file');setSelected('644');setScenario('owner');setFeedback('');setUsername('student');setShowSudo(false);};
 return <section className="panel permissions-practice">
  <div className="panel-heading"><span className="step-number"><LockKeyhole size={15}/></span><div><h2>Linux users, groups, permissions, and sudo</h2><p>Explore rwx permissions, calculate octal modes, and understand why access is denied.</p></div></div>
  <div className="permission-presets">{modes.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>apply(item.id)}><code>{item.octal}</code><span>{item.mode}</span></button>)}</div>
  <div className="permission-editor">
   <div className="permission-editor-head"><span>PERMISSION MATRIX</span><label>Target type<select value={fileType} onChange={e=>setFileType(e.target.value as 'file'|'directory')}><option value="file">Regular file</option><option value="directory">Directory</option></select></label></div>
   <div className="permission-grid"><div></div>{roles.map(role=><div className="permission-role" key={role}>{role}</div>)}{perms.map((perm,pi)=><div className="permission-row" key={perm}><span>{perm}</span>{roles.map((role,ri)=>{const i=ri*3+pi;return <label key={role+i} className={bits[i]?'permission-on':'permission-off'}><input type="checkbox" checked={bits[i]} onChange={()=>toggle(i)}/><code>{bits[i]?'rwx'[pi]:'-'}</code></label>})}</div>)}</div>
   <div className="permission-result"><div><small>SYMBOLIC MODE</small><code>{symbolic}</code></div><div><small>OCTAL MODE</small><strong>{octal}</strong></div><div><small>COMMAND</small><code>chmod {octal} {fileType==='directory'?'workspace':'notes.txt'}</code></div></div>
   <p className="permission-note">{fileType==='directory'?'For directories, r lists names, w creates/removes entries (subject to directory rules), and x allows traversal/search.':'For regular files, r reads contents, w modifies contents, and x allows execution when other requirements are met.'}</p>
  </div>
  <div className="permission-explanation"><h3>How octal permissions are calculated</h3><div className="permission-values"><span><b>r</b> = 4</span><span><b>w</b> = 2</span><span><b>x</b> = 1</span></div><p>Add the enabled values for each identity class independently. For <code>755</code>, owner <code>7 = 4+2+1</code>, group <code>5 = 4+1</code>, and others <code>5 = 4+1</code>.</p><p>Linux checks the process's effective user and groups. File ownership, parent-directory traversal, ACLs, mount options, and security policies can also affect access; mode bits are not the whole story.</p></div>
  <div className="permission-scenario"><h3>Check your understanding</h3><label>Scenario<select value={scenario} onChange={e=>{setScenario(e.target.value);setFeedback('');}}><option value="owner">Owner tries to edit a 644 file</option><option value="group">Group member tries to edit a 644 file</option><option value="directory">User can read a directory but lacks x</option><option value="sudo">A command says “Permission denied”</option></select></label><button className="button-primary" onClick={check}>Explain the correct rule</button>{feedback&&<p className="permission-feedback"><ShieldCheck size={15}/>{feedback}</p>}</div>
  <div className="permission-sudo"><button onClick={()=>setShowSudo(v=>!v)}><AlertTriangle size={15}/>{showSudo?'Hide sudo explanation':'When should sudo be used?'}</button>{showSudo&&<div><p><code>sudo</code> runs a command with privileges granted by system policy. It is appropriate for authorized administrative tasks, not as a default prefix for every command.</p><pre>sudo apt install package-name\nsudo systemctl status service-name</pre><p>Before running a privileged command, understand what it changes. Avoid <code>chmod -R 777</code> and avoid changing ownership recursively without a clear reason.</p></div>}</div>
  <p className="command-animation-note">All examples are simulated. The lesson does not change real file permissions or run sudo.</p>
 </section>;
}
