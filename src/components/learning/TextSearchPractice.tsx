import { useMemo, useState } from 'react';
import { Search, FileSearch, RotateCcw, CheckCircle2 } from 'lucide-react';

type Tool='find'|'grep'|'wc'|'head'|'tail';
const tools:{id:Tool;command:string;title:string;help:string}[]=[
{id:'find',command:'find ~/ros2_ws/src -name "*.py"',title:'Find files by path and name',help:'find walks a directory tree and tests each entry against predicates. -name matches the filename pattern; quote the wildcard so the shell passes it to find instead of expanding it in the current directory.'},
{id:'grep',command:'grep -n "TODO" *.py',title:'Search file contents',help:'grep searches text for a pattern. -n includes line numbers. Quotes protect patterns that contain spaces or shell-special characters. Add -r for recursive searches when appropriate.'},
{id:'wc',command:'wc -l node.py',title:'Count lines, words, and bytes',help:'wc counts lines, words, bytes, or characters. -l prints line counts, useful for quickly estimating the size of a log or source file.'},
{id:'head',command:'head -n 20 node.py',title:'Inspect the beginning of a file',help:'head prints the first part of a file. -n 20 requests 20 lines, useful for checking imports, configuration headers, or the beginning of a log.'},
{id:'tail',command:'tail -n 30 robot.log',title:'Inspect recent log entries',help:'tail prints the end of a file. -n 30 shows the last 30 lines. tail -f follows appended lines in real time; stop it with Ctrl+C.'}
];
const samples:Record<Tool,string>={
find:'~/ros2_ws/src/robot_bringup/launch/bringup.launch.py\n~/ros2_ws/src/sensor_bridge/sensor_bridge/node.py\n~/ros2_ws/src/robot_description/scripts/validate_model.py',
grep:'node.py:14:# TODO: validate sensor timeout\nbridge.py:88:# TODO: report reconnect failure',
wc:'247 node.py',
head:'#!/usr/bin/env python3\n\"\"\"Bridge serial sensor data into ROS 2.\"\"\"\n\nimport rclpy\nfrom rclpy.node import Node\nfrom std_msgs.msg import String\n\nclass SensorBridge(Node):\n    def __init__(self):\n        super().__init__(\"sensor_bridge\")',
tail:'[INFO] [10:21:05] serial port opened\n[INFO] [10:21:06] sensor bridge started\n[WARN] [10:21:10] packet checksum mismatch\n[WARN] [10:21:11] packet checksum mismatch\n[ERROR] [10:21:12] sensor timeout after 3 retries'
};
export default function TextSearchPractice(){
 const [selected,setSelected]=useState<Tool>('find');
 const [pattern,setPattern]=useState('*.py');
 const [showBreakdown,setShowBreakdown]=useState(true);
 const [feedback,setFeedback]=useState('');
 const current=tools.find(t=>t.id===selected)!;
 const output=useMemo(()=>selected==='find'?samples.find.split('\n').filter(x=>x.split('/').pop()!.match(new RegExp('^'+pattern.replace(/[.+^$(){}|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$'))).join('\n')||'No matching files in this sample.':selected==='grep'?samples.grep.split('\n').filter(x=>x.toLowerCase().includes(pattern.toLowerCase())).join('\n')||'No matching lines in this sample.':samples[selected],[selected,pattern]);
 const reset=()=>{setSelected('find');setPattern('*.py');setShowBreakdown(true);setFeedback('');};
 return <section className="panel text-search-practice">
 <div className="panel-heading"><span className="step-number"><FileSearch size={15}/></span><div><h2>Find files, search code, and inspect logs</h2><p>Build practical command-line habits for navigating a ROS 2 workspace and finding the first useful error in a log.</p></div></div>
 <div className="text-search-tabs">{tools.map(t=><button key={t.id} className={selected===t.id?'active':''} onClick={()=>{setSelected(t.id);setFeedback('');setPattern(t.id==='find'?'*.py':t.id==='grep'?'TODO':t.id==='tail'?'':'');}}>{t.command}</button>)}</div>
 <div className="text-search-terminal"><div className="text-search-bar"><span>SIMULATED ROS 2 WORKSPACE</span><span>sample files and logs</span></div><div className="text-search-command"><b>$</b><code>{selected==='find'?'find ~/ros2_ws/src -name "'+pattern+'"':selected==='grep'?'grep -n "'+pattern+'" *.py':current.command}</code></div>{(selected==='find'||selected==='grep')&&<label className="text-search-filter"><Search size={14}/><span>{selected==='find'?'Filename pattern':'Text pattern'}</span><input value={pattern} onChange={e=>setPattern(e.target.value)}/></label>}<pre className="text-search-output">{output}</pre><div className="text-search-actions"><button className="button-secondary" onClick={()=>setShowBreakdown(v=>!v)}>{showBreakdown?'Hide token explanation':'Explain command tokens'}</button><button className="button-secondary" onClick={reset}><RotateCcw size={13}/> Reset</button></div>{showBreakdown&&<div className="text-search-breakdown">{current.command.split(' ').map(token=><div key={token}><code>{token}</code><span>{token==='find'?'Walk directories and evaluate file predicates':token==='grep'?'Search file contents for matching text':token==='wc'?'Count lines, words, or bytes':token==='head'?'Print the beginning of a file':token==='tail'?'Print the end of a file':token==='-name'?'Match filenames against a pattern':token==='-n'?'Option that specifies a line count or line numbers':token==='-l'?'Count lines':token==='TODO'?'Example search term':token==='*.py'?'Quoted wildcard pattern for Python filenames':'Path, file, or pattern argument'}</span></div>)}</div>}</div>
 <div className="text-search-explanation"><b>{current.title}</b><p>{current.help}</p><p><b>ROS workflow:</b> search package source for a node or launch file, inspect its opening lines, then inspect the latest log entries before editing code.</p><button className="button-primary" onClick={()=>setFeedback(selected==='tail'?'Start with the final ERROR or WARN line, then inspect earlier context. In a real terminal, tail -f robot.log follows new lines until Ctrl+C.':selected==='grep'?'A match identifies a line of text, not necessarily a runtime failure. Check the surrounding code and logs.':'Explain what the command is searching and why this option fits the task before running it.')}>Check practical tip</button>{feedback&&<p className="text-search-feedback"><CheckCircle2 size={15}/>{feedback}</p>}</div>
 <p className="command-animation-note">Sample output only. This lesson does not read your real workspace or files.</p>
 </section>;
}
