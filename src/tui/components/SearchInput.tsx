import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { colors, symbols } from '../theme.js';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isFocused?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search skills...',
  isFocused = false,
}: SearchInputProps) {
  return (
    <Box
      borderStyle="single"
      borderColor={isFocused ? colors.primary : colors.borderDim}
      paddingX={1}
    >
      <Text color={colors.secondaryDim}>🔍 </Text>
      {isFocused ? (
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <Text color={value ? colors.secondary : colors.secondaryDim}>
          {value || placeholder}
        </Text>
      )}
      <Box flexGrow={1} />
      <Text color={colors.secondaryDim}>/</Text>
    </Box>
  );
}
