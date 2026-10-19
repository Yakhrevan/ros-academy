import { describe, expect, it } from 'vitest';
import type { CommandStep } from '../../types/commandLesson';
import { executeCommand, resetTerminalSimulator } from './executeCommand';

const cwd = '/home/student';
const steps: CommandStep[] = [];

describe('Linux terminal virtual filesystem and state', () => {
  it('creates a real virtual file with touch instead of treating it as a directory', () => {
    const created = executeCommand('touch /tmp/ros-academy-touch-test.txt', cwd, steps);
    expect(created.status).toContain('Empty file created');

    const read = executeCommand('cat /tmp/ros-academy-touch-test.txt', cwd, steps);
    expect(read.output).toBe('');
    expect(read.status).toContain('Read virtual file contents');

    const listed = executeCommand('ls -l /tmp/ros-academy-touch-test.txt', cwd, steps);
    expect(listed.output).toContain('-rw-r--r--');
  });

  it('supports overwrite and append redirection across subsequent commands', () => {
    executeCommand('echo first > /tmp/ros-academy-redirect-test.txt', cwd, steps);
    executeCommand('echo second >> /tmp/ros-academy-redirect-test.txt', cwd, steps);

    const read = executeCommand('cat /tmp/ros-academy-redirect-test.txt', cwd, steps);
    expect(read.output).toBe('first\nsecond\n');
    expect(read.status).toContain('Read virtual file contents');
  });

  it('filters a file through a simulated pipe', () => {
    executeCommand('echo motor > /tmp/ros-academy-pipeline-test.txt', cwd, steps);
    executeCommand('echo wheel >> /tmp/ros-academy-pipeline-test.txt', cwd, steps);

    const result = executeCommand('cat /tmp/ros-academy-pipeline-test.txt | grep wheel', cwd, steps);
    expect(result.output).toBe('wheel');
    expect(result.status).toContain('Filtered simulated pipeline output');
  });

  it('preserves file contents through cp, mv and rm', () => {
    executeCommand('echo persistent > /tmp/ros-academy-copy-source.txt', cwd, steps);
    const copied = executeCommand('cp /tmp/ros-academy-copy-source.txt /tmp/ros-academy-copy-dest.txt', cwd, steps);
    expect(copied.status).toContain('Copied');

    expect(executeCommand('cat /tmp/ros-academy-copy-dest.txt', cwd, steps).output).toBe('persistent\n');
    executeCommand('mv /tmp/ros-academy-copy-dest.txt /tmp/ros-academy-moved.txt', cwd, steps);
    expect(executeCommand('cat /tmp/ros-academy-moved.txt', cwd, steps).output).toBe('persistent\n');

    executeCommand('rm /tmp/ros-academy-moved.txt', cwd, steps);
    expect(executeCommand('cat /tmp/ros-academy-moved.txt', cwd, steps).status).toContain('no such file');
  });

  it('creates, traverses and removes directories without confusing files and folders', () => {
    executeCommand('mkdir /tmp/ros-academy-dir-test', cwd, steps);
    executeCommand('touch /tmp/ros-academy-dir-test/readme.txt', cwd, steps);

    const directoryListing = executeCommand('ls -l /tmp/ros-academy-dir-test', cwd, steps);
    expect(directoryListing.output).toContain('-rw-r--r--');
    expect(directoryListing.output).not.toContain('drwxr-xr-x  student student  readme.txt');

    executeCommand('rm -r /tmp/ros-academy-dir-test', cwd, steps);
    expect(executeCommand('ls /tmp/ros-academy-dir-test', cwd, steps).status).toContain('no such entry');
  });

  it('finds files that are listed under virtual directories', () => {
    const result = executeCommand('find /home/student/ros2_ws -name package.xml', cwd, steps);
    expect(result.output).toContain('./src/demo_robot/package.xml');
  });

  it('keeps environment changes visible to later simulated commands', () => {
    executeCommand('export ROS_ACADEMY_TEST=amr', cwd, steps);
    expect(executeCommand('echo $ROS_ACADEMY_TEST', cwd, steps).output).toBe('amr');
    executeCommand('unset ROS_ACADEMY_TEST', cwd, steps);
    expect(executeCommand('echo $ROS_ACADEMY_TEST', cwd, steps).output).toBe('');
  });

  it('returns a useful error for missing files and invalid redirect parents', () => {
    expect(executeCommand('cat /tmp/ros-academy-missing.txt', cwd, steps).status).toContain('no such file');
    expect(executeCommand('echo hello > /missing-dir/file.txt', cwd, steps).status).toContain('parent directory does not exist');
  });

  it('prints environment variables on separate lines', () => {
    const result = executeCommand('env', cwd, steps);
    expect(result.output).toContain('HOME=/home/student\n');
    expect(result.output).toContain('PATH=/opt/ros/humble/bin');
    expect(result.output.split('\n').length).toBeGreaterThan(1);
  });

  it('preserves spaces and quoted text when redirecting output', () => {
    executeCommand('echo "front lidar" > /tmp/ros-academy-quoted-test.txt', cwd, steps);
    expect(executeCommand('cat /tmp/ros-academy-quoted-test.txt', cwd, steps).output).toBe('front lidar\n');
  });

  it('executes semicolon-separated commands in order and carries cwd forward', () => {
    const result = executeCommand('cd /tmp; pwd; echo done', cwd, steps);
    expect(result.cwd).toBe('/tmp');
    expect(result.output).toBe('/tmp\\ndone');
  });

  it('models true and false exit statuses without running host commands', () => {
    expect(executeCommand('true', cwd, steps).status).toContain('status 0');
    expect(executeCommand('false', cwd, steps).status).toContain('status 1');
  });

  it('short-circuits && after a simulated failure', () => {
    const result = executeCommand('false && echo should-not-run', cwd, steps);
    expect(result.output).toBe('');
    expect(result.status).toContain('false');
  });

  it('runs the right-hand command for || after a simulated failure', () => {
    const result = executeCommand('false || echo recovered', cwd, steps);
    expect(result.output).toBe('recovered');
  });

  it('resets filesystem, environment, directory and process state to defaults', () => {
    resetTerminalSimulator();
    executeCommand('echo temporary > /tmp/reset-state-test.txt', cwd, steps);
    executeCommand('export ROS_ACADEMY_RESET_TEST=changed', cwd, steps);
    executeCommand('kill -TERM 1042', cwd, steps);
    executeCommand('cd /tmp', cwd, steps);

    resetTerminalSimulator();

    expect(executeCommand('cat /tmp/reset-state-test.txt', cwd, steps).status).toContain('no such file');
    expect(executeCommand('echo $ROS_ACADEMY_RESET_TEST', cwd, steps).output).toBe('');
    expect(executeCommand('ps -ef', cwd, steps).output).toContain('demo_node');
    expect(executeCommand('pwd', cwd, steps).output).toBe('/home/student');
  });

  it('reflects simulated process termination in later process listings', () => {
    expect(executeCommand('ps -ef', cwd, steps).output).toContain('demo_node');
    executeCommand('kill -TERM 1042', cwd, steps);
    expect(executeCommand('ps -ef', cwd, steps).output).not.toContain('demo_node');
  });
});
