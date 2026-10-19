import type { CommandLessonDefinition } from '../types/commandLesson';

/**
 * Command lessons are content, not UI. Each step explains intent, syntax,
 * execution, output, pitfalls and robotics relevance.
 */
export const commandLessons: Record<string, CommandLessonDefinition> = {
  'linux-files': {
    lessonId: 'linux-files',
    intro: 'Start with the shell’s current location. Then inspect the files there, move into the ROS workspace, verify the change, and move back up.',
    mentalModel: 'Think of the filesystem as a tree and the shell as a person standing in one directory. pwd tells you where you are; ls lets you look around; cd moves your position. These commands do different jobs.',
    steps: [
      {
        id: 'pwd',
        title: 'Print the current directory',
        command: 'pwd',
        purpose: 'Use this when you need to know exactly which directory the terminal is working in before running a relative path or build command.',
        syntax: 'pwd [OPTION]…',
        tokens: [
          { token: 'pwd', role: 'command', meaning: 'Print working directory. In Bash this is usually a shell builtin.' },
          { token: '[OPTION]…', role: 'optional', meaning: 'Optional flags exist on common implementations; for everyday navigation, just pwd is enough.' }
        ],
        howItWorks: [
          'The shell executes its pwd builtin or a pwd program.',
          'The current working directory is read from the shell/process environment.',
          'The path is written to standard output; the directory does not change.'
        ],
        expectedOutput: '/home/student',
        outputMeaning: [
          '/home/student is the absolute path of the current working directory in this training environment.'
        ],
        commonMistake: 'pwd does not list files and does not move you. Use ls to inspect a directory and cd to change location.',
        roboticsUse: 'Before running colcon build, sourcing a workspace, or launching a package, verify that you are in the intended workspace. Running commands from the wrong directory is a common source of avoidable mistakes.'
      },
      {
        id: 'ls',
        title: 'List directory contents',
        command: 'ls',
        purpose: 'Inspect which files and directories are available in your current location.',
        syntax: 'ls [OPTION]… [FILE]…',
        tokens: [
          { token: 'ls', role: 'command', meaning: 'List directory entries.' },
          { token: '[OPTION]…', role: 'optional', meaning: 'Options control format, hidden files, details and sorting.' },
          { token: '[FILE]…', role: 'optional', meaning: 'You can supply a directory or file path to inspect another location without changing into it.' }
        ],
        howItWorks: [
          'If no path is supplied, ls reads entries from the current directory.',
          'It formats the names for the terminal; plain ls does not explain permissions or ownership.',
          'The current working directory remains unchanged.'
        ],
        expectedOutput: 'Desktop  Documents  projects  ros2_ws',
        outputMeaning: [
          'Each name is an entry. Directories can contain other directories and files.',
          'ros2_ws is the example ROS 2 workspace in this training environment.'
        ],
        commonMistake: 'A directory appearing in ls output does not mean it is the current directory. Use pwd to confirm your location.',
        roboticsUse: 'Use ls to inspect a workspace, locate src, check whether package.xml exists, and find launch, config or resource directories.'
      },
      {
        id: 'cd-ros2-ws',
        title: 'Enter the ROS workspace',
        command: 'cd ros2_ws',
        purpose: 'Move from your home directory into the ROS 2 workspace using a relative path.',
        syntax: 'cd [DIRECTORY]',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Change directory. In Bash it changes the current directory of the shell itself.' },
          { token: 'ros2_ws', role: 'argument', meaning: 'The target directory name. Because it has no leading slash, it is resolved relative to the current directory.' }
        ],
        howItWorks: [
          'The shell resolves ros2_ws relative to the current location.',
          'If that directory exists and you have search permission, the shell changes its working directory.',
          'cd normally prints no output on success; the prompt may show the new location if configured to do so.'
        ],
        expectedOutput: 'Normally no stdout. The terminal location changes to /home/student/ros2_ws.',
        outputMeaning: [
          'No output is normal for a successful cd command.',
          'Run pwd next to verify the actual location rather than relying only on the prompt.'
        ],
        commonMistake: 'If you run cd ros2_ws from a different directory, the relative target may not exist. Run pwd first, or use an absolute path such as /home/student/ros2_ws.',
        roboticsUse: 'A ROS 2 workspace often contains src/ plus generated build/, install/ and log/ directories. Starting in the correct workspace matters for colcon build and overlay setup.'
      },
      {
        id: 'pwd-verify',
        title: 'Verify the directory change',
        command: 'pwd',
        purpose: 'Confirm that cd moved the shell to the intended workspace rather than assuming it worked.',
        syntax: 'pwd',
        tokens: [
          { token: 'pwd', role: 'command', meaning: 'Prints the current absolute path after the previous command.' }
        ],
        howItWorks: [
          'The shell now has a different current working directory.',
          'pwd reads that current location and prints it.',
          'This command is a verification step; it does not cause the directory change.'
        ],
        expectedOutput: '/home/student/ros2_ws',
        outputMeaning: [
          'The path ends with ros2_ws, so the shell is inside the workspace.',
          'If the path is different, stop and navigate before running workspace-specific commands.'
        ],
        commonMistake: 'Do not confuse the directory you intended to enter with the directory you actually entered. Verify it.',
        roboticsUse: 'Before building or sourcing install/setup.bash, confirm the workspace path so you do not build or source a different project by mistake.'
      },
      {
        id: 'cd-parent',
        title: 'Move to the parent directory',
        command: 'cd ..',
        purpose: 'Move up one level in the directory tree.',
        syntax: 'cd ..',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the shell’s current directory.' },
          { token: '..', role: 'path component', meaning: 'Means the parent directory: one level above the current directory.' }
        ],
        howItWorks: [
          'The shell resolves .. against the current directory.',
          'The path /home/student/ros2_ws resolves to /home/student.',
          'The shell changes location and normally produces no stdout.'
        ],
        expectedOutput: 'Normally no stdout. The terminal location changes to /home/student.',
        outputMeaning: [
          'The command moves up one directory level, not to the filesystem root unless you were only one level below it.',
          'Use pwd to verify the result.'
        ],
        commonMistake: 'cd .. is not the same as cd /; the first moves up one level, the second goes to the root directory.',
        roboticsUse: 'Move between a workspace, its parent project folder and home directory without closing the terminal session.'
      },
      {
        id: 'cd-into-workspace',
        title: 'Step 1 — Enter a project folder',
        command: 'cd ros2_ws',
        purpose: 'Start from /home/student and move into the ROS 2 workspace. The same navigation pattern applies to a coding practice workspace or a robotics engineering project; both are fictional examples created for ROS Academy.',
        syntax: 'cd DIRECTORY',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Change the current working directory of this shell.' },
          { token: 'ros2_ws', role: 'relative path', meaning: 'The target directory name, resolved from your current location (/home/student).' }
        ],
        howItWorks: [
          'First run pwd so you know where you are starting.',
          'The shell resolves ros2_ws relative to /home/student.',
          'If the directory exists and you have access, the shell changes location. Successful cd normally prints no output.',
          'Run pwd again to verify the destination.'
        ],
        expectedOutput: 'Normally no output from cd. Then run pwd:\n/home/student/ros2_ws',
        outputMeaning: [
          'No output from cd is normal; it does not mean the command failed.',
          'The follow-up pwd confirms the new current directory.',
          'For another project, replace ros2_ws with the actual directory name shown by ls.'
        ],
        commonMistake: 'Do not type cd ros2_ws from an unknown location and assume it worked. Use pwd first. If the folder is not listed by ls, check the path before trying again.',
        roboticsUse: 'Before colcon build, source install/setup.bash or inspect a package, move into the correct ROS workspace and verify it.'
      },
      {
        id: 'ls-workspace',
        title: 'Step 2 — Look inside the workspace',
        command: 'ls',
        purpose: 'List the entries in the workspace after changing directory. This proves that cd changed your location and shows the next folders you can enter.',
        syntax: 'ls [OPTIONS] [PATH]',
        tokens: [
          { token: 'ls', role: 'command', meaning: 'Lists files and directories in the current location.' },
          { token: '[OPTIONS]', role: 'optional', meaning: 'Optional flags change display style, such as -la for hidden entries and details.' },
          { token: '[PATH]', role: 'optional', meaning: 'A path can be supplied to inspect another directory without moving into it.' }
        ],
        howItWorks: [
          'Because no path was supplied, ls inspects the current directory.',
          'It prints directory entries such as src, build, install and log in this example.',
          'The working directory does not change.'
        ],
        expectedOutput: 'README.md  build  install  log  src',
        outputMeaning: [
          'src usually contains the source packages you maintain.',
          'build, install and log are commonly created by colcon during builds.',
          'Your own workspace may contain a different set of entries.'
        ],
        commonMistake: 'ls only lists entries; it does not enter a directory. Use cd src to move into src.',
        roboticsUse: 'Confirm the workspace structure before building or debugging a ROS package.'
      },
      {
        id: 'cd-src',
        title: 'Step 3 — Enter the src directory',
        command: 'cd src',
        purpose: 'Move one level down from ros2_ws into the source directory.',
        syntax: 'cd DIRECTORY',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the current directory.' },
          { token: 'src', role: 'relative path', meaning: 'Means the src directory inside the current ros2_ws directory.' }
        ],
        howItWorks: [
          'The current location is /home/student/ros2_ws.',
          'The relative path src resolves to /home/student/ros2_ws/src.',
          'The shell changes its location; verify it with pwd.'
        ],
        expectedOutput: 'No output from cd. Run pwd:\n/home/student/ros2_ws/src',
        outputMeaning: [
          'The path ends in /src, so you are now inside the source folder.',
          'Run ls to see the packages available here.'
        ],
        commonMistake: 'A relative path is interpreted from your current directory, not always from your home directory.',
        roboticsUse: 'ROS 2 package source folders normally live inside a workspace src directory.'
      },
      {
        id: 'ls-src',
        title: 'Step 4 — Find the package directory',
        command: 'ls',
        purpose: 'List packages in src before entering one. This is the same safe workflow you would use to inspect a training project or a work repository.',
        syntax: 'ls',
        tokens: [
          { token: 'ls', role: 'command', meaning: 'Lists entries in the current directory; here, the workspace src folder.' }
        ],
        howItWorks: [
          'ls reads entries in /home/student/ros2_ws/src.',
          'The virtual workspace contains demo_robot and my_robot_bringup as example packages.',
          'The shell remains in src.'
        ],
        expectedOutput: 'demo_robot  my_robot_bringup',
        outputMeaning: [
          'Each entry is a directory in this simulated workspace.',
          'Choose the actual package name you want to inspect.'
        ],
        commonMistake: 'Do not assume every project uses the same package name. List the directory first, then copy the exact name.',
        roboticsUse: 'Find the package before inspecting package.xml, source files, launch files or configuration.'
      },
      {
        id: 'cd-package',
        title: 'Step 5 — Enter a package directory',
        command: 'cd demo_robot',
        purpose: 'Move from src into the example demo_robot package.',
        syntax: 'cd DIRECTORY',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the shell’s current directory.' },
          { token: 'demo_robot', role: 'relative path', meaning: 'The package directory listed by the previous ls command.' }
        ],
        howItWorks: [
          'The shell resolves demo_robot relative to /home/student/ros2_ws/src.',
          'The destination becomes /home/student/ros2_ws/src/demo_robot.',
          'Run pwd and ls to verify both location and contents.'
        ],
        expectedOutput: 'No output from cd. Then run pwd:\n/home/student/ros2_ws/src/demo_robot',
        outputMeaning: [
          'You are inside the selected package.',
          'The example package contains package.xml, src, launch and config.'
        ],
        commonMistake: 'If cd reports “No such file or directory”, return to the parent with cd .. and check the exact name with ls.',
        roboticsUse: 'Navigate to a ROS package before editing source code, launch files or parameters.'
      },
      {
        id: 'cd-back-one',
        title: 'Step 6 — Go back one folder',
        command: 'cd ..',
        purpose: 'Return from demo_robot to its parent directory, src. This is the standard way to go up exactly one level.',
        syntax: 'cd ..',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the current directory.' },
          { token: '..', role: 'path component', meaning: 'Names the parent directory one level above the current directory.' }
        ],
        howItWorks: [
          'Starting from /home/student/ros2_ws/src/demo_robot, the shell resolves .. to /home/student/ros2_ws/src.',
          'The shell changes location and normally prints nothing.',
          'Run pwd to verify the parent directory.'
        ],
        expectedOutput: 'No output from cd. Then run pwd:\n/home/student/ros2_ws/src',
        outputMeaning: [
          'Only one level was removed from the path.',
          'cd .. does not automatically return to home.'
        ],
        commonMistake: 'Do not confuse cd .. with cd / or cd ~. They go to the filesystem root and home directory respectively.',
        roboticsUse: 'Move between a package folder and the workspace source directory without closing the terminal.'
      },
      {
        id: 'cd-back-two',
        title: 'Step 7 — Go up two levels',
        command: 'cd ../..',
        purpose: 'Move up two directory levels in one command. From src/demo_robot this returns to ros2_ws.',
        syntax: 'cd ../..',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the current directory.' },
          { token: '..', role: 'first parent', meaning: 'Moves one level up.' },
          { token: '/', role: 'path separator', meaning: 'Separates the two parent-directory components.' },
          { token: '..', role: 'second parent', meaning: 'Moves up one additional level.' }
        ],
        howItWorks: [
          'Each .. component is resolved in sequence.',
          'From /home/student/ros2_ws/src, the first .. resolves to /home/student/ros2_ws; the second would move to /home/student if you ran it from src.',
          'For a predictable demonstration, check pwd before and after. The exact destination depends on your starting location.'
        ],
        expectedOutput: 'From /home/student/ros2_ws/src/demo_robot: /home/student/ros2_ws\nFrom /home/student/ros2_ws/src: /home/student',
        outputMeaning: [
          'Every .. represents one parent step.',
          'Count the parent components and consider your starting path before running the command.'
        ],
        commonMistake: 'The result depends on where you start. Run pwd first instead of memorizing a destination for cd ../.. in every situation.',
        roboticsUse: 'Quickly move between nested source, package and workspace directories while inspecting project files.'
      },
      {
        id: 'cd-home',
        title: 'Step 8 — Return to your home directory',
        command: 'cd ~',
        purpose: 'Return to the current user’s home directory from almost any location.',
        syntax: 'cd ~  or  cd',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the current directory.' },
          { token: '~', role: 'home shortcut', meaning: 'The shell expands this to the current user’s home directory.' }
        ],
        howItWorks: [
          'The shell expands ~ to the current user’s home path.',
          'The current directory changes to /home/student in this simulator.',
          'A bare cd with no argument normally returns to the same home directory.'
        ],
        expectedOutput: 'No output from cd. Run pwd:\n/home/student',
        outputMeaning: [
          'You are back in the user’s home directory.',
          'cd and cd ~ are useful recovery commands when you have lost track of nested folders.'
        ],
        commonMistake: 'The home directory is not the filesystem root /. On a real machine it may be /home/your-username.',
        roboticsUse: 'Return to a stable starting point before opening another repository or workspace.'
      },
      {
        id: 'cd-absolute',
        title: 'Step 9 — Jump directly using an absolute path',
        command: 'cd /home/student/ros2_ws/src/demo_robot',
        purpose: 'Navigate directly to a known location without stepping through each parent directory.',
        syntax: 'cd /FULL/PATH/TO/DIRECTORY',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the current directory.' },
          { token: '/home/student/ros2_ws/src/demo_robot', role: 'absolute path', meaning: 'Starts with /, so the path is resolved from filesystem root, regardless of the current directory.' }
        ],
        howItWorks: [
          'The leading / marks an absolute path.',
          'The shell resolves every path component from the root directory.',
          'If the destination exists and is accessible, the shell moves there.'
        ],
        expectedOutput: 'No output from cd. Run pwd:\n/home/student/ros2_ws/src/demo_robot',
        outputMeaning: [
          'Absolute paths are independent of the starting directory.',
          'The username and workspace path differ on real systems; use the path that exists on your machine.'
        ],
        commonMistake: 'A path without a leading / is usually relative. Check spelling, capitalization and the actual home directory.',
        roboticsUse: 'Use a known absolute path in documentation or scripts when the path must be unambiguous; avoid hard-coding user-specific paths in reusable code.'
      },
      {
        id: 'cd-previous',
        title: 'Step 10 — Switch back to the previous directory',
        command: 'cd -',
        purpose: 'Jump to the previous working directory. Unlike cd .., this switches between the last two locations.',
        syntax: 'cd -',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Changes the shell’s current directory.' },
          { token: '-', role: 'previous-directory shortcut', meaning: 'Uses OLDPWD, the previous working directory, when the shell has one.' }
        ],
        howItWorks: [
          'The shell remembers the previous working directory after a successful directory change.',
          'cd - changes to that previous directory and typically prints the destination path.',
          'Running cd - again can switch back, similar to toggling between two locations.'
        ],
        expectedOutput: 'Example: /home/student/ros2_ws',
        outputMeaning: [
          'The destination depends on the directory you were in before the last cd.',
          'The virtual terminal models this previous-directory behavior.'
        ],
        commonMistake: 'If no previous directory has been recorded, a real shell may report that OLDPWD is not set. Use cd ~ as a reliable fallback.',
        roboticsUse: 'Switch between a package directory and a workspace root while editing or building without retyping long paths.'
      },
      {
        id: 'cd-wrong-path',
        title: 'Step 11 — Recover from a wrong folder name',
        command: 'cd missing_folder',
        purpose: 'Practice the common error that happens when a directory name is misspelled or the current directory is wrong.',
        syntax: 'cd DIRECTORY',
        tokens: [
          { token: 'cd', role: 'command', meaning: 'Attempts to change the working directory.' },
          { token: 'missing_folder', role: 'argument', meaning: 'An intentionally nonexistent directory in this lesson.' }
        ],
        howItWorks: [
          'The shell resolves the requested directory relative to the current location.',
          'The virtual filesystem cannot find that directory, so the location does not change.',
          'Run pwd to confirm you stayed where you were; run ls to inspect valid names.'
        ],
        expectedOutput: 'No such directory in the virtual filesystem: (resolved path)',
        outputMeaning: [
          'A failed cd leaves the working directory unchanged.',
          'Use pwd, ls and the exact directory spelling to recover.'
        ],
        commonMistake: 'Do not keep guessing names. Inspect the current directory and copy an existing entry exactly, including capitalization.',
        roboticsUse: 'Use the same recovery pattern when navigating repositories, package directories or deployment folders.'
      },
      {
        id: 'ls-details',
        title: 'Inspect hidden files and metadata',
        command: 'ls -la',
        purpose: 'Show hidden entries and detailed metadata, including permissions and ownership.',
        syntax: 'ls [OPTIONS]…',
        tokens: [
          { token: 'ls', role: 'command', meaning: 'Lists directory entries.' },
          { token: '-l', role: 'option', meaning: 'Long format: permissions, link count, owner, group, size, timestamp and name.' },
          { token: '-a', role: 'option', meaning: 'All entries, including names beginning with a dot such as .bashrc.' }
        ],
        howItWorks: [
          'The shell passes -la as option characters to ls.',
          'ls reads directory metadata and formats one entry per line.',
          'The command observes metadata; it does not change permissions or file contents.'
        ],
        expectedOutput: 'drwxr-xr-x  ros2_ws\n-rw-r--r--  README.md\ndrwxr-xr-x  projects',
        outputMeaning: [
          'The leading d indicates a directory in this illustrative listing; a hyphen usually indicates a regular file.',
          'Permission strings such as rwxr-xr-x describe owner, group and other access bits.',
          'This is simplified sample output; a real ls -la line also includes link count, owner, group, size and time.'
        ],
        commonMistake: 'ls -la only displays permission data; it does not fix permission problems. Use chmod or chown only when you understand the required access change.',
        roboticsUse: 'Inspect launch scripts, workspace files and ownership when a build, service or device-access operation reports permission errors.'
      }
    ]
  },
  'linux-process': {
    lessonId: 'linux-process',
    intro: 'A command that is running becomes a process. Learn to inspect processes and environment variables before investigating a failed node.',
    mentalModel: 'A terminal is a view into a running system. Process tools report what is running; environment variables influence how new programs find libraries, executables and ROS packages.',
    steps: [
      { id: 'ps-ef', title: 'List running processes', command: 'ps -ef', purpose: 'Inspect process IDs, parent IDs, users and command lines.', syntax: 'ps [OPTIONS]', tokens: [{token:'ps',role:'command',meaning:'Reports a snapshot of processes.'},{token:'-e',role:'option',meaning:'Select all processes.'},{token:'-f',role:'option',meaning:'Use a full-format listing with more columns.'}], howItWorks:['ps reads process information exposed by the operating system.','Each row represents a process at the time of the snapshot.','The output is diagnostic; it does not keep updating like top.'], expectedOutput:'UID  PID  COMMAND\nroot  1    systemd\nstudent 721 bash\nstudent 1042 demo_node (illustrative)', outputMeaning:['PID identifies a process in its PID namespace.','COMMAND gives the launched program/arguments; names and PIDs vary on real systems.'], commonMistake:'A PID can change after a reboot or restart. Do not hard-code PIDs into a robot service.', roboticsUse:'Find a runaway ROS node, confirm whether a process is alive and identify the command line used to start it.' },
      { id: 'echo-path', title: 'Inspect PATH', command: 'echo $PATH', purpose: 'See which directories the shell searches when you type an executable name.', syntax: 'echo $VARIABLE', tokens: [{token:'echo',role:'command',meaning:'Writes arguments to standard output.'},{token:'$PATH',role:'variable expansion',meaning:'The shell expands this variable to a colon-separated list of directories.'}], howItWorks:['The shell expands $PATH before launching echo.','echo prints the expanded string.','This command only displays the environment; it does not edit it.'], expectedOutput:'/opt/ros/humble/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin', outputMeaning:['Each colon-separated entry is a directory searched for commands.','ROS setup scripts can add ROS-related directories to relevant environment variables.'], commonMistake:'PATH is not the same as PYTHONPATH or AMENT_PREFIX_PATH; each variable serves a different lookup purpose.', roboticsUse:'Diagnose why a command or ROS executable cannot be found in a terminal or service environment.' },
      { id: 'kill-term', title: 'Request graceful process termination', command: 'kill -TERM 1042', purpose: 'Send SIGTERM to a demo process so it can clean up and exit. This simulator never signals your real computer.', syntax: 'kill -SIGNAL PID', tokens: [{token:'kill',role:'command',meaning:'Asks the operating system to deliver a signal to a process.'},{token:'-TERM',role:'signal',meaning:'SIGTERM requests termination and allows the program to handle cleanup.'},{token:'1042',role:'argument',meaning:'Illustrative PID of the demo_node process in this training environment.'}], howItWorks:['The shell resolves kill as a builtin on many shells.','The OS delivers SIGTERM to the target process if permitted.','A cooperative process can release resources and exit; a process may ignore or delay handling it.'], expectedOutput:'Simulated SIGTERM sent to process 1042 (demo_node). No real process is signalled.', outputMeaning:['The message is a lesson simulation, not an operating-system response.','In a real terminal, check the actual PID and permissions before sending a signal.'], commonMistake:'Never copy the example PID blindly into a real system. Confirm the exact process first and prefer graceful shutdown mechanisms for robot applications.', roboticsUse:'Understand orderly shutdown and process supervision. For production robotics, systemd restart policies, watchdogs and safe-stop logic must be designed deliberately.' }
  ]},
  'linux-permissions': {
    lessonId:'linux-permissions',intro:'Permissions are an access-control system. Read the mode before changing it, and apply the smallest change needed.',mentalModel:'The mode has three permission groups: owner, group and others. Each group can have read, write and execute bits. Directory execute means traversal/search, which differs from executing a regular file.',steps:[
      {id:'ls-mode',title:'Read a file’s permission bits',command:'ls -l deploy.sh',purpose:'Inspect the existing mode and ownership before changing access.',syntax:'ls -l PATH',tokens:[{token:'ls',role:'command',meaning:'Lists entries and metadata.'},{token:'-l',role:'option',meaning:'Shows long-format metadata.'},{token:'deploy.sh',role:'path',meaning:'The file whose permissions will be inspected.'}],howItWorks:['ls asks the filesystem for the entry’s metadata.','The first field begins with file type and then owner/group/other permission bits.','No permission change occurs.'],expectedOutput:'-rw-r--r-- 1 student student 128 deploy.sh (illustrative)',outputMeaning:['-rw-r--r-- means a regular file, owner read/write, group read, others read; no execute bit is set.','Owner and group names are examples and vary by system.'],commonMistake:'Read the three groups carefully: owner, group and others. Do not use chmod 777 as a generic fix.',roboticsUse:'Inspect launch scripts, serial device permissions and service-owned config before troubleshooting access errors.'},
      {id:'chmod-owner-x',title:'Add execute permission for the owner',command:'chmod u+x deploy.sh',purpose:'Allow the file owner to execute the script without granting extra permissions to other users.',syntax:'chmod WHO+PERMISSION PATH',tokens:[{token:'chmod',role:'command',meaning:'Changes filesystem mode bits.'},{token:'u',role:'who',meaning:'The file owner (user) permission class.'},{token:'+x',role:'operation',meaning:'Adds the execute bit without removing existing permissions.'},{token:'deploy.sh',role:'path',meaning:'The target file.'}],howItWorks:['The shell runs chmod with the provided mode expression.','The filesystem updates the execute bit if the caller has permission.','Verify the result with ls -l; the mode change affects a real file if executed outside this simulation.'],expectedOutput:'Simulated permission update: owner execute bit added to deploy.sh.',outputMeaning:['The simulator records the intended permission change only.','No file on your device is modified by this webpage.'],commonMistake:'chmod changes access mode; it does not change the file owner. A script also needs a valid interpreter line if run directly.',roboticsUse:'A deployment or startup script may need owner execute permission. In services, check user/group and device permissions rather than granting broad access.'}
  ]},
  'linux-shell': {
    lessonId:'linux-shell',intro:'Shell syntax joins small tools into useful diagnostics. Learn where arguments, variable expansion, pipes and redirection act.',mentalModel:'The shell processes syntax before launching programs. A pipe connects stdout of one process to stdin of another; redirection connects a stream to a file.',steps:[
      {id:'pipe-grep',title:'Filter a stream with a pipe',command:'printf "node\\nros2\\nlinux\\n" | grep ros2',purpose:'Send three lines through a pipe and keep only the line that matches ros2.',syntax:'COMMAND_1 | COMMAND_2',tokens:[{token:'printf',role:'command 1',meaning:'Produces formatted text on stdout.'},{token:'|',role:'pipe',meaning:'Connects stdout from the left command to stdin of the right command.'},{token:'grep ros2',role:'command 2',meaning:'Prints input lines matching the pattern ros2.'}],howItWorks:['The shell creates a pipe between the two commands.','printf writes lines into the pipe.','grep reads those lines and emits only matching lines.'],expectedOutput:'ros2',outputMeaning:['Only the line containing ros2 matches the pattern.','Data flows through a pipe; it is not automatically saved to a file.'],commonMistake:'The pipe symbol is different from >. A pipe sends output to another command; > redirects output to a file.',roboticsUse:'Filter ros2 node lists, diagnostic logs and build output without creating intermediate files.'},
      {id:'echo-home',title:'Read a shell variable',command:'echo $HOME',purpose:'Print the current user’s home directory.',syntax:'echo $VARIABLE',tokens:[{token:'echo',role:'command',meaning:'Writes supplied text to stdout.'},{token:'$HOME',role:'variable expansion',meaning:'The shell substitutes the HOME environment variable before executing echo.'}],howItWorks:['The shell expands $HOME in the command line.','echo writes the resulting path.','The variable value depends on the current user and environment.'],expectedOutput:'/home/student',outputMeaning:['This is the home directory in the teaching environment; a real username and path may differ.'],commonMistake:'Quotes matter. Single quotes prevent variable expansion in common shells; double quotes allow it.',roboticsUse:'Find user-relative configuration and workspace locations without hard-coding one developer’s home directory.'},
      {id:'redirect-list',title:'Redirect output to a file',command:'ls > files.txt',purpose:'Save the directory listing into files.txt instead of displaying it on the terminal.',syntax:'COMMAND > FILE',tokens:[{token:'ls',role:'command',meaning:'Produces the listing on stdout.'},{token:'>',role:'redirection',meaning:'Opens the target file for output, creating it or truncating it if it already exists.'},{token:'files.txt',role:'target',meaning:'The destination file for stdout.'}],howItWorks:['The shell handles redirection before starting ls.','The file descriptor for stdout is connected to files.txt.','ls writes output to the file, so the terminal normally shows no listing.'],expectedOutput:'No listing is printed. The simulator marks files.txt as the redirection target.',outputMeaning:['No terminal output is expected when stdout is redirected.','In a real shell, > can overwrite an existing file; use it carefully.'],commonMistake:'> overwrites; >> appends. Check the target path before redirecting logs or configuration output.',roboticsUse:'Capture command output for a bug report or deployment diagnostic. For important logs, choose a unique destination or append deliberately.'}
  ]},
  'linux-packages': {
    lessonId:'linux-packages',intro:'Installing software and configuring a shell are different operations. A ROS environment script changes lookup paths for the current shell.',mentalModel:'APT manages installed packages. source runs a shell script in the current shell context so its environment changes remain available after the script returns.',steps:[
      {id:'apt-update',title:'Refresh package metadata',command:'sudo apt update',purpose:'Fetch the latest package indexes from configured repositories; this does not itself upgrade installed packages.',syntax:'sudo apt update',tokens:[{token:'sudo',role:'privilege tool',meaning:'Runs a command with elevated privileges when authorized.'},{token:'apt',role:'package manager',meaning:'Ubuntu’s package management frontend.'},{token:'update',role:'subcommand',meaning:'Refreshes local package lists from configured repositories.'}],howItWorks:['APT reads repository configuration and contacts configured package sources.','It downloads package index metadata.','Installed packages are not upgraded by update alone.'],expectedOutput:'Simulated only: package index refreshed. No packages are installed or changed.',outputMeaning:['Output describes the simulated action, not a real network transaction.','On a real machine, repository/network errors may appear.'],commonMistake:'apt update and apt upgrade are different. Do not run installation or upgrade operations on a production robot without a maintenance plan.',roboticsUse:'Keep dependency installation reproducible and schedule package updates with robot uptime, compatibility and rollback in mind.'},
      {id:'source-ros',title:'Load the ROS 2 environment',command:'source /opt/ros/humble/setup.bash',purpose:'Make ROS 2 Humble tools, libraries and package paths discoverable in this shell.',syntax:'source FILE',tokens:[{token:'source',role:'shell builtin',meaning:'Runs a shell file in the current shell instead of a separate child shell.'},{token:'/opt/ros/humble/setup.bash',role:'path',meaning:'The ROS 2 Humble environment setup script on a typical Ubuntu installation.'}],howItWorks:['The current shell reads and executes the setup file.','The script adjusts environment variables such as package and library lookup paths.','Those changes generally affect this shell and commands launched from it.'],expectedOutput:'Simulated only: ROS 2 Humble environment loaded in the virtual shell.',outputMeaning:['The webpage does not source files on your computer.','A new terminal may require sourcing the file again unless it is configured in a shell startup file.'],commonMistake:'Running the script as a child process is not equivalent to sourcing it. Also ensure the path matches the ROS distribution installed on that machine.',roboticsUse:'Use setup scripts to make ROS executables, packages and workspace overlays discoverable. Source the underlay before a workspace overlay where appropriate.'},
      {id:'ros-distro',title:'Verify the ROS distribution variable',command:'echo $ROS_DISTRO',purpose:'Check which ROS distribution name is present in the current environment.',syntax:'echo $ROS_DISTRO',tokens:[{token:'echo',role:'command',meaning:'Prints the value supplied to it.'},{token:'$ROS_DISTRO',role:'variable expansion',meaning:'Expanded by the shell to the ROS distribution environment variable.'}],howItWorks:['The shell expands the variable before executing echo.','echo prints the resulting text.','An empty output may indicate the variable was not set in this shell.'],expectedOutput:'humble (illustrative)',outputMeaning:['humble is the intended course environment here, not a value read from the learner’s computer.'],commonMistake:'A non-empty ROS_DISTRO variable alone does not prove every package is installed or a node can communicate. Check actual tools and runtime state too.',roboticsUse:'Verify environment selection when switching terminals, containers, machines or overlays.'}
  ]},
  'linux-network': {
    lessonId:'linux-network',intro:'Network diagnostics begin by separating interface configuration, routing, name resolution and remote access. ROS discovery adds more requirements beyond basic IP connectivity.',mentalModel:'An interface has addresses; the route table chooses where packets go; DNS maps names to addresses; SSH builds an authenticated encrypted remote session.',steps:[
      {id:'ip-addr',title:'Inspect network interfaces and addresses',command:'ip addr',purpose:'See interfaces, link state and assigned IP addresses.',syntax:'ip address show',tokens:[{token:'ip',role:'command',meaning:'Linux networking administration and inspection tool.'},{token:'addr',role:'object',meaning:'Selects address information for interfaces.'}],howItWorks:['The tool queries kernel network configuration.','Each interface is shown with flags and any configured addresses.','The command is observational; it does not configure an address.'],expectedOutput:'lo: 127.0.0.1/8\nwlan0: 192.168.1.42/24 (illustrative)',outputMeaning:['lo is loopback, used for communication within the local host.','wlan0 and its address are example output; real interface names and addresses differ.'],commonMistake:'An IP address does not prove the target service is listening or DDS discovery is configured correctly.',roboticsUse:'Check whether the robot computer and development workstation have the expected network interfaces and addresses before diagnosing ROS 2 communication.'},
      {id:'ip-route',title:'Inspect the routing table',command:'ip route',purpose:'Find the route Linux would use to reach another IP network.',syntax:'ip route show',tokens:[{token:'ip',role:'command',meaning:'Queries the Linux networking stack.'},{token:'route',role:'object',meaning:'Displays route entries used for destination selection.'}],howItWorks:['Linux compares the destination address with available route entries.','A matching specific route generally wins over a less-specific route.','The default route is used when no more-specific route matches.'],expectedOutput:'default via 192.168.1.1 dev wlan0\n192.168.1.0/24 dev wlan0 (illustrative)',outputMeaning:['The default route uses gateway 192.168.1.1 via wlan0 in this example.','The /24 route covers the local 192.168.1.0 subnet.'],commonMistake:'A route does not guarantee firewall permission, correct DNS, application availability or working ROS middleware discovery.',roboticsUse:'Diagnose routing between a robot, remote workstation, sensor subnet or fleet network.'},
      {id:'ssh-remote',title:'Connect to a remote robot securely',command:'ssh robot@192.168.1.50',purpose:'Open an encrypted remote shell to a robot computer after its SSH service and account are configured.',syntax:'ssh USER@HOST',tokens:[{token:'ssh',role:'command',meaning:'Secure Shell client.'},{token:'robot',role:'user',meaning:'Remote account name.'},{token:'192.168.1.50',role:'host',meaning:'Example IP address of the remote robot computer.'}],howItWorks:['The client connects to the SSH server, commonly on TCP port 22.','The server host key and user authentication are checked.','An encrypted remote session is opened if the connection and authentication succeed.'],expectedOutput:'Simulated connection prompt: robot@amr:~$ (no actual connection is attempted)',outputMeaning:['This is only an illustration.','Real connections may fail due to routing, firewall, service, host-key or authentication problems.'],commonMistake:'Never disable host-key checking as a casual fix. Confirm the robot identity and use approved credentials or keys.',roboticsUse:'Maintain headless robots and remote compute systems securely without attaching a display or keyboard.'}
  ]},
  'linux-storage': {
    lessonId:'linux-storage',intro:'A robot may boot while a ROS node or system service fails. Use process state, memory and logs to distinguish a process problem from a service or hardware problem.',mentalModel:'ps is a snapshot of processes, free summarizes memory, systemctl reports service-manager state, and journalctl reads logs. These tools answer different questions.',steps:[
      {id:'ps-aux',title:'Find matching processes',command:'ps aux | grep ros',purpose:'List processes and filter output for lines containing ros.',syntax:'ps aux | grep PATTERN',tokens:[{token:'ps aux',role:'command 1',meaning:'Shows a process snapshot with user-oriented details.'},{token:'|',role:'pipe',meaning:'Passes stdout from ps to grep.'},{token:'grep ros',role:'command 2',meaning:'Prints lines containing ros; it may also match grep itself.'}],howItWorks:['ps produces a process listing.','The shell pipes that listing to grep.','grep emits lines matching the chosen text.'],expectedOutput:'student 1042 ... ros2 run demo_robot sensor_node (illustrative)',outputMeaning:['A matching process is evidence that something with ros in its command line exists, not proof its node is healthy.'],commonMistake:'grep can match its own command and short text patterns can miss processes. Use ros2 node list or service logs as complementary evidence.',roboticsUse:'Start a layered diagnosis when a launch file appears not to have started a node.'},
      {id:'free-memory',title:'Inspect memory usage',command:'free -h',purpose:'Summarize physical memory and swap usage in human-readable units.',syntax:'free [OPTIONS]',tokens:[{token:'free',role:'command',meaning:'Reports memory statistics from kernel-provided data.'},{token:'-h',role:'option',meaning:'Uses human-readable units such as MiB or GiB.'}],howItWorks:['The tool reads memory counters, commonly from /proc/meminfo.','It presents total, used, free, shared, cache/buffers and available memory.','Linux uses spare RAM for cache; the free column alone is not a complete pressure metric.'],expectedOutput:'Mem: 7.7Gi total  1.8Gi used  4.1Gi free (illustrative)',outputMeaning:['The values are invented examples for learning, not the actual machine memory.','Available memory and swap activity are often more useful than free memory alone.'],commonMistake:'Do not conclude the machine is out of memory solely because Linux uses RAM for cache. Check available memory, swap and OOM logs.',roboticsUse:'Spot resource pressure that may destabilize perception, mapping, logging or multiple concurrent ROS nodes.'},
      {id:'service-status',title:'Inspect a robot systemd service',command:'systemctl status robot-bringup.service',purpose:'Check whether the service manager believes the robot bring-up service is active, failed or stopped.',syntax:'systemctl status UNIT',tokens:[{token:'systemctl',role:'command',meaning:'Controls and inspects systemd-managed units.'},{token:'status',role:'subcommand',meaning:'Shows unit state, recent log messages and process details.'},{token:'robot-bringup.service',role:'unit',meaning:'Example service name; your robot can use a different unit.'}],howItWorks:['systemctl queries the system service manager.','The status includes active state and often the main PID.','Recent log lines help select the next diagnostic step.'],expectedOutput:'robot-bringup.service - Robot bring-up (simulated status)',outputMeaning:['This is a mock status line; use the actual service name on a real robot.'],commonMistake:'Active (running) does not prove the robot is behaving correctly. Check topics, hardware state, diagnostics and application logs.',roboticsUse:'Inspect services that automatically launch a ROS 2 stack during system startup.'},
      {id:'journal-service',title:'Read the service log',command:'journalctl -u robot-bringup.service -n 50',purpose:'Display the last 50 journal lines for the robot bring-up service.',syntax:'journalctl -u UNIT -n COUNT',tokens:[{token:'journalctl',role:'command',meaning:'Queries the systemd journal.'},{token:'-u UNIT',role:'filter',meaning:'Filters messages to a unit.'},{token:'-n 50',role:'limit',meaning:'Shows the most recent 50 messages.'}],howItWorks:['journalctl queries journal records.','Unit and line-count filters narrow the output.','Use timestamps and severity to correlate failures with startup events.'],expectedOutput:'robot-bringup.service started (illustrative log)',outputMeaning:['The line is placeholder output; real logs contain timestamps, source and severity information.'],commonMistake:'Do not only inspect the last line. Look for the first causal error before downstream failures.',roboticsUse:'Diagnose startup order, missing devices, permissions, missing parameters and ROS process crashes.'}
  ]},
  'linux-uptime': {
    lessonId:'linux-uptime',intro:'Uptime describes the current boot session; boot-time and startup-duration tools answer related but different questions.',mentalModel:'Uptime is elapsed runtime, boot time is a timestamp, and startup analysis measures how long startup stages took. Load average is not the same as CPU percentage.',steps:[
      {id:'uptime',title:'Read uptime and load average',command:'uptime',purpose:'Check elapsed running time, logged-in users and recent load averages.',syntax:'uptime [OPTIONS]',tokens:[{token:'uptime',role:'command',meaning:'Reports system running time and load averages.'}],howItWorks:['The tool reads kernel/system accounting data.','It prints uptime, user count and load averages over 1, 5 and 15 minutes.','Load average approximates runnable/uninterruptible tasks, not CPU utilization percentage.'],expectedOutput:'08:12:34 up 3 days, 4:21, 2 users, load average: 0.32, 0.27, 0.21 (illustrative)',outputMeaning:['3 days, 4:21 is elapsed time since boot.','Load averages are examples; interpret them relative to available CPU cores and workload.'],commonMistake:'A load average of 1 is not universally “100% CPU”. Interpret system load against CPU count and task behavior.',roboticsUse:'Detect unexpected restarts, monitor runtime duration and compare load before and after starting perception or navigation workloads.'},
      {id:'who-boot',title:'Find the last boot timestamp',command:'who -b',purpose:'Report when the system last booted, when the supporting accounting data is available.',syntax:'who -b',tokens:[{token:'who',role:'command',meaning:'Displays information about logged-in users and system accounting.'},{token:'-b',role:'option',meaning:'Shows the time of the last system boot in supported environments.'}],howItWorks:['who reads available accounting information.','The -b option requests boot-time information.','It reports a timestamp rather than elapsed duration.'],expectedOutput:'system boot  2026-10-16 03:51 (illustrative)',outputMeaning:['This is the sample timestamp used in this training environment.','Compare it with expected maintenance or restart windows.'],commonMistake:'A boot timestamp is not the same as the duration of firmware, kernel or userspace startup.',roboticsUse:'Correlate reboots with battery/power events, watchdog resets and robot downtime reports.'},
      {id:'startup-time',title:'Measure startup stages',command:'systemd-analyze time',purpose:'Estimate time spent in firmware, bootloader, kernel and userspace on supported systemd/firmware combinations.',syntax:'systemd-analyze time',tokens:[{token:'systemd-analyze',role:'command',meaning:'Analyzes systemd startup performance.'},{token:'time',role:'subcommand',meaning:'Summarizes available startup-stage durations.'}],howItWorks:['The tool reads timing information made available by systemd and firmware.','It separates the available firmware, loader, kernel and userspace components.','Some systems do not provide every timing value.'],expectedOutput:'Startup finished in 4.2s (firmware) + 1.1s (loader) + 2.8s (kernel) + 7.4s (userspace) = 15.5s (illustrative)',outputMeaning:['The stages and total are sample values only.','systemd-analyze blame can help find slow services but is not a perfect measure of critical-path impact.'],commonMistake:'Do not assume every startup delay is caused by a ROS node; firmware, storage, network waits and service dependencies can dominate.',roboticsUse:'Measure startup changes after a deployment and detect services that delay a robot becoming ready.'}
  ]},
  'linux-boot-process': {
    lessonId:'linux-boot-process',intro:'A Linux robot starts in layers. Diagnosing the earliest failing layer is usually faster than changing random firmware settings or restarting ROS repeatedly.',mentalModel:'Firmware selects a boot entry; the bootloader loads kernel artifacts; the kernel brings up drivers and root storage; systemd starts services; only then does the ROS application normally launch.',steps:[
      {id:'default-target',title:'Inspect the default systemd target',command:'systemctl get-default',purpose:'Find the default systemd target used to bring the machine into its normal operating state.',syntax:'systemctl get-default',tokens:[{token:'systemctl',role:'command',meaning:'Queries or controls systemd.'},{token:'get-default',role:'subcommand',meaning:'Prints the configured default target.'}],howItWorks:['systemctl queries the manager configuration.','A target groups services into a desired system state.','The output does not list every service or prove every one started successfully.'],expectedOutput:'graphical.target (illustrative)',outputMeaning:['graphical.target commonly requests a graphical login environment.','Headless robot computers may instead use a multi-user target.'],commonMistake:'The target describes the desired operating state, not a guarantee that all required robot services are healthy.',roboticsUse:'Understand why a robot boots to a console or desktop and how the default target relates to unattended service startup.'},
      {id:'failed-units',title:'List failed systemd units',command:'systemctl --failed',purpose:'Find services or units that systemd currently marks failed.',syntax:'systemctl --failed',tokens:[{token:'systemctl',role:'command',meaning:'Queries the systemd manager.'},{token:'--failed',role:'filter',meaning:'Lists failed units.'}],howItWorks:['systemd maintains unit state and failure results.','The command lists current failed units, if any.','Inspect a specific unit and its journal to locate the underlying cause.'],expectedOutput:'0 loaded units listed (illustrative)',outputMeaning:['This is sample output. A real robot may have failed units even when Linux itself booted.'],commonMistake:'A zero-failure list does not prove the robot application is correct; a process can be running but logically unhealthy.',roboticsUse:'First-pass check when the OS boots but the robot stack, network or hardware service does not become ready.'},
      {id:'boot-warnings',title:'Read warnings from the current boot',command:'journalctl -b -p warning',purpose:'Review journal messages at warning priority or higher for the current boot.',syntax:'journalctl -b -p PRIORITY',tokens:[{token:'journalctl',role:'command',meaning:'Queries the systemd journal.'},{token:'-b',role:'boot filter',meaning:'Limits the query to the current boot by default.'},{token:'-p warning',role:'priority filter',meaning:'Shows warning-level messages and more severe levels.'}],howItWorks:['The journal stores timestamped system and service logs.','-b restricts to the current boot session.','The priority filter narrows attention to warnings and more severe records.'],expectedOutput:'Oct 19 08:01:03 robot-lab kernel: illustrative warning',outputMeaning:['The line is illustrative only; on a real system inspect the full message and surrounding context.'],commonMistake:'Warnings are clues, not automatically root causes. Correlate timestamp, unit, error context and hardware state.',roboticsUse:'Investigate drivers, disk errors, service startup, device discovery and timeouts from the current robot boot.'}
  ]},
  'linux-firmware-boot': {
    lessonId:'linux-firmware-boot',intro:'Firmware boot menus run before Linux. A one-time F12 menu selects a boot source for that start; persistent boot order is a separate configuration and must be changed carefully.',mentalModel:'Think of UEFI as the platform’s pre-OS manager. It selects an EFI boot entry; the selected loader then loads the operating system. F12 is vendor-specific and does not have one universal screen.',steps:[
      {id:'lsblk',title:'Identify disks and partitions from Linux',command:'lsblk -o NAME,SIZE,FSTYPE,TYPE,MOUNTPOINTS',purpose:'Inspect block devices and mount points after Linux boots, before deciding which device is the OS disk.',syntax:'lsblk [OPTIONS] [DEVICE]',tokens:[{token:'lsblk',role:'command',meaning:'Lists block devices.'},{token:'-o',role:'option',meaning:'Selects which columns appear.'},{token:'NAME,SIZE,FSTYPE,TYPE,MOUNTPOINTS',role:'column list',meaning:'Shows device name, size, filesystem type, device type and mount points.'}],howItWorks:['The tool enumerates block devices visible to Linux.','Partitions are normally shown under their parent disk.','Mount points help identify which partition backs the running system.'],expectedOutput:'nvme0n1  238G  disk\n├─nvme0n1p1 512M vfat part /boot/efi\n└─nvme0n1p2 237G ext4 part / (illustrative)',outputMeaning:['A vfat partition mounted at /boot/efi is a common EFI System Partition pattern.','Device naming and partition sizes vary; never assume nvme0n1 is the correct disk on every robot.'],commonMistake:'Disk names can change between systems. Verify model, serial, size, filesystem and mount points before any disk-writing operation.',roboticsUse:'Confirm the OS disk and EFI partition during maintenance or recovery planning for an edge computer or AMR.'},
      {id:'efi-entries',title:'Inspect UEFI boot entries',command:'efibootmgr -v',purpose:'Read UEFI boot variables on supported systems to inspect the current entry and saved boot order. This learning terminal only returns sample data.',syntax:'sudo efibootmgr -v',tokens:[{token:'efibootmgr',role:'command',meaning:'Reads or manages UEFI boot manager variables when the system is booted in supported UEFI mode.'},{token:'-v',role:'option',meaning:'Shows detailed boot entry information.'}],howItWorks:['The tool reads UEFI NVRAM variables exposed by the running system.','BootCurrent identifies the entry used for this boot; BootOrder records the saved order where supported.','Changing variables is a different, potentially disruptive operation and is not enabled in this simulator.'],expectedOutput:'BootCurrent: 0001 (illustrative)\nBootOrder: 0001,0003,0000\nBoot0001* ubuntu \\EFI\\ubuntu\\shimx64.efi (illustrative)',outputMeaning:['The labels and identifiers are sample entries, not read from the learner’s computer.','The exact menu and entries depend on manufacturer firmware, installed operating systems and boot configuration.'],commonMistake:'Do not confuse selecting USB once in the F12 menu with permanently changing BootOrder. Do not change Secure Boot or boot variables without a recovery plan.',roboticsUse:'Document the boot entry and recovery path before maintenance of a robot computer; avoid changes that stop unattended field startup.'}
  ]},
  'linux-hardware-interfaces': {
    lessonId:'linux-hardware-interfaces',intro:'Discover the hardware and drivers the OS can see before designing a robot communication link. Tool output helps, but the device datasheet and system requirements decide the interface.',mentalModel:'Physical interface, electrical transceiver, protocol, Linux driver and ROS integration are separate layers. A device can be visible to Linux yet still lack a working application-level protocol.',steps:[
      {id:'lsusb',title:'List USB devices',command:'lsusb',purpose:'Check whether USB peripherals and USB-to-serial bridges are enumerated by Linux.',syntax:'lsusb [OPTIONS]',tokens:[{token:'lsusb',role:'command',meaning:'Lists USB buses and devices visible to the USB subsystem.'}],howItWorks:['The tool queries USB device information exposed by the kernel.','Device IDs can be used to identify vendor and product families.','Enumeration alone does not prove the driver or application protocol works.'],expectedOutput:'Bus 001 Device 002: USB-serial adapter (illustrative)\nBus 001 Device 003: depth camera (illustrative)',outputMeaning:['These device names are examples only.','A real output may include vendor/product IDs that can be matched against datasheets.'],commonMistake:'Seeing a USB adapter does not prove the serial port is open, the baud rate is correct or the connected MCU is sending valid frames.',roboticsUse:'Identify USB cameras, depth sensors, debug adapters and USB-serial bridges used during robot integration.'},
      {id:'lspci',title:'List PCI / PCIe devices',command:'lspci',purpose:'Inspect internal controllers such as Ethernet, storage, USB and accelerator hardware.',syntax:'lspci [OPTIONS]',tokens:[{token:'lspci',role:'command',meaning:'Lists PCI bus devices and controllers.'}],howItWorks:['The utility enumerates PCI devices exposed by the system.','Device IDs can help determine chipset or controller type.','Driver binding and runtime health need further inspection.'],expectedOutput:'00:14.0 USB controller (illustrative)\n01:00.0 Ethernet controller (illustrative)',outputMeaning:['Bus/device/function identifiers locate devices on the PCI hierarchy.','This example is generic; actual hardware and IDs differ.'],commonMistake:'lspci showing a controller does not guarantee its kernel driver is loaded or that the peripheral is healthy.',roboticsUse:'Identify NICs, storage controllers and expansion hardware when choosing a compute platform for cameras, LiDAR or accelerator cards.'},
      {id:'ip-link',title:'Inspect network and CAN interfaces',command:'ip link',purpose:'See Linux network interfaces and their link state; configured SocketCAN devices can also appear here.',syntax:'ip link show',tokens:[{token:'ip',role:'command',meaning:'Queries and manages Linux networking.'},{token:'link',role:'object',meaning:'Lists link-layer interface details without necessarily showing IP addresses.'}],howItWorks:['The tool queries interfaces known to the networking stack.','Flags indicate state such as UP or LOWER_UP where provided.','A CAN interface must be configured and supported; it may be named can0, but naming varies.'],expectedOutput:'1: lo: <LOOPBACK,UP>\n2: enp2s0: <BROADCAST,MULTICAST,UP>\n3: can0: <NOARP> (illustrative)',outputMeaning:['lo is loopback; enp2s0 is an example Ethernet interface; can0 is an example CAN interface.','Actual names, state flags and available interfaces depend on drivers and configuration.'],commonMistake:'An interface being listed does not show protocol-level communication is successful. For CAN, also verify bitrate, state, transceiver and bus termination.',roboticsUse:'Map the available network/CAN interfaces before connecting a robot driver to a LiDAR, motor controller, BMS or another computer.'},
      {id:'dmesg-device',title:'Inspect kernel device events',command:'dmesg | grep -i -E "usb|tty|can"',purpose:'Filter kernel messages for recent USB, serial and CAN-related device events.',syntax:'dmesg | grep -i -E "PATTERN"',tokens:[{token:'dmesg',role:'command 1',meaning:'Prints kernel ring-buffer messages.'},{token:'|',role:'pipe',meaning:'Passes the log text to the next program.'},{token:'grep -i -E',role:'filter options',meaning:'Case-insensitive extended regular expression matching.'},{token:'"usb|tty|can"',role:'pattern',meaning:'Matches messages containing any of the example alternatives.'}],howItWorks:['dmesg emits kernel messages.','The pipe sends text into grep.','grep filters lines that match USB, TTY or CAN patterns without changing hardware state.'],expectedOutput:'usb 1-2: new high-speed USB device (illustrative)\nttyUSB0: USB serial device (illustrative)',outputMeaning:['Messages can indicate enumeration or driver binding, but the exact wording depends on the kernel and device.','Permission errors and application protocol failures may be logged elsewhere.'],commonMistake:'Do not assume every kernel message is fatal. Correlate timestamps with plug/unplug events and inspect surrounding messages.',roboticsUse:'Investigate why a USB sensor disappears, a serial adapter changes name, or a CAN adapter fails to initialize.'}
  ]}
};
