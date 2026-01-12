import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureAuthenticated } from './auth.js';
import { parseEntireWork, isWorkLocked } from './parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getFetchHeaders = (cookies = null) => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://archiveofourown.org/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };
  if (cookies) {
    headers['Cookie'] = cookies;
  }
  return headers;
};

router.post('/download-work', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!url.includes('archiveofourown.org/works/')) {
      return res.status(400).json({ error: 'Invalid AO3 work URL' });
    }
    
    console.log('[download-work] Processing URL:', url);

    // Extract workId from URL
    const workIdMatch = url.match(/\/works\/(\d+)/);
    if (!workIdMatch) {
      return res.status(400).json({ error: 'Could not extract work ID from URL' });
    }

    // Construct full work URL with view_full_work=true
    // This gives us the page source format (like entire_work_page_source.html)
    const fullWorkUrl = url.includes('?') 
      ? `${url}&view_full_work=true`
      : `${url}?view_full_work=true`;

    // Retry logic for temporary failures (SSL handshake, network issues)
    let response;
    const maxRetries = 3;
    const baseRetryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(fullWorkUrl, {
          headers: getFetchHeaders(),
          redirect: 'follow',
          timeout: 30000
        });
        
        // If we get a 525 (SSL handshake failed), retry
        if (response.status === 525 && attempt < maxRetries) {
          const retryDelay = baseRetryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Attempt ${attempt} failed with 525 (SSL handshake failed), retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // If successful or non-retryable error, break
        break;
      } catch (fetchError) {
        // If it's a network error and we have retries left, retry
        if ((fetchError.code === 'ENOTFOUND' || fetchError.code === 'ETIMEDOUT' || fetchError.message?.includes('SSL') || fetchError.message?.includes('handshake')) && attempt < maxRetries) {
          const retryDelay = baseRetryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Attempt ${attempt} failed with ${fetchError.code || fetchError.message}, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        // If no more retries or non-retryable error, throw
        throw fetchError;
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Work not found' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limited. Please try again later.' });
      }
      if (response.status === 525) {
        return res.status(503).json({ error: 'SSL handshake failed. AO3 may be temporarily unavailable or blocking the request.' });
      }
      throw new Error(`Failed to fetch work: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    if (!html || html.trim() === '') {
      return res.status(500).json({ error: 'Received empty response from AO3' });
    }
    
    // Check if work is locked
    if (isWorkLocked(html)) {
      try {
        const cookies = await ensureAuthenticated();
        
        // Retry fetch with authentication
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            response = await fetch(fullWorkUrl, {
              headers: getFetchHeaders(cookies),
              redirect: 'follow',
              timeout: 30000
            });
            
            if (response.status === 525 && attempt < maxRetries) {
              const retryDelay = baseRetryDelay * Math.pow(2, attempt - 1);
              console.log(`Authenticated attempt ${attempt} failed with 525, retrying in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            
            break;
          } catch (fetchError) {
            if ((fetchError.code === 'ENOTFOUND' || fetchError.code === 'ETIMEDOUT' || fetchError.message?.includes('SSL') || fetchError.message?.includes('handshake')) && attempt < maxRetries) {
              const retryDelay = baseRetryDelay * Math.pow(2, attempt - 1);
              console.log(`Authenticated attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            throw fetchError;
          }
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch locked work: ${response.status}`);
        }
        
        const authHtml = await response.text();
        if (!authHtml || authHtml.trim() === '') {
          return res.status(500).json({ error: 'Received empty response from AO3 after authentication' });
        }
        
        const result = parseEntireWork(authHtml, url);
        return res.json(result);
      } catch (authError) {
        console.error('Authentication error:', authError);
        if (authError.message && authError.message.includes('parse')) {
          return res.status(500).json({ 
            error: 'Failed to parse work. The AO3 page structure may have changed.' 
          });
        }
        return res.status(403).json({ 
          error: 'This work is locked and requires AO3 authentication. Please configure AO3_USERNAME and AO3_PASSWORD in .env file.' 
        });
      }
    }

    try {
      const result = parseEntireWork(html, url);
      res.json(result);
    } catch (parseError) {
      console.error('=== PARSING ERROR ===');
      console.error('Error message:', parseError.message);
      console.error('Error stack:', parseError.stack);
      
      // Save HTML to file for debugging if parsing fails
      try {
        const fs = await import('fs');
        const debugPath = path.join(__dirname, '../../debug-ao3-response.html');
        fs.writeFileSync(debugPath, html, 'utf-8');
        console.error(`✅ Debug: Saved HTML response (${html.length} chars) to ${debugPath}`);
      } catch (saveError) {
        console.error('❌ Could not save debug HTML:', saveError);
      }
      
      res.status(500).json({ 
        error: `Failed to parse entire work: ${parseError.message}` 
      });
    }
  } catch (error) {
    console.error('Download work error:', error);
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      res.status(503).json({ 
        error: 'Unable to connect to AO3. Please check your internet connection and try again.' 
      });
    } else {
      res.status(500).json({ 
        error: error.message || 'Failed to download work' 
      });
    }
  }
});

export default router;
