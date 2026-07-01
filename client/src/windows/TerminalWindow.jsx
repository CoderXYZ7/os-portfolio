import { useRef, useState, useEffect } from 'react';
import { executeCommand, getCompletions } from './terminalCommands.js';

export default function TerminalWindow({ projects, openProject }) {
  const [history, setHistory] = useState(['Type "help" to get started.']);
  const [input, setInput] = useState('');
  const [pastCommands, setPastCommands] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef(null);
  // tab completion cycling state
  const tabStateRef = useRef(null); // { matches, index, base }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  function runInput() {
    tabStateRef.current = null;
    const result = executeCommand(input, { projects, openProject });
    setHistory((h) => (result.clearScreen ? [] : [...h, `> ${input}`, ...result.lines]));
    if (input.trim() !== '') setPastCommands((p) => [...p, input]);
    setHistoryIndex(-1);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const env = { projects, openProject };

      // If continuing a tab cycle, advance index
      if (tabStateRef.current && input === tabStateRef.current.current) {
        const { matches, index, base } = tabStateRef.current;
        if (matches.length === 0) return;
        const next = (index + 1) % matches.length;
        const parts = base.split(/\s+/);
        parts[parts.length - 1] = matches[next];
        const completed = parts.join(' ');
        tabStateRef.current = { matches, index: next, base, current: completed };
        setInput(completed);
        return;
      }

      // Fresh tab press
      const completions = getCompletions(input, env);
      if (completions.length === 0) return;

      if (completions.length === 1) {
        // Unambiguous: complete and add trailing space for commands
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = completions[0];
        const completed = parts.join(' ') + (parts.length === 1 ? ' ' : '');
        tabStateRef.current = null;
        setInput(completed);
        return;
      }

      // Multiple matches: show them and start cycling
      const commonPrefix = completions.reduce((acc, s) => {
        let i = 0;
        while (i < acc.length && i < s.length && acc[i] === s[i]) i++;
        return acc.slice(0, i);
      });
      const parts = input.split(/\s+/);
      const base = [...parts.slice(0, -1), ''].join(' ').trimStart() !== ''
        ? parts.slice(0, -1).join(' ') + ' '
        : '';
      const completed = base + commonPrefix;

      setHistory((h) => [...h, completions.join('  ')]);
      tabStateRef.current = { matches: completions, index: -1, base: completed, current: completed };
      setInput(completed);
      return;
    }

    // Any non-tab key resets tab cycle
    tabStateRef.current = null;

    if (e.key === 'Enter') {
      runInput();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;
      const next = historyIndex === -1 ? pastCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(pastCommands[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= pastCommands.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(pastCommands[next]);
      }
    }
  }

  return (
    <div className="font-mono text-xs h-full flex flex-col">
      <div className="flex-1 overflow-auto whitespace-pre-wrap break-all">
        {history.map((line, i) => (
          <div
            key={i}
            className={line.startsWith('>') ? 'text-accent-orange/80' : 'text-dirty-white/90'}
          >
            {line || ' '}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-1 border-t border-dirty-white/20 pt-1 mt-1">
        <span className="text-accent-orange select-none">$</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => { tabStateRef.current = null; setInput(e.target.value); }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-dirty-white caret-accent-orange"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}
