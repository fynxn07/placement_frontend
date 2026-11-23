import { useEffect, useState } from 'react';

export default function SearchableFilter({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search...',
}) {
  const selected = options.find(o => o.value === value);
  const [text, setText] = useState(selected ? selected.label : '');

  useEffect(() => {
    setText(selected ? selected.label : '');
  }, [selected?.label]);

  const handleChange = e => {
    const typed = e.target.value;
    setText(typed);

    const match = options.find(
      o => o.label.toLowerCase() === typed.trim().toLowerCase()
    );
    if (match) onChange(match.value);
    else if (typed === '') onChange('');
  };

  const listId = `list-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        list={listId}
        value={text}
        onChange={handleChange}
        onBlur={() => setText(selected ? selected.label : '')}
        placeholder={placeholder}
        className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-normal bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <datalist id={listId}>
        {options.map(o => (
          <option key={o.value} value={o.label} />
        ))}
      </datalist>
    </label>
  );
}
