import { useMemo, useState } from 'react';
import { Package, Search, ShieldCheck, AlertTriangle, RotateCcw } from 'lucide-react';

type Tool = 'which' | 'whereis' | 'uname' | 'dpkg' | 'apt';
const examples: {id:Tool;command:string;title:string;explain:string}[]=[
{id:'which',command:'which ros2',title:'Find an executable',explain:'which searches directories in PATH and prints the executable it would find for this command. If there is no result, the executable may not be installed or its directory may not be on PATH.'},
{id:'whereis',command:'whereis ros2',title:'Locate related files',explain:'whereis searches standard locations for binary, source, and manual-page files. It is not a full-disk search and can return nothing for files outside its configured paths.'},
{id:'uname',command:'uname -a',title:'Inspect the kernel and system',explain:'uname reports kernel and machine information. It does not tell you which Ubuntu release is installed; use lsb_release -a or cat /etc/os-release for that.'},
{id:'dpkg',command:'dpkg -l | grep ros-humble',title:'Check installed Debian packages',explain:'dpkg -l lists packages known to the local Debian package database. grep filters that list. A package can be installed without a particular command being available on PATH.'},
{id:'apt',command:'apt list --installed',title:'Inspect installed packages',explain:'APT works with package repositories and dependency metadata. Listing packages is a read-only inspection task; installing or removing packages changes the system and should be done deliberately.'}
];
const outputs:Record<Tool,string>={
which:'/opt/ros/humble/bin/ros2',
whereis:'ros2: /opt/ros/humble/bin/ros2',
uname:'Linux robot-lab 6.8.0-xx-generic #xx-Ubuntu SMP x86_64 GNU/Linux',
dpkg:'ii  ros-humble-ros-base  0.10.0-1jammy.2024xxxx  amd64  ROS base metapackage',
apt:'Listing...\nros-humble-ros-base/jammy,now 0.10.0-1jammy amd64 [installed]\nros-humble-rclpy/jammy,now 3.x.x amd64 [installed]'
};
export default function PackageSystemInspectionPractice(){
 const [selected,setSelected]=useState<Tool>('which');
 const [query,setQuery]=useState('ros-humble');
 const [showDetails,setShowDetails]=useState(false);
 const [message,setMessage]=useState('');
 const current=examples.find(x=>x.id===selected)!;
 const output=useMemo(()=>selected==='dpkg'?outputs.dpkg.split('\n').filter(line=>line.toLowerCase().includes(query.toLowerCase())||query==='').join('\n')||'No matching installed package in this sample.':selected==='apt'?outputs.apt.split('\n').filter(line=>line.toLowerCase().includes(query.toLowerCase())||line==='Listing...'||query==='').join('\n')||'No matching installed package in this sample.':outputs[selected],[selected,query]);
 const reset=()=>{setSelected('which');setQuery('ros-humble');setShowDetails(false);setMessage('');};
 return <section className="panel package-inspection-practice">
  <div className="panel-heading"><span className="step-number"><Package size={15}/></span><div><h2>Inspect Linux, executables, and installed ROS packages</h2><p>Learn what is installed, where commands resolve, and which package database answers each question.</p></div></div>
  <div className="package-command-tabs">{examples.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>{setSelected(item.id);setMessage('');}}>{item.command}</button>)}</div>
  <div className="package-terminal"><div className="package-terminal-bar"><span>SIMULATED UBUNTU 22.04</span><span>ROS 2 HUMBLE EXAMPLE</span></div><div className="package-command"><b>$</b><code>{current.command}</code></div>
   {(selected==='dpkg'||selected==='apt')&&<label className="package-filter"><Search size={14}/><span>Filter sample output</span><input value={query} onChange={e=>setQuery(e.target.value)} /></label>}
   <pre className="package-output">{output}</pre>
   <div className="package-controls"><button className="button-secondary" onClick={()=>setShowDetails(v=>!v)}>{showDetails?'Hide command breakdown':'Explain command tokens'}</button><button className="button-secondary" onClick={reset}><RotateCcw size={13}/> Reset</button></div>
   {showDetails&&<div className="package-token-breakdown"><div><code>{current.command.split(' ')[0]}</code><span>Command/program being run</span></div>{current.command.split(' ').slice(1).map((token,i)=><div key={token+i}><code>{token}</code><span>{token==='|'?'Pipe: send left-side output to the next command':token==='-a'?'Option: include all uname information':token==='-l'?'Option: list package details':token==='--installed'?'Filter: show installed packages':token==='grep'?'Search lines for matching text':token==='ros-humble'?'Search term: match ROS Humble package names':token==='ros2'?'Executable name to resolve':token==='-l'?'Option: list packages':'Argument passed to the command'}</span></div>)}</div>}
  </div>
  <div className="package-explanation"><b>{current.title}</b><p>{current.explain}</p>{(selected==='apt'||selected==='dpkg')&&<div className="package-safety"><AlertTriangle size={15}/><span>Inspecting packages is safe. Commands such as <code>sudo apt install</code>, <code>sudo apt remove</code>, and <code>sudo apt upgrade</code> change the system; read the proposed package changes before confirming.</span></div>}{selected==='uname'&&<p><b>Ubuntu version check:</b> use <code>cat /etc/os-release</code>. Kernel version and distribution release are different facts.</p>}{selected==='which'&&<p><b>ROS tip:</b> if <code>which ros2</code> prints nothing, check <code>echo $ROS_DISTRO</code> and source the correct ROS setup script in the current shell.</p>}</div>
  <div className="package-real-world"><ShieldCheck size={15}/><span>Illustrative outputs only. This lesson does not query your machine, install packages, or modify the system.</span></div>
  <p className="command-animation-note">Try each command, inspect the output, and explain which tool you would use to answer a real troubleshooting question.</p>
 </section>;
}
