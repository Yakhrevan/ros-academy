import { useState } from 'react';
import { BookOpen, FileText, Search, ChevronRight, RotateCcw } from 'lucide-react';

type ReaderCommand = 'cat' | 'head' | 'tail' | 'grep' | 'less';
const sample = [
  'from rclpy.node import Node',
  '',
  'class SensorBridge(Node):',
  '    def __init__(self):',
  '        super().__init__("sensor_bridge")',
  '        self.get_logger().info("Sensor bridge started")',
  '',
  'def main(args=None):',
  '    rclpy.init(args=args)',
  '    node = SensorBridge()',
  '    rclpy.spin(node)',
  '    node.destroy_node()',
  '    rclpy.shutdown()'
];

const modes: {id: ReaderCommand; label: string; command: string; help: string}[] = [
  { id: 'cat', label: 'Show entire file', command: 'cat sensor_bridge.py', help: 'cat prints the file contents to standard output. It is useful for short configuration files and source files.' },
  { id: 'head', label: 'Inspect the beginning', command: 'head -n 5 sensor_bridge.py', help: 'head shows the first lines. Use it to check imports, file headers, and the beginning of a log without printing the whole file.' },
  { id: 'tail', label: 'Inspect the end', command: 'tail -n 4 sensor_bridge.py', help: 'tail shows the last lines. It is useful for checking the latest entries in a log or the end of a script.' },
  { id: 'grep', label: 'Find matching lines', command: 'grep -n "get_logger" sensor_bridge.py', help: 'grep searches for matching text. The -n option prefixes each matching line with its line number.' },
  { id: 'less', label: 'Read page by page', command: 'less sensor_bridge.py', help: 'less opens an interactive pager in a real terminal. Use Space/Page Down to move forward, b/Page Up to go back, and q to quit.' }
];

function getOutput(mode: ReaderCommand) {
  if (mode === 'cat') return sample.map((line, i) => String(i + 1).padStart(2, ' ') + '  ' + line).join('\n');
  if (mode === 'head') return sample.slice(0, 5).map((line, i) => String(i + 1).padStart(2, ' ') + '  ' + line).join('\n');
  if (mode === 'tail') return sample.slice(-4).map((line, i) => String(sample.length - 3 + i).padStart(2, ' ') + '  ' + line).join('\n');
  if (mode === 'grep') return sample.map((line, i) => ({line, i})).filter(item => item.line.includes('get_logger')).map(item => (item.i + 1) + ':' + item.line).join('\n') || 'No matches found.';
  return sample.slice(0, 8).map((line, i) => String(i + 1).padStart(2, ' ') + '  ' + line).join('\n') + '\n\n-- More --  (visual pager preview; press q in a real terminal to quit)';
}

export default function FileReadingPractice() {
  const [mode, setMode] = useState<ReaderCommand>('cat');
  const [query, setQuery] = useState('get_logger');
  const selected = modes.find(item => item.id === mode)!;
  const output = mode === 'grep'
    ? sample.map((line, i) => ({line, i})).filter(item => item.line.toLowerCase().includes(query.toLowerCase())).map(item => (item.i + 1) + ':' + item.line).join('\n') || 'No matches found.'
    : getOutput(mode);

  return <section className="panel file-reading-practice">
    <div className="panel-heading"><span className="step-number"><BookOpen size={15}/></span><div><h2>Read source files and search their contents</h2><p>Use a small ROS-style Python node to compare common file-inspection commands.</p></div></div>
    <div className="file-reader-tabs">{modes.map(item => <button key={item.id} className={mode === item.id ? 'active' : ''} onClick={() => setMode(item.id)}>{item.label}</button>)}</div>
    <div className="file-reader-layout">
      <div className="file-reader-code">
        <div className="file-reader-title"><FileText size={15}/><span>sensor_bridge.py</span><small>illustrative source</small></div>
        <pre>{sample.map((line, i) => String(i + 1).padStart(2, ' ') + '  ' + line).join('\n')}</pre>
      </div>
      <div className="file-reader-result">
        <div className="file-reader-terminal-head"><span>SIMULATED TERMINAL</span><span>student@robot-lab</span></div>
        <div className="file-reader-command"><span>$</span><code>{mode === 'grep' ? 'grep -n "' + query + '" sensor_bridge.py' : selected.command}</code></div>
        {mode === 'grep' && <label className="file-reader-search"><Search size={14}/><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Text to search for" placeholder="Text to find, e.g. get_logger"/></label>}
        <pre className="file-reader-output">{output}</pre>
      </div>
    </div>
    <div className="file-reader-explanation"><span className="file-reader-badge">{selected.command}</span><p>{selected.help}</p>{mode === 'grep' && <p><b>Reading the result:</b> <code>6:</code> means the matching text is on line 6. Matching is case-sensitive in this example's underlying command unless you add <code>-i</code>.</p>}{mode === 'less' && <p><b>Pager controls:</b> Space/Page Down = next page, <code>b</code> = previous page, <code>/text</code> = search, <code>q</code> = quit.</p>}<div className="file-reader-next"><ChevronRight size={15}/> Try another command above, then predict what part of the file it will display.</div></div>
    <p className="command-animation-note">This is a visual lesson preview with sample source code. It does not read files from your computer or run ROS 2.</p>
  </section>;
}
