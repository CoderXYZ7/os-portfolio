import { useRef, useState, useEffect } from 'react';
import { executeCommand } from './terminalCommands.js';

export default function TerminalWindow({ projects, openProject }) {
  const [history, setHistory] = useState(['Type "help" to get started.']);
  const [input, setInput] = useState('');
  const [pastCommands, setPastCommands] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  function runInput() {
    const result = executeCommand(input, { projects, openProject });
    setHistory((h) => (result.clearScreen ? [] : [...h, `> ${input}`, ...result.lines]));
    if (input.trim() !== '') setPastCommands((p) => [...p, input]);
    setHistoryIndex(-1);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      runInput();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;
      const nextIndex = historyIndex === -1 ? pastCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(pastCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= pastCommands.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(pastCommands[nextIndex]);
      }
    }
  }

  return (
    <div className="font-mono text-xs h-full flex flex-col">
      <div className="flex-1 overflow-auto whitespace-pre-wrap">
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-1 border-t border-dirty-white pt-1">
        <span className="text-accent-orange">$</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-dirty-white"
        />
      </div>
    </div>
  );
}
