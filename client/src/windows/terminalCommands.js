const HELP_LINES = [
  'help              show this list',
  'ls                list project slugs',
  'projects          list projects with tags',
  'cat <project>     show a project description',
  'open <project>    open a project window',
  'about             open the About Me window',
  'whoami            who you are',
  'clear             clear the screen',
];

export function executeCommand(rawInput, env) {
  const input = rawInput.trim();
  if (input === '') return { lines: [], clearScreen: false };

  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ');

  switch (cmd) {
    case 'help':
      return { lines: HELP_LINES, clearScreen: false };

    case 'ls':
      return { lines: env.projects.map((p) => p.slug), clearScreen: false };

    case 'projects':
      return {
        lines: env.projects.map((p) => `${p.slug.padEnd(20)} ${p.title}  [${p.tags.join(', ')}]`),
        clearScreen: false,
      };

    case 'whoami':
      return { lines: ['visitor@portfolio'], clearScreen: false };

    case 'about':
      return { lines: ['Opening About Me...'], clearScreen: false };

    case 'open': {
      const project = env.projects.find((p) => p.slug === arg);
      if (!project) {
        return { lines: [`open: project "${arg}" not found`], clearScreen: false };
      }
      env.openProject(project.slug, project.title);
      return { lines: [`Opening ${project.title}...`], clearScreen: false };
    }

    case 'clear':
      return { lines: [], clearScreen: true };

    case 'sudo':
      return { lines: ['Nice try.'], clearScreen: false };

    default:
      return { lines: [`${cmd}: command not found`], clearScreen: false };
  }
}
