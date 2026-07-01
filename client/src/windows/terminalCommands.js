// ── Visible files ──────────────────────────────────────────────────────────
// project slugs are injected at runtime

// ── Hidden files ───────────────────────────────────────────────────────────
const HIDDEN_FILES = {
  '.gitconfig': [
    '[user]',
    '    name = daniele',
    '    email = badsiliconlabs@gmail.com',
    '[core]',
    '    editor = vim',
    '    autocrlf = false',
    '[alias]',
    '    st = status',
    '    co = checkout',
    '    yolo = push --force',
    '    oops = reset --soft HEAD~1',
  ],
  '.bash_history': [
    'sudo rm -rf /',
    '# (dont worry, ctrl-c saved the day)',
    'git commit -m "fix"',
    'git commit -m "actual fix"',
    'git commit -m "ok for real this time"',
    'git commit -m "."',
    'cd ..',
    'cd ..',
    'cd ..',
    'ls',
    'cd Dev',
    'python train.py --epochs 9999',
    '# (still running)',
    'coffee',
  ],
  '.secret': [
    '',
    '  You found the secrets file.',
    '',
    '  The best code is the code you never have to write.',
    '  The second best writes itself.',
    '  I\'m working on both.',
    '',
    '  - D',
    '',
    '  P.S. coffee.ko is not a real kernel module.',
    '       (yet)',
    '',
  ],
  '.coffee_count': ['1,337'],
  '.bslrc': [
    '# BSL shell config',
    'export PATH="$HOME/Dev/bin:$PATH"',
    'export EDITOR=vim',
    'export COFFEE_THRESHOLD=3',
    'alias gs="git status"',
    'alias ll="ls -la"',
    'alias yeet="rm -rf"    # use responsibly',
    '',
    '# reminder: ideas > sleep',
  ],
};

const HIDDEN_NAMES = Object.keys(HIDDEN_FILES);

// ── ASCII art ───────────────────────────────────────────────────────────────
const NEOFETCH_LOGO = [
  '  ██████╗ ███████╗██╗',
  '  ██╔══██╗██╔════╝██║',
  '  ██████╔╝███████╗██║',
  '  ██╔══██╗╚════██║██║',
  '  ██████╔╝███████║███████╗',
  '  ╚═════╝ ╚══════╝╚══════╝',
  '         / O S  v1.0.0',
];

const COFFEE_ART = [
  '    ) )',
  '   ( (',
  '  .______.',
  '  |      |]',
  '  \\      /',
  "   `----'",
  '',
  '  Brewing...',
  '  Status: beans OK, motivation OK',
  '  Warning: coffee_count has reached 1337',
];

const FORTUNES = [
  '"Any sufficiently advanced technology is indistinguishable from magic." - Clarke',
  '"Programs must be written for people to read, and only incidentally for machines to execute." - Abelson',
  '"The most dangerous phrase in the language is \'We\'ve always done it this way\'." - Hopper',
  '"It\'s not a bug, it\'s an undocumented feature." - folklore',
  '"In theory, theory and practice are the same. In practice, they are not." - Yogi Berra',
  '"The best error message is the one that never shows up." - unknown',
  '"First, solve the problem. Then, write the code." - Wirth',
  '"sleep is for the weakly typed." - anon',
];

// ── Help ────────────────────────────────────────────────────────────────────
const HELP_LINES = [
  'help              show this list',
  'ls [-a]           list files (use -a to reveal all)',
  'cat <file>        print file contents',
  'open <project>    open a project window',
  'projects          list all projects',
  'whoami            identify yourself',
  'uname [-a]        kernel info',
  'date              current date/time',
  'echo <text>       echo text',
  'neofetch          system info',
  'coffee            essential utility',
  'fortune           wisdom',
  'hack              initiate hack sequence',
  'clear             clear the screen',
];

// ── Tab completion ──────────────────────────────────────────────────────────
const ALL_COMMANDS = [
  'help', 'ls', 'cat', 'open', 'projects', 'whoami', 'uname', 'date',
  'echo', 'neofetch', 'coffee', 'fortune', 'hack', 'clear', 'sudo',
  'vim', 'nano', 'emacs', 'konami', 'sl', 'exit', 'logout', 'pwd', 'rm',
];

export function getCompletions(input, env) {
  const parts = input.split(/\s+/);
  const prefix = parts[parts.length - 1];

  if (parts.length === 1) {
    return ALL_COMMANDS.filter((c) => c.startsWith(prefix));
  }

  const cmd = parts[0];
  if (cmd === 'cat') {
    const candidates = [...HIDDEN_NAMES, ...env.projects.map((p) => p.slug)];
    return candidates.filter((c) => c.startsWith(prefix));
  }
  if (cmd === 'open') {
    return env.projects.map((p) => p.slug).filter((s) => s.startsWith(prefix));
  }
  return [];
}

