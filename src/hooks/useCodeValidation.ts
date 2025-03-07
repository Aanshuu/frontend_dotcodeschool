import { useState, useCallback } from 'react';
import { find, map } from 'lodash';
import stripComments from 'strip-comments';
import { File } from '@/types';

/**
 * Hook to manage code validation and comparison with solutions
 */
export function useCodeValidation(rawFiles: File[], solution: File[]) {
  const [doesMatch, setDoesMatch] = useState(false);
  const [incorrectFiles, setIncorrectFiles] = useState<File[]>([]);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [showHints, setShowHints] = useState(false);

  /**
   * Compare user code with solution
   * @returns True if all files match the solution
   */
  const validateCode = useCallback(() => {
    const incorrect: File[] = [];
    
    const matchResults = map(rawFiles, (file) => {
      // Skip diff files
      if (file.fileName.endsWith('.diff')) return true;
      
      // Find matching solution file
      const solutionFile = find(
        solution,
        ({ fileName }) => fileName === file.fileName
      );
      
      // Remove comments and whitespace for comparison
      const fileCodeWithoutComments = stripComments(file.code);
      const fileContent = fileCodeWithoutComments.replace(/\s+/g, ' ').trim();

      const solutionCodeWithoutComments = stripComments(
        solutionFile
          ? solutionFile.code
          : '// This file doesn\'t have a solution.'
      );
      const solutionContent = solutionCodeWithoutComments
        .replace(/\s+/g, ' ')
        .trim();

      // Check if file matches solution
      const isFileCorrect = fileContent === solutionContent || !solutionFile;
      
      // Track incorrect files
      if (!isFileCorrect) {
        incorrect.push(file);
      }
      
      return isFileCorrect;
    });
    
    // All files must match
    const allMatch = matchResults.every(result => result);
  
    setIncorrectFiles(incorrect);
    setDoesMatch(allMatch);
    setCheckedAnswer(true);
    setShowHints(!allMatch);
    
    return allMatch; // Return the result
  }, [rawFiles, solution]);

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    setDoesMatch(false);
    setIncorrectFiles([]);
    setCheckedAnswer(false);
    setShowHints(false);
  }, []);

  return {
    doesMatch,
    incorrectFiles,
    checkedAnswer,
    showHints,
    validateCode,
    resetValidation,
    setShowHints
  };
}