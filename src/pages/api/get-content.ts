import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'contentful';

// Initialize Contentful client
function initContentfulClient() {
  const {
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_ENVIRONMENT,
    CONTENTFUL_ACCESS_TOKEN,
  } = process.env;

  if (
    !CONTENTFUL_SPACE_ID ||
    !CONTENTFUL_ENVIRONMENT ||
    !CONTENTFUL_ACCESS_TOKEN
  ) {
    throw new Error('Contentful environment variables are not set');
  }

  return createClient({
    space: CONTENTFUL_SPACE_ID,
    environment: CONTENTFUL_ENVIRONMENT,
    accessToken: CONTENTFUL_ACCESS_TOKEN,
  });
}

/**
 * Get content from Contentful API endpoint
 * Supports fetching by ID, type, or slug
 * 
 * @param req - Request with content type, ID, or slug
 * @param res - Response with content data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, type, slug } = req.query;
    const client = initContentfulClient();
    
    // Get entry by ID
    if (id && typeof id === 'string') {
      const entry = await client.getEntry(id);
      return res.status(200).json(entry);
    }
    
    // Get entries by content type
    if (type && typeof type === 'string') {
      const query: Record<string, any> = {
        content_type: type,
      };
      
      // Add slug filter if provided
      if (slug && typeof slug === 'string') {
        query['fields.slug'] = slug;
      }
      
      const entries = await client.getEntries(query);
      
      if (slug) {
        // If slug was provided, return the first matching entry
        const entry = entries.items.find(
          (item) => item.fields.slug === slug
        );
        
        if (!entry) {
          return res.status(404).json({ 
            error: `Entry with slug '${slug}' not found` 
          });
        }
        
        return res.status(200).json(entry);
      }
      
      // Return all entries of the specified type
      return res.status(200).json(entries);
    }
    
    // No valid parameters provided
    return res.status(400).json({ 
      error: 'Missing required parameters: type, id, or slug' 
    });
  } catch (error) {
    console.error('Error in get-content API:', error);
    
    // Handle Contentful specific errors
    if (typeof error === 'object' && error !== null && 'sys' in error && 
        error.sys && typeof error.sys === 'object' && 'id' in error.sys && 
        error.sys.id === 'NotFound') {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get content by ID - used in server-side rendering
 */
export async function getContentById(entryId: string) {
  try {
    const client = initContentfulClient();
    const entry = await client.getEntry(entryId);
    return entry;
  } catch (error) {
    console.error(`Error fetching content ID ${entryId}:`, error);
    return null;
  }
}

/**
 * Get content by type - used in server-side rendering
 */
export async function getContentByType(contentType: string) {
  try {
    const client = initContentfulClient();
    const entries = await client.getEntries({
      content_type: contentType,
    });
    return entries;
  } catch (error) {
    console.error(`Error fetching content type ${contentType}:`, error);
    return { items: [] };
  }
}