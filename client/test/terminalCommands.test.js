import { describe, it, expect, vi } from 'vitest';
import { executeCommand } from '../src/windows/terminalCommands.js';

const env = {
  projects: [
    { slug: 'example-project', title: 'Example Project', tags: ['demo'], featured: true, thumbnail: null },
  ],
  openProject: vi.fn(),
};

describe('executeCommand', () => {
  it('help lists available commands', () => {
    const result = executeCommand('help', env);
    expect(result.lines.join('\n')).toContain('ls');
    expect(result.lines.join('\n')).toContain('open <project>');
  });

  it('ls lists project slugs', () => {
    const result = executeCommand('ls', env);
    expect(result.lines).toEqual(['example-project']);
  });

  it('projects lists titles and tags', () => {
    const result = executeCommand('projects', env);
    expect(result.lines.join('\n')).toContain('Example Project');
    expect(result.lines.join('\n')).toContain('demo');
  });

  it('whoami returns a fixed identity line', () => {
    const result = executeCommand('whoami', env);
    expect(result.lines[0]).toBe('visitor@bsl-os');
  });

  it('open <project> calls env.openProject with the matching slug and title', () => {
    const result = executeCommand('open example-project', env);
    expect(env.openProject).toHaveBeenCalledWith('example-project', 'Example Project');
    expect(result.lines.join('\n')).toContain('Opening');
  });

  it('open <unknown> reports an error without calling openProject', () => {
    env.openProject.mockClear();
    const result = executeCommand('open nope', env);
    expect(env.openProject).not.toHaveBeenCalled();
    expect(result.lines.join('\n')).toContain('not found');
  });

  it('clear sets clearScreen true', () => {
    const result = executeCommand('clear', env);
    expect(result.clearScreen).toBe(true);
  });

  it('unknown command returns an error line', () => {
    const result = executeCommand('frobnicate', env);
    expect(result.lines.join('\n')).toContain('command not found');
  });

  it('empty input returns no lines', () => {
    const result = executeCommand('   ', env);
    expect(result.lines).toEqual([]);
  });
});
