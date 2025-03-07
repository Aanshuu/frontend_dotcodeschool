import { useCallback } from 'react';
import axios from 'axios';
import { find, map } from 'lodash';
import { File } from '@/types';

/**
 * Hook to manage Contentful content fetching and processing
 */
export function useContentful() {
  /**
   * Fetch file content from Contentful
   */
  const fetchFile = useCallback(async (file: any): Promise<File> => {
    if (typeof file !== 'object' || !file.fields) {
      throw new Error('File is not an object or file.fields is null');
    }

    const { url, fileName } = file.fields.file;
    
    try {
      const response = await fetch(`https:${url}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        fileName,
        code: await response.text(),
        language: fileName.endsWith('.diff') ? 'diff' : getLanguageFromFileName(fileName),
      };
    } catch (error) {
      console.error(`Error fetching file ${fileName}:`, error);
      throw error;
    }
  }, []);

  /**
   * Get files for a chapter (source, template, solution)
   */
  const getFilesForChapter = useCallback(async (files: any) => {
    try {
      const source = await Promise.all(
        map(files.fields.source || [], fetchFile)
      ).catch(error => {
        console.error('Error fetching source files:', error);
        return [];
      });
      
      const template = await Promise.all(
        map(files.fields.template || [], fetchFile)
      ).catch(error => {
        console.error('Error fetching template files:', error);
        return [];
      });
      
      const solution = await Promise.all(
        map(files.fields.solution || [], fetchFile)
      ).catch(error => {
        console.error('Error fetching solution files:', error);
        return [];
      });

      return { source, template, solution };
    } catch (error) {
      console.error('Error getting files for chapter:', error);
      throw error;
    }
  }, [fetchFile]);

  /**
   * Get course details
   */
  const getCourseDetails = useCallback(async (slug: string) => {
    try {
      const response = await axios.get('/api/get-content', {
        params: { type: 'courseModule', slug },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching course details for ${slug}:`, error);
      throw error;
    }
  }, []);

  return {
    fetchFile,
    getFilesForChapter,
    getCourseDetails,
  };
}

/**
 * Determine language from file name for syntax highlighting
 */
function getLanguageFromFileName(fileName: string): string {
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
    default:
      return 'text';
  }
}