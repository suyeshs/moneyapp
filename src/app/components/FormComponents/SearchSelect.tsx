import React, { useState } from 'react';
//import './SearchSelect.css';

// Define the Option type
interface Option {
  value: string;
  label: string;
}

interface SearchSelectProps {
  dataSource: Option[];
  onSelect: (selectedOption: Option | null) => void;
}

const SearchSelect: React.FC<SearchSelectProps> = ({ dataSource, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(dataSource);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filtered = dataSource.filter(option =>
      option.label.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleSelect = (selectedValue: string) => {
    const selectedOption = dataSource.find(option => option.value === selectedValue) || null;
    onSelect(selectedOption);
  };

  return (
    <div className="search-select-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search..."
        className="search-input"
      />
      <ul className="options-list">
        {filteredOptions.map(option => (
          <li key={option.value} onClick={() => handleSelect(option.value)} className="option-item">
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchSelect;
