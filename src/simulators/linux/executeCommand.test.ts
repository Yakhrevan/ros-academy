import { describe, expect, it } from 'vitest';
import type { CommandStep } from '../../types/commandLesson';
import { executeCommand } from './executeCommand';

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

  it('reflects simulated process termination in later process listings', () => {
    expect(executeCommand('ps -ef', cwd, steps).output).toContain('demo_node');
    executeCommand('kill -TERM 1042', cwd, steps);
    expect(executeCommand('ps -ef', cwd, steps).output).not.toContain('demo_node');
  });
});
