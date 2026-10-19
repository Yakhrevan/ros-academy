import type { CommandStep } from '../../types/commandLesson';

export type TerminalResult = {
  command: string;
  output: string;
  status: string;
  cwd: string;
};

type SimulatedFileSystem = Record<string, string[]>;

const FS: SimulatedFileSystem = {
  '/': ['bin', 'dev', 'etc', 'home', 'opt', 'tmp', 'usr', 'var'],
  '/home': ['student'],
  '/home/student': ['.bashrc', 'Desktop', 'Documents', 'projects', 'ros2_ws'],
  '/home/student/Desktop': [],
  '/home/student/Documents': ['notes.txt'],
  '/home/student/projects': ['robot-dashboard', 'sensor-tools', 'coding-practice-lab', 'enterprise-amr-demo'],
  '/home/student/projects/coding-practice-lab': ['README.md', 'python-basics', 'linux-labs'],
  '/home/student/projects/coding-practice-lab/python-basics': ['hello.py', 'loops.py'],
  '/home/student/projects/coding-practice-lab/linux-labs': ['navigation.md', 'permissions.md'],
  '/home/student/projects/enterprise-amr-demo': ['README.md', 'src', 'config', 'launch'],
  '/home/student/projects/enterprise-amr-demo/src': ['amr_controller.cpp', 'sensor_bridge.py'],
  '/home/student/projects/enterprise-amr-demo/config': ['robot.yaml'],
  '/home/student/projects/enterprise-amr-demo/launch': ['bringup.launch.py'],
  '/home/student/ros2_ws': ['README.md', 'build', 'install', 'log', 'src'],
  '/home/student/ros2_ws/build': [],
  '/home/student/ros2_ws/install': ['setup.bash'],
  '/home/student/ros2_ws/log': [],
  '/home/student/ros2_ws/src': ['demo_robot', 'my_robot_bringup'],
  '/home/student/ros2_ws/src/demo_robot': ['package.xml', 'src', 'launch', 'config'],
  '/home/student/ros2_ws/src/demo_robot/src': [],
  '/home/student/ros2_ws/src/demo_robot/launch': [],
  '/home/student/ros2_ws/src/demo_robot/config': [],
  '/home/student/ros2_ws/src/my_robot_bringup': ['package.xml', 'launch', 'config'],
  '/home/student/ros2_ws/src/my_robot_bringup/launch': [],
  '/home/student/ros2_ws/src/my_robot_bringup/config': [],
  '/etc': ['hostname', 'hosts', 'network'],
  '/dev': ['null', 'ttyUSB0', 'video0'],
  '/opt': ['ros'],
  '/opt/ros': ['humble'],
  '/opt/ros/humble': ['bin', 'setup.bash', 'share'],
  '/tmp': [],
  '/usr': ['bin', 'lib', 'share'],
  '/var': ['log', 'tmp']
};

function normalizePath(path: string): string {
  const parts: string[] = [];
  path.split('/').forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') parts.pop();
    else parts.push(part);
  });
  return '/' + parts.join('/');
}

function resolvePath(target: string, cwd: string): string {
  if (target === '~') return '/home/student';
  if (target.startsWith('~/')) return normalizePath('/home/student/' + target.slice(2));
  if (target.startsWith('/')) return normalizePath(target);
  return normalizePath((cwd === '/' ? '' : cwd) + '/' + target);
}

