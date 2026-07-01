import { useRef, useState, useEffect } from 'react';
import { executeCommand, getCompletions } from './terminalCommands.js';
import { useKeyboardOffset } from '../hooks/useVisualViewport.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

export default function TerminalWindow({ projects, openProject }) {
  const [history, setHistory] = useState(['Type "help" to get started.']);
  const [input, setInput] = useState('');
  const [pastCommands, setPastCommands] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const tabStateRef = useRef(null);
  const kbOffset = useKeyboardOffset();
  const isMobile = useIsMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // When keyboard appears on mobile, scroll input into view
  useEffect(() => {
    if (!isMobile || kbOffset === 0) return;
    inputRef.current?.scrollIntoView({ block: 'nearest' });
  }, [kbOffset, isMobile]);

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

      const completions = getCompletions(input, env);
      if (completions.length === 0) return;

      if (completions.length === 1) {
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = completions[0];
        const completed = parts.join(' ') + (parts.length === 1 ? ' ' : '');
        tabStateRef.current = null;
        setInput(completed);
        return;
      }

      const commonPrefix = completions.reduce((acc, s) => {
        let i = 0;
        while (i < acc.length && i < s.length && acc[i] === s[i]) i++;
        return acc.slice(0, i);
      });
      const parts = input.split(/\s+/);
      const base = parts.length > 1 ? parts.slice(0, -1).join(' ') + ' ' : '';
      const completed = base + commonPrefix;

      setHistory((h) => [...h, completions.join('  ')]);
      tabStateRef.current = { matches: completions, index: -1, base: completed, current: completed };
      setInput(completed);
      return;
    }

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
    <div
      className="font-mono text-xs flex flex-col"
      style={{
        // On mobile, shrink to avoid keyboard overlap as fallback for non-dvh browsers
        height: isMobile ? `calc(100% - ${kbOffset}px)` : '100%',
        transition: 'height 0.15s ease',
      }}
    >
      {/* History */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words overscroll-contain">
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

      {/* Input bar — sticks to bottom, always above keyboard */}
      <div
        ref={inputRef}
        className="flex items-center gap-2 border-t border-dirty-white/20 pt-2 mt-1 flex-shrink-0"
        style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 4px)' : undefined }}
      >
        <span className="text-accent-orange select-none">$</span>
        <input
          autoFocus={!isMobile} // don't auto-open keyboard on mobile
          ref={inputRef}
          value={input}
          onChange={(e) => { tabStateRef.current = null; setInput(e.target.value); }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-dirty-white caret-accent-orange min-w-0"
          style={{ fontSize: '16px' }} // prevents iOS auto-zoom on focus
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          enterKeyHint="send"
        />
      </div>
    </div>
  );
}