// ── Command executor ────────────────────────────────────────────────────────
export function executeCommand(rawInput, env) {
  const input = rawInput.trim();
  if (input === '') return { lines: [], clearScreen: false };

  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ');
  const flags = rest.filter((r) => r.startsWith('-'));
  const positional = rest.filter((r) => !r.startsWith('-')).join(' ');

  const ok = (lines) => ({ lines, clearScreen: false });
  const clear = () => ({ lines: [], clearScreen: true });

  switch (cmd.toLowerCase()) {

    case 'help':
      return ok(HELP_LINES);

    case 'ls': {
      const showHidden = flags.includes('-a') || flags.includes('-la') || flags.includes('-al');
      const projectFiles = env.projects.map((p) => p.slug);
      if (showHidden) {
        return ok([...HIDDEN_NAMES, ...projectFiles]);
      }
      return ok(projectFiles);
    }

    case 'cat': {
      if (!arg) return ok(['cat: missing operand']);
      // hidden file?
      if (HIDDEN_FILES[arg]) return ok(HIDDEN_FILES[arg]);
      // project slug?
      const project = env.projects.find((p) => p.slug === arg);
      if (project) {
        return ok([
          `# ${project.title}`,
          `tags: ${project.tags.join(', ')}`,
          '',
          ...(project.description ? [project.description] : ['(no description)']),
        ]);
      }
      return ok([`cat: ${arg}: No such file or directory`]);
    }

    case 'projects':
      return ok(env.projects.map((p) => `${p.slug.padEnd(22)} ${p.title}  [${p.tags.join(', ')}]`));

    case 'open': {
      if (!positional) return ok(['open: missing project name']);
      const project = env.projects.find((p) => p.slug === positional);
      if (!project) return ok([`open: "${positional}": project not found`]);
      env.openProject(project.slug, project.title);
      return ok([`Opening ${project.title}...`]);
    }

    case 'whoami':
      return ok(['visitor@bsl-os', 'uid=1000(visitor) gid=1000(visitor) groups=1000(visitor),4(adm)']);

    case 'uname': {
      if (flags.includes('-a') || arg === '-a') {
        return ok(['BSL-OS bsl-kernel 4.20.0-bsl #1 SMP PREEMPT_DYNAMIC Bad Silicon Labs GNU/Linux x86_64']);
      }
      return ok(['BSL-OS']);
    }

    case 'date':
      return ok([new Date().toString()]);

    case 'echo':
      return ok([arg]);

    case 'neofetch': {
      const uptime = Math.floor(performance.now() / 1000);
      const mins = Math.floor(uptime / 60);
      const secs = uptime % 60;
      const info = [
        `visitor@bsl-os`,
        `--------------`,
        `OS:       BSL/OS v1.0.0`,
        `Kernel:   bsl-kernel 4.20.0`,
        `Uptime:   ${mins}m ${secs}s`,
        `Shell:    bsl-sh 2.0`,
        `Terminal: BSL Terminal`,
        `CPU:      Brain @ variable GHz`,
        `Memory:   enough / ∞ MB`,
        `Projects: ${env.projects.length} loaded`,
      ];
      // interleave logo and info
      const lines = NEOFETCH_LOGO.map((logoLine, i) => {
        const infoLine = info[i] ?? '';
        return `${logoLine.padEnd(30)} ${infoLine}`;
      });
      while (lines.length < info.length) lines.push(' '.repeat(30) + ' ' + info[lines.length]);
      return ok(lines);
    }

    case 'coffee':
      return ok(COFFEE_ART);

    case 'fortune':
      return ok([FORTUNES[Math.floor(Math.random() * FORTUNES.length)]]);

    case 'hack':
      return ok([
        'Initializing hack sequence...',
        '[##########          ] 50%  Bypassing firewall...',
        '[##################  ] 90%  Accessing mainframe...',
        '[####################] 100% Root acquired.',
        '',
        'ACCESS DENIED.',
        '',
        'just kidding :)',
      ]);

    case 'clear':
      return clear();

    case 'sudo': {
      const fullArg = rest.join(' ');
      if (fullArg === 'make me a sandwich') return ok(['ok.']);
      if (fullArg.includes('rm -rf')) return ok(['I\'m not going to do that.']);
      return ok(['[sudo] password for visitor:', 'Sorry, try again.', 'sudo: 3 incorrect password attempts']);
    }

    case 'rm':
      if (rest.includes('-rf') || rest.includes('-rf /')) {
        return ok(['rm: nice try', 'rm: (filesystem protected by vibes)']);
      }
      return ok([`rm: cannot remove: permission denied`]);

    case 'vim':
    case 'nano':
    case 'emacs':
      return ok([`${cmd}: opening ${positional || 'unnamed'}...`, '(just kidding, this is a browser)']);

    case 'konami':
      return ok([
        '↑ ↑ ↓ ↓ ← → ← → B A',
        '',
        '+30 lives added to your session.',
        'not that you needed them.',
      ]);

    case 'sl':
      return ok([
        '       ====        ________                ___________    ',
        '   _D _|  |_______/        \\__I_I_____===__|_________|   ',
        '    |(_)---  |   H\\________/ |   |        =|___ ___|    ',
        '    /     |  |   H  |  |     |   |         ||_| |_||    ',
        '   |      |  |   H  |__--------------------| [___] |    ',
        '   | ________|___H__/__|_____/[][]~\\_______| [ ] [ ]|   ',
        '   |/ |   |-----------I_____I [][] []  D |=====|____|   ',
        ' __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|   ',
        '  |/-=|___|=    ||    ||    ||    |_____/~\\___/       ',
        '   \\_/      \\_O=====O=====O=====O_/      \\_/         ',
        '',
        '  (you typed sl instead of ls, didn\'t you)',
      ]);

    case 'exit':
    case 'logout':
      return ok(['logout: session cannot be terminated', '(close the window instead)']);

    case 'pwd':
      return ok(['/home/daniele/portfolio']);

    default:
      return ok([`${cmd}: command not found`, 'try "help" to see available commands']);
  }
}