function shellQuoteTrim(value: string): string {
  return value.replace(/^['"]|['"]$/g, '');
}

function directoryEntries(cwd: string, all = false): string[] {
  const entries = FS[cwd] ?? [];
  return all ? entries : entries.filter((entry) => !entry.startsWith('.'));
}

let previousDirectory = '/home/student';
let simulatedRosDistro = '';
const virtualFileContents: Record<string, string> = {
  '/home/student/Documents/notes.txt': 'Remember to source the ROS 2 setup file before using ROS CLI tools.\n',
  '/home/student/ros2_ws/README.md': '# Robot workspace\nA simulated ROS 2 learning project.\n',
  '/home/student/ros2_ws/src/demo_robot/package.xml': '<package format="3"><name>demo_robot</name></package>\n',
  '/home/student/projects/coding-practice-lab/README.md': '# Coding practice lab\nExercises for robotics developers.\n',
  '/home/student/projects/coding-practice-lab/python-basics/hello.py': 'print("Hello, robotics!")\n',
};

export function executeCommand(raw: string, cwd: string, steps: CommandStep[]): TerminalResult {
  const command = raw.trim();
  if (!command) return { command, output: '', status: 'Type a command first.', cwd };

  if (command === 'help') return { command, output: 'Navigation: pwd, ls, cd DIR, cd .., cd ~, cd -\\nFiles: mkdir DIR, touch FILE, cat FILE, cp SRC DEST, mv SRC DEST, rm FILE\\nEnvironment: whoami, env, printenv, echo $HOME, echo $ROS_DISTRO, source /opt/ros/humble/setup.bash\\nDiagnostics: ps -ef, free -h, uptime, ip addr, ip route, lsblk, dmesg\\nROS: ros2 node list, ros2 topic list\\nAll commands are simulated; nothing runs on your computer.', status: 'Displayed supported command groups for this virtual terminal.', cwd };
  if (command === 'clear') return { command, output: '', status: 'Terminal output cleared.', cwd };
  if (command === 'pwd') return { command, output: cwd, status: 'Printed the current working directory. No state changed.', cwd };
  if (command === 'whoami') return { command, output: 'student', status: 'Displayed the current simulated user.', cwd };
  if (command === 'echo $PWD') return { command, output: cwd, status: 'Expanded PWD in the current simulated shell.', cwd };
  if (command === 'echo $HOME') return { command, output: '/home/student', status: 'Expanded HOME in the current simulated shell.', cwd };
  if (command === 'echo $ROS_DISTRO') return { command, output: simulatedRosDistro, status: simulatedRosDistro ? 'ROS_DISTRO is set in the simulated shell.' : 'ROS_DISTRO is not set in this simulated shell. Source the ROS setup file to set it.', cwd };
  if (command === 'echo $PATH') return { command: command, output: '/opt/ros/humble/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin', status: 'Printed the simulated PATH variable.', cwd };
  if (command.startsWith('echo ')) return { command, output: shellQuoteTrim(command.slice(5)), status: 'echo writes the supplied text to stdout.', cwd };

  if (command === 'cd' || command === 'cd ~') { previousDirectory = cwd; return { command, output: '', status: 'Directory changed to /home/student. Successful cd normally prints no stdout.', cwd: '/home/student' }; }
  if (command === 'cd -') {
    const next = previousDirectory && previousDirectory !== cwd ? previousDirectory : '/home/student';
    return { command, output: next, status: 'Switched to the previous working directory. The printed path is normal for cd -.', cwd: next };
  }
  if (command.startsWith('cd ')) {
    const target = command.slice(3).trim();
    const next = resolvePath(target, cwd);
    if (!FS[next]) return { command, output: '', status: 'No such directory in the virtual filesystem: ' + next + '. The current directory did not change; run pwd and ls to recover.', cwd };
    previousDirectory = cwd;
    return { command, output: '', status: 'Directory changed to ' + next + '. Run pwd to verify it.', cwd: next };
  }

  // File operations mutate only the in-memory training filesystem; no host files are touched.
  if (/^mkdir\s+/.test(command)) {
    const args = command.replace(/^mkdir\s+/, '').split(/\s+/);
    const parents = args[0] === '-p';
    const targets = parents ? args.slice(1) : args;
    if (!targets.length) return { command, output: '', status: 'Usage: mkdir [-p] DIRECTORY', cwd };
    for (const target of targets) {
      const path = resolvePath(shellQuoteTrim(target), cwd);
      const name = path.split('/').pop() || '';
      const parent = path.slice(0, path.lastIndexOf('/')) || '/';
      if (FS[path]) {
        if (parents) continue;
        return { command, output: '', status: 'mkdir: cannot create directory: already exists: ' + path, cwd };
      }
      if (!FS[parent]) return { command, output: '', status: 'mkdir: parent directory does not exist: ' + parent + '. Create or navigate to the parent first.', cwd };
      FS[path] = [];
      if (!FS[parent].includes(name)) FS[parent].push(name);
    }
    return { command, output: '', status: 'Directory created in the virtual training filesystem. Run ls to verify.', cwd };
  }

  if (/^touch\s+/.test(command)) {
    const targets = command.replace(/^touch\s+/, '').split(/\s+/);
    for (const target of targets) {
      const path = resolvePath(shellQuoteTrim(target), cwd);
      const name = path.split('/').pop() || '';
      const parent = path.slice(0, path.lastIndexOf('/')) || '/';
      if (!FS[parent]) return { command, output: '', status: 'touch: parent directory does not exist: ' + parent, cwd };
      if (FS[path]) return { command, output: '', status: 'touch: this training simulator only creates new sample files; entry already exists: ' + path, cwd };
      FS[path] = [];
      (FS[parent] ??= []).push(name);
    }
    return { command, output: '', status: 'Empty file created in the virtual training filesystem. Run ls to verify.', cwd };
  }

  if (/^(cp|mv)\s+/.test(command)) {
    const [operation, ...args] = command.split(/\s+/);
    if (args.length !== 2) return { command, output: '', status: 'Usage: ' + operation + ' SOURCE DESTINATION (this starter simulator supports one source and one destination).', cwd };
    const source = resolvePath(shellQuoteTrim(args[0]), cwd);
    const destination = resolvePath(shellQuoteTrim(args[1]), cwd);
    const sourceParent = source.slice(0, source.lastIndexOf('/')) || '/';
    const sourceName = source.split('/').pop() || '';
    const destinationIsDirectory = !!FS[destination];
    const finalPath = destinationIsDirectory ? normalizePath(destination + '/' + sourceName) : destination;
    const finalParent = finalPath.slice(0, finalPath.lastIndexOf('/')) || '/';
    const finalName = finalPath.split('/').pop() || '';
    if (!FS[sourceParent]?.includes(sourceName) || !Object.prototype.hasOwnProperty.call(FS, source)) return { command, output: '', status: operation + ': source not found in virtual filesystem: ' + source, cwd };
    if (!FS[finalParent]) return { command, output: '', status: operation + ': destination parent does not exist: ' + finalParent, cwd };
    if (FS[finalPath] || FS[finalParent].includes(finalName)) return { command, output: '', status: operation + ': destination already exists: ' + finalPath, cwd };
    FS[finalPath] = [...(FS[source] ?? [])];
    FS[finalParent].push(finalName);
    if (operation === 'mv') {
      delete FS[source];
      FS[sourceParent] = FS[sourceParent].filter((entry) => entry !== sourceName);
    }
    return { command, output: '', status: operation === 'cp' ? 'Copied the entry in the virtual training filesystem.' : 'Moved/renamed the entry in the virtual training filesystem.', cwd };
  }

  if (/^rm\s+/.test(command)) {
    const args = command.replace(/^rm\s+/, '').split(/\s+/);
    const recursive = args[0] === '-r' || args[0] === '-rf' || args[0] === '-fr';
    const targets = recursive ? args.slice(1) : args;
    for (const target of targets) {
      const path = resolvePath(shellQuoteTrim(target), cwd);
      const name = path.split('/').pop() || '';
      const parent = path.slice(0, path.lastIndexOf('/')) || '/';
      if (!FS[parent]?.includes(name) || !Object.prototype.hasOwnProperty.call(FS, path)) return { command, output: '', status: 'rm: cannot remove: no such entry in virtual filesystem: ' + path, cwd };
      if (FS[path].length && !recursive) return { command, output: '', status: 'rm: cannot remove ' + path + ': is a directory. This simulator requires rm -r for directories; inspect carefully before using it.', cwd };
      if (recursive) {
        const prefix = path + '/';
        Object.keys(FS).filter((entry) => entry === path || entry.startsWith(prefix)).forEach((entry) => delete FS[entry]);
      } else delete FS[path];
      FS[parent] = (FS[parent] ?? []).filter((entry) => entry !== name);
    }
    return { command, output: '', status: 'Entry removed from the virtual training filesystem only. Verify with ls.', cwd };
  }

  if (/^ls(?:\s|$)/.test(command)) {
    const args = command.split(/\s+/).slice(1);
    const flags = args.filter((arg) => arg.startsWith('-'));
    const targets = args.filter((arg) => !arg.startsWith('-'));
    const targetPath = targets.length ? resolvePath(targets[0], cwd) : cwd;
    const all = flags.some((flag) => flag.includes('a'));
    const detailed = flags.some((flag) => flag.includes('l'));
    if (!Object.prototype.hasOwnProperty.call(FS, targetPath)) return { command, output: '', status: 'ls: cannot access ' + targetPath + ': no such entry in the virtual filesystem.', cwd };
    if (!FS[targetPath]) {
      const name = targetPath.split('/').pop() || targetPath;
      return { command, output: detailed ? '-rw-r--r-- 1 student student 0 ' + name : name, status: 'Listed the requested virtual file. The working directory did not change.', cwd };
    }
    const entries = directoryEntries(targetPath, all);
    if (detailed) {
      const rows = entries.map((entry) => (FS[normalizePath(targetPath + '/' + entry)] ? 'drwxr-xr-x' : '-rw-r--r--') + '  student student  ' + entry);
      return { command, output: '.  ..\n' + rows.join('\n'), status: 'Listed virtual directory entries with simplified illustrative metadata.', cwd };
    }
    return { command, output: entries.join('  ') || '(empty directory)', status: 'Listed entries in ' + targetPath + '. The working directory did not change.', cwd };
  }

  if (command === 'ls -l deploy.sh') return { command, output: '-rw-r--r-- 1 student student 128 deploy.sh', status: 'Illustrative metadata only.', cwd };
  if (command === 'chmod u+x deploy.sh') return { command, output: '', status: 'Simulated only: owner execute bit added for the lesson; no real file was modified.', cwd };
  if (command === 'ps -ef' || command === 'ps aux') return { command, output: 'UID  PID  COMMAND\nroot  1    systemd\nstudent 721 bash\nstudent 1042 demo_node (simulated)', status: 'Process listing is fabricated for training; no host processes were inspected.', cwd };
  if (command === 'kill -TERM 1042' || command === 'kill -TERM <pid>') return { command, output: '', status: 'Simulated SIGTERM request for demo_node. No real process was signalled.', cwd };
  if (command === 'free -h') return { command, output: 'Mem: 7.7Gi total  1.8Gi used  4.1Gi free (simulated)', status: 'Invented memory values; no machine metrics were queried.', cwd };
  if (command === 'uptime') return { command, output: '08:12:34 up 3 days, 4:21, 2 users, load average: 0.32, 0.27, 0.21 (illustrative)', status: 'Illustrative uptime/load values, not measurements from your device.', cwd };
  if (command === 'who -b') return { command, output: 'system boot  2026-10-16 03:51 (illustrative)', status: 'Illustrative boot timestamp.', cwd };
  if (command === 'systemd-analyze time') return { command, output: 'Startup finished in 4.2s (firmware) + 1.1s (loader) + 2.8s (kernel) + 7.4s (userspace) = 15.5s (illustrative)', status: 'Timing components depend on actual firmware and system support.', cwd };
  if (command === 'systemd-analyze blame | head') return { command, output: '4.2s NetworkManager-wait-online.service\n2.1s robot-bringup.service\n1.4s systemd-udev-settle.service (illustrative)', status: 'Illustrative services and timings.', cwd };
  if (command === 'systemctl get-default') return { command, output: 'graphical.target (illustrative)', status: 'Example default target, not queried from your computer.', cwd };
  if (command === 'systemctl --failed') return { command, output: '0 loaded units listed (illustrative)', status: 'No actual systemd manager was queried.', cwd };
  if (command.startsWith('systemctl status ')) return { command, output: command.split(' ').slice(-1)[0] + ' - service (simulated status)', status: 'Simulated service state only.', cwd };
  if (command.startsWith('journalctl')) return { command, output: 'Oct 19 08:01:03 robot-lab systemd[1]: illustrative service message', status: 'Illustrative journal line; no system logs were read.', cwd };
  if (command.startsWith('systemd-analyze blame')) return { command, output: '2.1s robot-bringup.service\n1.4s systemd-udev-settle.service (illustrative)', status: 'Illustrative boot timing.', cwd };
  if (command === 'ip addr' || command === 'ip address show') return { command, output: 'lo: 127.0.0.1/8\nwlan0: 192.168.1.42/24 (illustrative)', status: 'Example interfaces; no network state was queried.', cwd };
  if (command === 'ip route' || command === 'ip route show') return { command, output: 'default via 192.168.1.1 dev wlan0\n192.168.1.0/24 dev wlan0 (illustrative)', status: 'Example routes only.', cwd };
  if (command === 'ip link' || command === 'ip link show') return { command, output: '1: lo: <LOOPBACK,UP>\n2: enp2s0: <BROADCAST,MULTICAST,UP>\n3: can0: <NOARP> (illustrative)', status: 'Example interface names; CAN requires device support/configuration.', cwd };
  if (command === 'lsblk' || command.startsWith('lsblk ')) return { command, output: 'NAME        SIZE FSTYPE TYPE MOUNTPOINTS\nnvme0n1   238G        disk\n├─nvme0n1p1 512M vfat part /boot/efi\n└─nvme0n1p2 237G ext4 part / (illustrative)', status: 'Example block-device information.', cwd };
  if (command === 'lsusb') return { command, output: 'Bus 001 Device 002: USB-serial adapter (illustrative)\nBus 001 Device 003: depth camera (illustrative)', status: 'Example USB devices, not attached hardware.', cwd };
  if (command === 'lspci') return { command, output: '00:14.0 USB controller (illustrative)\n01:00.0 Ethernet controller (illustrative)', status: 'Example PCI devices.', cwd };
  if (command === 'efibootmgr -v') return { command, output: 'BootCurrent: 0001 (illustrative)\nBootOrder: 0001,0003,0000\nBoot0001* ubuntu HD(...)\\EFI\\ubuntu\\shimx64.efi', status: 'Read-only example for supported UEFI systems; not your actual firmware.', cwd };
  if (command === 'dmesg') return { command, output: '[  1.234] usb 1-2: new high-speed USB device (illustrative)\n[  2.120] ttyUSB0: USB serial device (illustrative)', status: 'Illustrative kernel messages.', cwd };
  if (command.startsWith('dmesg | grep')) return { command, output: '[  1.234] usb 1-2: new high-speed USB device (illustrative)\n[  2.120] ttyUSB0: USB serial device (illustrative)', status: 'Simulated pipeline output; no kernel messages were read.', cwd };
  if (command.startsWith('printf ') && command.includes('| grep ros2')) return { command, output: 'ros2', status: 'The virtual pipeline filtered out non-matching lines.', cwd };
  if (command.startsWith('sudo apt update')) return { command, output: 'Reading package lists... Done (simulated)', status: 'No package manager was run.', cwd };
  if (command.startsWith('sudo apt install ')) return { command, output: 'Simulated package installation preview; nothing was installed.', status: 'No package manager was run.', cwd };
  if (command === 'source /opt/ros/humble/setup.bash') { simulatedRosDistro = 'humble'; return { command, output: '', status: 'Simulated ROS 2 Humble environment loaded. Run echo $ROS_DISTRO to verify; your host shell is unchanged.', cwd }; }
  if (command === 'echo $ROS_DISTRO') return { command, output: simulatedRosDistro, status: simulatedRosDistro ? 'Training environment only.' : 'ROS_DISTRO is not set in this simulated shell.', cwd };
  const redirectMatch = command.match(/^(.+?)\s*(>>|>)\s*(.+)$/);
  if (redirectMatch) {
    const left = redirectMatch[1].trim();
    const append = redirectMatch[2] === '>>';
    const target = redirectMatch[3].trim().replace(/^['"]|['"]$/g, '');
    const path = resolvePath(target, cwd);
    const parent = path.slice(0, path.lastIndexOf('/')) || '/';
    const name = path.split('/').pop() || '';
    if (!Object.prototype.hasOwnProperty.call(FS, parent) || !FS[parent]) return { command, output: '', status: 'bash: cannot redirect to a path whose parent directory does not exist: ' + parent, cwd };
    if (FS[path]) return { command, output: '', status: 'bash: cannot overwrite a directory: ' + path, cwd };
    let content = '';
    if (left.startsWith('echo ')) content = left.slice(5).replace(/^['"]|['"]$/g, '') + '\n';
    else if (left.startsWith('printf ')) {
      const quoted = left.slice(7).trim().replace(/^['"]|['"]$/g, '');
      content = quoted.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    } else return { command, output: '', status: 'This simulator supports redirection with echo and printf only. Example: echo hello > notes.txt', cwd };
    if (!Object.prototype.hasOwnProperty.call(FS, path)) {
      FS[path] = [];
      if (!FS[parent].includes(name)) FS[parent].push(name);
    }
    virtualFileContents[path] = append ? (virtualFileContents[path] || '') + content : content;
    return { command, output: '', status: (append ? 'Appended to ' : 'Wrote ') + path + ' in the virtual filesystem only. Read it with cat to verify.', cwd };
  }

  if (command.startsWith('grep ')) {
    const args = command.slice(5).trim().split(/\s+/);
    if (args.length < 2) return { command, output: '', status: 'Usage: grep PATTERN FILE', cwd };
    const pattern = args[0].replace(/^['"]|['"]$/g, '');
    const path = resolvePath(args[1].replace(/^['"]|['"]$/g, ''), cwd);
    if (!Object.prototype.hasOwnProperty.call(FS, path)) return { command, output: '', status: 'grep: no such file in virtual filesystem: ' + path, cwd };
    if (FS[path]) return { command, output: '', status: 'grep: ' + path + ': is a directory', cwd };
    const matches = (virtualFileContents[path] || '').split(/\r?\n/).filter((line) => line.includes(pattern));
    return { command, output: matches.join('\n'), status: matches.length ? 'Filtered virtual file content; no host files were read.' : 'No matching lines found.', cwd };
  }
  if (command.startsWith('find ')) {
    const args = command.slice(5).trim().split(/\s+/);
    const nameIndex = args.indexOf('-name');
    if (nameIndex < 1 || !args[nameIndex + 1]) return { command, output: '', status: 'Usage: find PATH -name PATTERN', cwd };
    const root = resolvePath(args[0], cwd);
    if (!Object.prototype.hasOwnProperty.call(FS, root)) return { command, output: '', status: 'find: starting path does not exist in the virtual filesystem: ' + root, cwd };
    const pattern = args[nameIndex + 1].replace(/^['"]|['"]$/g, '');
    const matches: string[] = [];
    const candidates = [...new Set([...Object.keys(FS), ...Object.keys(virtualFileContents)])];
    for (const path of candidates) {
      if (path !== root && !path.startsWith(root === '/' ? '/' : root + '/')) continue;
      const name = path.split('/').pop() || '/';
      const regex = new RegExp('^' + pattern.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
      if (regex.test(name)) matches.push(root === '/' ? '.' + path : path === root ? '.' : './' + path.slice(root.length + 1));
    }
    return { command, output: matches.join('\n') || '(no matches)', status: 'Searched only the virtual training filesystem; no host files were accessed.', cwd };
  }
  if (command.startsWith('cat ')) { const target = command.slice(4).trim().replace(/^['\"]|['\"]$/g, ''); const path = resolvePath(target, cwd); if (!Object.prototype.hasOwnProperty.call(FS, path)) return { command, output: '', status: 'cat: no such file in virtual filesystem: ' + path, cwd }; if (FS[path]) return { command, output: '', status: 'cat: ' + path + ': is a directory', cwd }; return { command, output: virtualFileContents[path] ?? '', status: 'Read virtual file contents only; no host files were accessed.', cwd }; }
  if (command === 'getent hosts github.com') return { command, output: '140.82.112.3 github.com (illustrative)', status: 'Illustrative name-resolution result; no DNS lookup occurred.', cwd };
  if (command.startsWith('ssh ')) return { command, output: 'robot@amr:~$ (simulated remote prompt)', status: 'No network connection or authentication was attempted.', cwd };
  if (command.startsWith('ros2 ')) {
    const lesson = steps.find((step) => step.command === command);
    if (lesson) return { command, output: lesson.expectedOutput, status: 'Illustrative ROS CLI output.', cwd };
    if (command === 'ros2 node list') return { command, output: '/sensor_node\n/display_node', status: 'Example node names; no ROS graph was queried.', cwd };
    if (command === 'ros2 topic list') return { command, output: '/parameter_events\n/rosout\n/temperature', status: 'Example topic names; no ROS graph was queried.', cwd };
    return { command, output: 'Supported ROS command shown as a learning example.', status: 'No live ROS runtime is connected to this browser.', cwd };
  }

  const sampleStep = steps.find((step) => step.command === command);
  if (sampleStep) return { command, output: sampleStep.expectedOutput, status: 'Sample output for this lesson; see the explanation above.', cwd };

  return { command, output: '', status: 'Command not implemented in this training shell. It was not run on your computer. Type help to view the lesson scope.', cwd };
}