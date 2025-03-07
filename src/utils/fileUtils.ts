/**
 * Utilities for file operations and parsing
 */

/**
 * Parse a diff string to extract original and modified content
 */
export function parseDiff(diff: string) {
    const lines = diff.split('\n');
    let originalContent = '';
    let modifiedContent = '';
    let currentFile = '';
    let inHunk = false;
  
    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        // Start of a new file diff
        currentFile = line.split(' ')[2];
        originalContent += line + '\n';
        modifiedContent += line + '\n';
      } else if (
        line.startsWith('index') ||
        line.startsWith('--- ') ||
        line.startsWith('+++ ')
      ) {
        // Ignore these lines
        continue;
      } else if (line.startsWith('@@ ')) {
        // Hunk header
        inHunk = true;
        originalContent += line + '\n';
        modifiedContent += line + '\n';
      } else if (inHunk) {
        // Content lines
        if (line.startsWith('-')) {
          originalContent += line + '\n';
        } else if (line.startsWith('+')) {
          modifiedContent += line + '\n';
        } else {
          originalContent += line + '\n';
          modifiedContent += line + '\n';
        }
      }
    }
  
    return { originalContent, modifiedContent };
  }
  
  /**
   * Get programming language from file extension
   */
  export function getLanguageFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'jsx':
        return 'javascript';
      case 'tsx':
        return 'typescript';
      case 'rs':
        return 'rust';
      case 'py':
        return 'python';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'md':
        return 'markdown';
      case 'diff':
        return 'diff';
      default:
        return 'plaintext';
    }
  }
  
  /**
   * Check if a file is a diff file
   */
  export function isDiffFile(fileName: string): boolean {
    return fileName.endsWith('.diff');
  }
  
  /**
   * Clean code for comparison (remove comments and whitespace)
   */
  export function cleanCodeForComparison(code: string): string {
    try {
      // This is a simplified version - in a real app, you might want to use
      // a proper parser for the specific language
      const withoutComments = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*/g, '') // Remove line comments
        .replace(/^\s*\n/gm, ''); // Remove empty lines
  
      return withoutComments.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error cleaning code:', error);
      return code;
    }
  }