import React, { useState } from 'react';

interface SearchSelectInputProps {
  placeholder: string;
  options: string[];
}

interface SearchSelectInputState {
  searchTerm: string;
  selectedOption: string | null;
  isOpen: boolean;
}

const useSearchSelectInput = ({
  placeholder,
  options,
}: SearchSelectInputProps) => {
  const [state, setState] = useState<SearchSelectInputState>({
    searchTerm: '',
    selectedOption: null,
    isOpen: false,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setState((prevState) => ({
      ...prevState,
      searchTerm,
      isOpen: true, // Always open the options list when the input changes
    }));
  };

  const handleOptionSelect = (option: string) => {
    setState((prevState) => ({
      ...prevState,
      selectedOption: option,
      isOpen: false, // Close the options list after selection
    }));
  };

  return {
    ...state,
    handleInputChange,
    handleOptionSelect,
    placeholder,
    options,
  };
};

const SearchSelectInput: React.FC<SearchSelectInputProps> = ({
  placeholder,
  options,
}) => {
  const {
    searchTerm,
    selectedOption,
    isOpen,
    handleInputChange,
    handleOptionSelect,
  } = useSearchSelectInput({ placeholder, options });

  return (
    <div className="search-select-input">
      <div className="input-wrapper">
        <i className="search-icon">🔍</i>
        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          onChange={handleInputChange}
        />
      </div>

      {isOpen && (
        <div className="options-list">
          {options
            .filter((option) =>
              option.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((option) => (
              <div
                key={option}
                className="option-item"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </div>
            ))}
        </div>
      )}

      {selectedOption && (
        <div className="selected-option">Selected: {selectedOption}</div>
      )}
    </div>
  );
};

export default SearchSelectInput;
