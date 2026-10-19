import { useMemo, useState } from 'react';
import { Network, Wifi, Route, Activity, Search, RotateCcw, CheckCircle2 } from 'lucide-react';

type NetCmd='addr'|'route'|'ping'|'ss'|'curl';
const lessons:{id:NetCmd;command:string;title:string;explain:string}[]=[
{id:'addr',command:'ip addr',title:'Inspect network interfaces and IP addresses',explain:'ip addr shows network interfaces and their assigned addresses. Look for the interface state, IPv4 address/prefix, and loopback interface lo. An address alone does not prove that a remote host is reachable.'},
{id:'route',command:'ip route',title:'Inspect routing decisions',explain:'ip route shows the kernel routing table. The default route (often beginning with default via) identifies the next-hop gateway for destinations without a more specific route.'},
{id:'ping',command:'ping -c 4 192.168.1.42',title:'Test basic IP reachability',explain:'ping sends ICMP echo requests. -c 4 limits the command to four requests. A timeout can mean packet loss, filtering, an offline host, or a routing issue; it does not prove the application is broken.'},
{id:'ss',command:'ss -lntup',title:'Inspect listening sockets',explain:'ss displays socket information. -l means listening, -n numeric addresses/ports, -t TCP, -u UDP, and -p process information where permissions allow. ROS 2 commonly uses UDP for DDS discovery and traffic.'},
{id:'curl',command:'curl -I https://example.com',title:'Check an application endpoint',explain:'curl makes an application-layer request. -I requests response headers only. A successful HTTP response checks a different layer from ping: ICMP may be blocked even when a web service works.'}
];
const data:Record<NetCmd,string>={
addr:'1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8 scope host lo\n2: enp3s0: <BROADCAST,MULTICAST,UP>\n    inet 192.168.1.20/24 brd 192.168.1.255 scope global enp3s0\n3: wlan0: <BROADCAST,MULTICAST> state DOWN',
route:'default via 192.168.1.1 dev enp3s0 proto dhcp metric 100\n192.168.1.0/24 dev enp3s0 proto kernel scope link src 192.168.1.20',
ping:'PING 192.168.1.42 (192.168.1.42) 56(84) bytes of data.\n64 bytes from 192.168.1.42: icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from 192.168.1.42: icmp_seq=2 ttl=64 time=1.0 ms\n64 bytes from 192.168.1.42: icmp_seq=3 ttl=64 time=1.1 ms\n64 bytes from 192.168.1.42: icmp_seq=4 ttl=64 time=1.0 ms\n--- 192.168.1.42 ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss',
ss:'Netid State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process\nudp   UNCONN 0      0      0.0.0.0:7400      0.0.0.0:*\ntcp   LISTEN 0      128    127.0.0.1:8080    0.0.0.0:*\ntcp   LISTEN 0      128    0.0.0.0:22       0.0.0.0:*',
curl:'HTTP/2 200\ncontent-type: text/html; charset=UTF-8\ncache-control: max-age=0\nserver: example-server'
};
export default function NetworkingPractice(){
 const [selected,setSelected]=useState<NetCmd>('addr');
 const [host,setHost]=useState('192.168.1.42');
 const [showFlow,setShowFlow]=useState(true);
 const [feedback,setFeedback]=useState('');
 const current=lessons.find(x=>x.id===selected)!;
 const output=useMemo(()=>selected==='ping'?data.ping.replace(/192\.168\.1\.42/g,host||'192.168.1.42'):data[selected],[selected,host]);
 const reset=()=>{setSelected('addr');setHost('192.168.1.42');setShowFlow(true);setFeedback('');};
 return <section className="panel networking-practice">
  <div className="panel-heading"><span className="step-number"><Network size={15}/></span><div><h2>Linux networking and robot connectivity</h2><p>Trace interfaces, routes, reachability, sockets, and application responses layer by layer.</p></div></div>
  <div className="network-command-tabs">{lessons.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>{setSelected(item.id);setFeedback('');}}>{item.command}</button>)}</div>
  <div className="network-terminal"><div className="network-terminal-bar"><span>SIMULATED UBUNTU NETWORK</span><span>robot-lab · sample data</span></div><div className="network-command"><b>$</b><code>{selected==='ping'?'ping -c 4 '+(host||'192.168.1.42'):current.command}</code></div>
   {selected==='ping'&&<label className="network-host"><Search size={14}/><span>Target IP</span><input value={host} onChange={e=>setHost(e.target.value)} aria-label="Ping target IP"/></label>}
   <pre className="network-output">{output}</pre>
   <div className="network-actions"><button className="button-secondary" onClick={()=>setShowFlow(v=>!v)}>{showFlow?'Hide network flow':'Show network flow'}</button><button className="button-secondary" onClick={reset}><RotateCcw size={13}/> Reset</button></div>
  </div>
  {showFlow&&<div className="network-flow">{(selected==='addr'?[['INTERFACE','enp3s0'],['ADDRESS','192.168.1.20/24'],['LOCAL NETWORK','192.168.1.0/24']]:selected==='route'?[['DESTINATION','Remote host'],['NEXT HOP','192.168.1.1'],['INTERFACE','enp3s0']]:selected==='ping'?[['SOURCE','192.168.1.20'],['TARGET',host||'192.168.1.42'],['RESULT','ICMP replies']]:selected==='ss'?[['APPLICATION','ROS / service'],['SOCKET','TCP or UDP'],['PORT','Listening endpoint']]:[['CLIENT','curl'],['PROTOCOL','HTTPS'],['RESPONSE','HTTP headers']]).map((item)=><div key={item[0]}><small>{item[0]}</small><code>{item[1]}</code></div>)}</div>}
  <div className="network-explanation"><b>{current.title}</b><p>{current.explain}</p>{selected==='ss'&&<p><b>ROS 2 note:</b> DDS discovery and data traffic often use UDP. Firewall rules, interface selection, domain ID, and DDS configuration can affect discovery even when basic IP connectivity works.</p>}{selected==='route'&&<p><b>Prefix example:</b> <code>/24</code> is commonly equivalent to mask <code>255.255.255.0</code>. Hosts in the same subnet can often communicate directly; off-subnet traffic normally uses a route.</p>}{selected==='ping'&&<p><b>Debugging order:</b> inspect <code>ip addr</code>, then <code>ip route</code>, then test the destination. Use the real robot's actual IP rather than assuming this sample address.</p>}<button className="button-primary" onClick={()=>setFeedback(selected==='ping'?'A ping test checks ICMP reachability only; if it fails, inspect addressing, routes, firewall rules, and whether the target responds to ICMP.':selected==='ss'?'A listening socket proves a process has bound an endpoint; it does not by itself prove a remote client can connect.':'Identify which layer this command tests, then compare its result with the next layer.')}>Check troubleshooting insight</button>{feedback&&<p className="network-feedback"><CheckCircle2 size={15}/>{feedback}</p>}</div>
  <p className="command-animation-note">Illustrative output only. The simulator does not inspect your network, send packets, or contact remote services.</p>
 </section>;
}
