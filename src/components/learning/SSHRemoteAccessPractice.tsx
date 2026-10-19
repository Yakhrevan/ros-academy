import { useState } from 'react';
import { Monitor, KeyRound, Copy, ShieldCheck, RotateCcw, AlertTriangle } from 'lucide-react';

type Step='connect'|'copy'|'diagnose';
const lessons:{id:Step;command:string;title:string;description:string}[]=[
{id:'connect',command:'ssh student@192.168.1.42',title:'Connect to a remote Linux computer',description:'ssh opens an encrypted remote shell session. The username is the account on the remote computer, and the IP or hostname identifies the destination. The first connection may ask you to verify the host key fingerprint.'},
{id:'copy',command:'scp notes.txt student@192.168.1.42:~/',title:'Copy a file over SSH',description:'scp copies files over an SSH connection. This example sends notes.txt to the remote user’s home directory. Use the actual source path and destination account for your system.'},
{id:'diagnose',command:'ssh -v student@192.168.1.42',title:'Diagnose an SSH connection',description:'-v enables verbose diagnostic output. It helps identify whether the failure happens during name resolution, TCP connection, host-key verification, authentication, or remote session setup.'}
];
const outputs:Record<Step,string>={
connect:'The authenticity of host 192.168.1.42 cannot be established.\nED25519 key fingerprint is SHA256:EXAMPLE_ONLY.\nAre you sure you want to continue connecting (yes/no/[fingerprint])?\n\nAfter verified host key and successful authentication:\nstudent@robot-lab:~$',
copy:'student@192.168.1.42 password: [hidden]\nnotes.txt                                      100%  1842  1.8MB/s  00:00\n\nTransfer complete (illustrative).',
diagnose:'OpenSSH_9.x, debugging enabled\ndebug1: Connecting to 192.168.1.42 [192.168.1.42] port 22.\ndebug1: Connection established.\ndebug1: Offering public key: /home/student/.ssh/id_ed25519\ndebug1: Authentications that can continue: publickey,password\nstudent@192.168.1.42: Permission denied (publickey,password).'
};
export default function SSHRemoteAccessPractice(){
 const [selected,setSelected]=useState<Step>('connect');
 const [host,setHost]=useState('192.168.1.42');
 const [user,setUser]=useState('student');
 const [showBreakdown,setShowBreakdown]=useState(true);
 const [checked,setChecked]=useState<string[]>([]);
 const [feedback,setFeedback]=useState('');
 const current=lessons.find(x=>x.id===selected)!;
 const command=selected==='connect'?'ssh '+user+'@'+host:selected==='copy'?'scp notes.txt '+user+'@'+host+':~/':'ssh -v '+user+'@'+host;
 const reset=()=>{setSelected('connect');setHost('192.168.1.42');setUser('student');setShowBreakdown(true);setChecked([]);setFeedback('');};
 const checklist=['Confirm the remote computer is powered on and connected to the network.','Verify the IP address or hostname and the SSH service port.','Check that the remote account exists and is allowed to log in.','Verify host-key fingerprint through a trusted channel before accepting it.','Use the correct SSH key or password; never paste private keys into chat or a website.'];
 return <section className="panel ssh-practice">
  <div className="panel-heading"><span className="step-number"><Monitor size={15}/></span><div><h2>SSH, remote access, and file transfer</h2><p>Connect to a Raspberry Pi or robot computer, copy files, and diagnose authentication safely.</p></div></div>
  <div className="ssh-tabs">{lessons.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>{setSelected(item.id);setFeedback('');}}>{item.id==='connect'?'ssh':item.id==='copy'?'scp':'ssh -v'}</button>)}</div>
  <div className="ssh-terminal"><div className="ssh-terminal-bar"><span>SIMULATED SSH SESSION</span><span>example host · no network access</span></div>
   <div className="ssh-target-grid"><label>Remote username<input value={user} onChange={e=>setUser(e.target.value.replace(/[^a-zA-Z0-9_.-]/g,''))}/></label><label>Remote IP or hostname<input value={host} onChange={e=>setHost(e.target.value.replace(/[^a-zA-Z0-9.:-]/g,''))}/></label></div>
   <div className="ssh-command"><b>$</b><code>{command}</code></div><pre className="ssh-output">{outputs[selected]}</pre>
   <div className="ssh-actions"><button className="button-secondary" onClick={()=>setShowBreakdown(v=>!v)}>{showBreakdown?'Hide command breakdown':'Explain each token'}</button><button className="button-secondary" onClick={reset}><RotateCcw size={13}/> Reset</button></div>
   {showBreakdown&&<div className="ssh-breakdown">{command.split(' ').map((token)=><div key={token}><code>{token}</code><span>{token==='ssh'?'Secure Shell client':token==='scp'?'Secure copy client using SSH transport':token==='-v'?'Verbose diagnostics; prints connection/authentication steps':token===user+'@'+host?'Remote account and destination host':token==='notes.txt'?'Local file to send':token==='~/ '?'Destination directory in remote home':token.endsWith(':~/')?'Remote home-directory destination':'Command argument'}</span></div>)}</div>}
  </div>
  <div className="ssh-explanation"><b>{current.title}</b><p>{current.description}</p><div className="ssh-security"><ShieldCheck size={15}/><span>Never share private key files such as <code>~/.ssh/id_ed25519</code>. A public key ending in <code>.pub</code> is designed to be installed on a server; the private key must remain private.</span></div></div>
  <div className="ssh-checklist"><h3>Connection-failure checklist</h3><p>Mark each item as you verify it. These are troubleshooting steps, not automatic checks.</p>{checklist.map((item,i)=><label key={item} className={checked.includes(item)?'checked':''}><input type="checkbox" checked={checked.includes(item)} onChange={e=>setChecked(old=>e.target.checked?[...old,item]:old.filter(x=>x!==item))}/><span>{item}</span></label>)}<button className="button-primary" onClick={()=>setFeedback(checked.length===checklist.length?'Checklist complete. If SSH still fails, use ssh -v and classify the first meaningful error before changing configuration.':'Verify the remaining '+(checklist.length-checked.length)+' checklist item(s), then retry and inspect the first SSH error.')}>Review troubleshooting</button>{feedback&&<p className="ssh-feedback"><AlertTriangle size={15}/>{feedback}</p>}</div>
  <p className="command-animation-note">Sample output only. The lesson does not connect to a remote computer, transfer files, or read your SSH keys.</p>
 </section>;
}
