import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full'
});

function cleanHtml(html) {
  const $ = cheerio.load(html);
  
  $('script').remove();
  $('style').remove();
  $('noscript').remove();
  
  $('#header').remove();
  $('#footer').remove();
  $('.navigation').remove();
  $('.actions').remove();
  $('.meta.group').remove();
  $('.preface.group').remove();
  $('.notes.module').remove();
  $('.end.notes.module').remove();
  $('.kudos').remove();
  $('.comments').remove();
  $('.share').remove();
  $('.bookmark').remove();
  $('.download').remove();
  $('nav').remove();
  $('header').remove();
  $('footer').remove();
  
  return $.html();
}

function convertHtmlToMarkdown(html) {
  if (!html || html.trim() === '') {
    return '';
  }
  
  const cleanedHtml = cleanHtml(html);
  
  try {
    const markdown = turndownService.turndown(cleanedHtml);
    return markdown.trim();
  } catch (error) {
    console.error('Markdown conversion error:', error);
    return cleanedHtml.replace(/<[^>]*>/g, '').trim();
  }
}

export function parseWorkMetadata(html, workUrl) {
  if (!html || html.trim() === '') {
    throw new Error('Empty HTML content provided');
  }

  try {
    const $ = cheerio.load(html, {
      decodeEntities: true,
      normalizeWhitespace: false
    });
    
    const workIdMatch = workUrl.match(/\/works\/(\d+)/);
    const workId = workIdMatch ? workIdMatch[1] : null;

    if (!workId) {
      throw new Error('Could not extract work ID from URL');
    }

    const title = $('h2.title.heading').first().text().trim() || 
                  $('h2.title').first().text().trim() ||
                  $('h1.title').first().text().trim() || 
                  $('h1').first().text().trim() ||
                  'Untitled';

    const authors = [];
    $('h3.byline.heading a[rel="author"]').each((i, el) => {
      const authorName = $(el).text().trim();
      if (authorName) authors.push(authorName);
    });
    
    if (authors.length === 0) {
      $('h3.byline a[rel="author"]').each((i, el) => {
        const authorName = $(el).text().trim();
        if (authorName) authors.push(authorName);
      });
    }
    
    if (authors.length === 0) {
      $('.byline a').each((i, el) => {
        const authorName = $(el).text().trim();
        if (authorName && !authors.includes(authorName)) authors.push(authorName);
      });
    }
    
    const author = authors.length > 0 ? authors.join(', ') : 'Unknown';

    let summary = '';
    const summaryBlockquote = $('div.summary.module blockquote.userstuff').first();
    if (summaryBlockquote.length > 0) {
      summary = summaryBlockquote.text().trim();
    } else {
      const summaryP = $('div.summary.module p.summary').first();
      if (summaryP.length > 0) {
        summary = summaryP.text().trim();
      } else {
        summary = $('div.summary.module').first().text().trim();
      }
    }

    let rating = 'Not Rated';
    const ratingTag = $('dd.rating.tags a.tag').first();
    if (ratingTag.length > 0) {
      rating = ratingTag.text().trim();
    } else {
      const ratingText = $('dd.rating.tags').first().text().trim();
      if (ratingText) rating = ratingText;
    }

    const tags = [];
    $('dd.freeform.tags a.tag').each((i, el) => {
      const tagText = $(el).text().trim();
      if (tagText) tags.push(tagText);
    });
    
    if (tags.length === 0) {
      $('dd.freeform.tags').first().find('a').each((i, el) => {
        const tagText = $(el).text().trim();
        if (tagText) tags.push(tagText);
      });
    }

    let wordCount = 0;
    const wordCountText = $('dd.words').first().text().trim();
    if (wordCountText) {
      const parsed = parseInt(wordCountText.replace(/,/g, ''), 10);
      if (!isNaN(parsed)) wordCount = parsed;
    }

    const chapters = [];
    
    $('ol.chapter.index li').each((i, el) => {
      const $link = $(el).find('a').first();
      const chapterUrl = $link.attr('href');
      let chapterTitle = $link.text().trim();
      
      if (!chapterTitle) {
        chapterTitle = $(el).text().trim();
      }
      
      if (!chapterTitle) {
        chapterTitle = `Chapter ${i + 1}`;
      }
      
      if (chapterUrl) {
        const fullUrl = chapterUrl.startsWith('http') 
          ? chapterUrl 
          : `https://archiveofourown.org${chapterUrl}`;
        
        chapters.push({
          number: i + 1,
          title: chapterTitle,
          url: fullUrl
        });
      }
    });
    
    if (chapters.length === 0) {
      $('ol.chapter li').each((i, el) => {
        const $link = $(el).find('a').first();
        const chapterUrl = $link.attr('href');
        let chapterTitle = $link.text().trim();
        
        if (!chapterTitle) {
          chapterTitle = $(el).text().trim();
        }
        
        if (!chapterTitle) {
          chapterTitle = `Chapter ${i + 1}`;
        }
        
        if (chapterUrl) {
          const fullUrl = chapterUrl.startsWith('http') 
            ? chapterUrl 
            : `https://archiveofourown.org${chapterUrl}`;
          
          chapters.push({
            number: i + 1,
            title: chapterTitle,
            url: fullUrl
          });
        }
      });
    }
    
    if (chapters.length === 0) {
      const singleChapterUrl = $('div#chapters a').first().attr('href');
      if (singleChapterUrl) {
        const fullUrl = singleChapterUrl.startsWith('http') 
          ? singleChapterUrl 
          : `https://archiveofourown.org${singleChapterUrl}`;
        chapters.push({
          number: 1,
          title: 'Chapter 1',
          url: fullUrl
        });
      }
    }

    let isComplete = false;
    const chaptersText = $('dd.chapters').first().text().trim();
    
    if (chaptersText.includes('Complete')) {
      isComplete = true;
    } else if (chapters.length > 0) {
      const match = chaptersText.match(/(\d+)\/(\d+)/);
      if (match) {
        const current = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        isComplete = current === total && current > 0;
      }
    }
    
    if (!isComplete) {
      const workMetaText = $('.work.meta.group').text();
      if (workMetaText.includes('Complete')) {
        isComplete = true;
      }
    }

    return {
      workId,
      title,
      author,
      summary,
      rating,
      tags,
      wordCount,
      chapters,
      isComplete,
      source: 'ao3'
    };
  } catch (error) {
    console.error('Error parsing work metadata:', error);
    throw new Error(`Failed to parse work metadata: ${error.message}`);
  }
}

export function parseChapterContent(html, options = {}) {
  if (!html || html.trim() === '') {
    throw new Error('Empty HTML content provided');
  }

  const { includeAuthorNotes = false, includeEndNotes = false } = options;

  try {
    const $ = cheerio.load(html, {
      decodeEntities: true,
      normalizeWhitespace: false
    });
    
    let chapterTitle = $('h3.title').first().text().trim();
    if (!chapterTitle) {
      chapterTitle = $('h2.title.heading').first().text().trim();
    }
    if (!chapterTitle) {
      chapterTitle = $('h2.title').first().text().trim();
    }
    if (!chapterTitle) {
      chapterTitle = $('h1.title').first().text().trim();
    }
    if (!chapterTitle) {
      chapterTitle = 'Untitled Chapter';
    }

    let contentElement = $('div#chapters div.userstuff').first();
    if (contentElement.length === 0) {
      contentElement = $('div#chapters div.chapter').first();
    }
    if (contentElement.length === 0) {
      contentElement = $('div.chapter.userstuff').first();
    }
    if (contentElement.length === 0) {
      contentElement = $('div.userstuff').first();
    }
    if (contentElement.length === 0) {
      contentElement = $('div.chapter').first();
    }
    
    if (contentElement.length === 0) {
      throw new Error('Chapter content not found in HTML');
    }

    let htmlContent = contentElement.html() || '';
    
    if (!htmlContent || htmlContent.trim() === '') {
      htmlContent = contentElement.text() || '';
      if (!htmlContent || htmlContent.trim() === '') {
        throw new Error('Chapter content is empty');
      }
    }

    const markdownContent = convertHtmlToMarkdown(htmlContent);

    let authorNotes = null;
    if (includeAuthorNotes) {
      const authorNotesElement = $('div.notes.module blockquote.userstuff').first();
      if (authorNotesElement.length > 0) {
        const notesHtml = authorNotesElement.html() || '';
        if (notesHtml.trim()) {
          authorNotes = convertHtmlToMarkdown(notesHtml);
        }
      }
    }

    let endNotes = null;
    if (includeEndNotes) {
      const endNotesElement = $('div.end.notes.module blockquote.userstuff').first();
      if (endNotesElement.length > 0) {
        const notesHtml = endNotesElement.html() || '';
        if (notesHtml.trim()) {
          endNotes = convertHtmlToMarkdown(notesHtml);
        }
      }
    }

    return {
      title: chapterTitle,
      content: markdownContent,
      authorNotes,
      endNotes
    };
  } catch (error) {
    console.error('Error parsing chapter content:', error);
    throw new Error(`Failed to parse chapter content: ${error.message}`);
  }
}

export function parseEntireWork(html, workUrl) {
  if (!html || html.trim() === '') {
    throw new Error('Empty HTML content provided');
  }

  try {
    const $ = cheerio.load(html, {
      decodeEntities: true,
      normalizeWhitespace: false
    });
    
    const workIdMatch = workUrl.match(/\/works\/(\d+)/);
    const workId = workIdMatch ? workIdMatch[1] : null;

    if (!workId) {
      throw new Error('Could not extract work ID from URL');
    }

    // Extract metadata - try both formats
    // Format 1: Downloaded HTML: <div id="preface">
    // Format 2: View full work: <div class="preface group">
    let preface = $('#preface');
    if (preface.length === 0) {
      preface = $('div.preface.group').first();
    }
    
    // Title - try multiple formats
    let title = preface.find('div.meta h1').first().text().trim();
    if (!title) {
      title = preface.find('h2.title.heading').first().text().trim();
    }
    if (!title) {
      title = preface.find('h1').first().text().trim();
    }
    if (!title) {
      title = $('h2.title.heading').first().text().trim();
    }
    if (!title) {
      title = 'Untitled';
    }

    // Author from <div class="byline"> or <h3 class="byline heading"> → <a rel="author">
    const authors = [];
    preface.find('div.byline a[rel="author"], h3.byline.heading a[rel="author"]').each((i, el) => {
      const authorName = $(el).text().trim();
      if (authorName) authors.push(authorName);
    });
    
    if (authors.length === 0) {
      preface.find('.byline a').each((i, el) => {
        const authorName = $(el).text().trim();
        if (authorName && !authors.includes(authorName)) authors.push(authorName);
      });
    }
    
    // Fallback: try finding in the whole document
    if (authors.length === 0) {
      $('h3.byline.heading a[rel="author"]').each((i, el) => {
        const authorName = $(el).text().trim();
        if (authorName && !authors.includes(authorName)) authors.push(authorName);
      });
    }
    
    const author = authors.length > 0 ? authors.join(', ') : 'Unknown';

    // Summary from <blockquote class="userstuff"> in summary module
    let summary = '';
    const summaryBlockquote = preface.find('blockquote.userstuff').first();
    if (summaryBlockquote.length > 0) {
      summary = summaryBlockquote.text().trim();
    } else {
      // Try finding in summary module
      const summaryModule = $('div.summary.module blockquote.userstuff').first();
      if (summaryModule.length > 0) {
        summary = summaryModule.text().trim();
      } else {
        const summaryP = preface.find('p.summary').first();
        if (summaryP.length > 0) {
          summary = summaryP.text().trim();
        }
      }
    }

    // Rating from <dd class="rating tags"> → <a class="tag">
    // Try in preface first, then in the whole document
    let rating = 'Not Rated';
    let ratingTag = preface.find('dd.rating.tags a.tag').first();
    
    if (ratingTag.length === 0) {
      // Try in the whole document (for view_full_work format)
      ratingTag = $('dd.rating.tags a.tag').first();
    }
    
    if (ratingTag.length > 0) {
      rating = ratingTag.text().trim();
    } else {
      // Try finding by dt/dt pattern
      const ratingDt = $('dt').filter((i, el) => {
        return $(el).text().trim() === 'Rating:';
      });
      
      if (ratingDt.length > 0) {
        const ratingDd = ratingDt.next('dd.rating.tags');
        if (ratingDd.length > 0) {
          const tag = ratingDd.find('a.tag').first();
          if (tag.length > 0) {
            rating = tag.text().trim();
          } else {
            const ratingText = ratingDd.text().trim();
            if (ratingText) rating = ratingText;
          }
        }
      } else {
        // Last fallback
        const ratingText = $('dd.rating.tags').first().text().trim();
        if (ratingText) rating = ratingText;
      }
    }

    // Tags from <dd class="freeform tags"> → multiple <a class="tag"> elements
    // Also try to get tags from Characters, Fandom, Relationship sections
    const tags = [];
    
    // First try freeform tags in preface
    preface.find('dd.freeform.tags a.tag').each((i, el) => {
      const tagText = $(el).text().trim();
      if (tagText) tags.push(tagText);
    });
    
    // If not found in preface, try in the whole document
    if (tags.length === 0) {
      $('dd.freeform.tags a.tag').each((i, el) => {
        const tagText = $(el).text().trim();
        if (tagText && !tags.includes(tagText)) tags.push(tagText);
      });
    }
    
    if (tags.length === 0) {
      $('dd.freeform.tags').first().find('a').each((i, el) => {
        const tagText = $(el).text().trim();
        if (tagText && !tags.includes(tagText)) tags.push(tagText);
      });
    }
    
    // If still no tags, try extracting from Characters section
    if (tags.length === 0) {
      const charactersDt = $('dt').filter((i, el) => {
        return $(el).text().trim() === 'Characters:';
      });
      
      if (charactersDt.length > 0) {
        const charactersDd = charactersDt.next('dd');
        charactersDd.find('a').each((i, el) => {
          const tagText = $(el).text().trim();
          if (tagText && !tags.includes(tagText)) tags.push(tagText);
        });
      }
    }

    // Word count from <dd class="words"> or from Stats section
    let wordCount = 0;
    let wordCountText = preface.find('dd.words').first().text().trim();
    
    // If not found in preface, try in the whole document
    if (!wordCountText) {
      wordCountText = $('dd.words').first().text().trim();
    }
    
    // If still not found, try parsing from Stats section
    if (!wordCountText) {
      // Look for Stats section - can be in different places
      const statsDl = $('dl.stats');
      if (statsDl.length > 0) {
        const wordsDt = statsDl.find('dt.words');
        if (wordsDt.length > 0) {
          wordCountText = wordsDt.next('dd.words').text().trim();
        } else {
          // Try parsing from the stats text
          const statsText = statsDl.text();
          const wordsMatch = statsText.match(/Words:\s*([\d,]+)/);
          if (wordsMatch) {
            wordCountText = wordsMatch[1];
          }
        }
      } else {
        // Try finding by dt/dt pattern
        const statsDd = $('dt').filter((i, el) => {
          return $(el).text().trim() === 'Stats:';
        }).next('dd');
        
        if (statsDd.length > 0) {
          const statsText = statsDd.text();
          const wordsMatch = statsText.match(/Words:\s*([\d,]+)/);
          if (wordsMatch) {
            wordCountText = wordsMatch[1];
          }
        }
      }
    }
    
    if (wordCountText) {
      const parsed = parseInt(wordCountText.replace(/,/g, ''), 10);
      if (!isNaN(parsed)) wordCount = parsed;
    }

    // Completion status - check for "Complete" text or compare chapter counts
    let isComplete = false;
    let chaptersText = preface.find('dd.chapters').first().text().trim();
    
    // If not found in preface, try in the whole document
    if (!chaptersText) {
      chaptersText = $('dd.chapters').first().text().trim();
    }
    
    // If still not found, try parsing from Stats section
    if (!chaptersText) {
      const statsDl = $('dl.stats');
      if (statsDl.length > 0) {
        const chaptersDt = statsDl.find('dt.chapters');
        if (chaptersDt.length > 0) {
          chaptersText = chaptersDt.next('dd.chapters').text().trim();
        } else {
          // Try parsing from the stats text
          const statsText = statsDl.text();
          const chaptersMatch = statsText.match(/Chapters:\s*(\d+)\/(\d+|\?)/);
          if (chaptersMatch) {
            chaptersText = `${chaptersMatch[1]}/${chaptersMatch[2]}`;
          }
        }
      } else {
        // Try finding by dt/dt pattern
        const statsDd = $('dt').filter((i, el) => {
          return $(el).text().trim() === 'Stats:';
        }).next('dd');
        
        if (statsDd.length > 0) {
          const statsText = statsDd.text();
          const chaptersMatch = statsText.match(/Chapters:\s*(\d+)\/(\d+|\?)/);
          if (chaptersMatch) {
            chaptersText = `${chaptersMatch[1]}/${chaptersMatch[2]}`;
          }
        }
      }
    }
    
    if (chaptersText.includes('Complete')) {
      isComplete = true;
    } else if (chaptersText) {
      const match = chaptersText.match(/(\d+)\/(\d+)/);
      if (match) {
        const current = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        isComplete = current === total && current > 0;
      } else if (chaptersText.includes('?')) {
        // "38/?" means ongoing, not complete
        isComplete = false;
      }
    }

    const metadata = {
      workId,
      title,
      author,
      summary,
      rating,
      tags,
      wordCount,
      isComplete,
      source: 'ao3'
    };

    // Find <div id="chapters"> - try multiple selectors for different HTML formats
    // Format 1: Downloaded HTML: <div id="chapters" class="userstuff">
    // Format 2: View full work page: <div id="chapters" role="article">
    let chaptersDiv = $('#chapters.userstuff');
    
    // Try alternative selectors if the first one doesn't work
    if (chaptersDiv.length === 0) {
      chaptersDiv = $('#chapters[role="article"]');
    }
    
    if (chaptersDiv.length === 0) {
      chaptersDiv = $('#chapters');
    }
    
    if (chaptersDiv.length === 0) {
      chaptersDiv = $('div#chapters');
    }
    
    if (chaptersDiv.length === 0) {
      // Try finding by content - look for divs containing chapter headings
      const chapterHeadings = $('h2.heading, h3.title').filter((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        return text.startsWith('chapter');
      });
      
      if (chapterHeadings.length > 0) {
        // Find the parent container - try multiple levels up
        let parent = chapterHeadings.first().parent();
        for (let i = 0; i < 5 && parent.length > 0; i++) {
          if (parent.find('h2.heading, h3.title').filter((j, el) => {
            const text = $(el).text().trim().toLowerCase();
            return text.startsWith('chapter');
          }).length > 1) {
            chaptersDiv = parent;
            break;
          }
          parent = parent.parent();
        }
      }
    }
    
    // Last resort: if we found chapter headings, use the body as container
    if (chaptersDiv.length === 0) {
      const chapterHeadings = $('h2.heading, h3.title').filter((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        return text.startsWith('chapter');
      });
      
      if (chapterHeadings.length > 0) {
        // Use body as container and search within it
        chaptersDiv = $('body');
      }
    }
    
    if (chaptersDiv.length === 0) {
      // Provide more diagnostic information
      const hasPreface = $('#preface').length > 0;
      const hasPrefaceGroup = $('div.preface.group').length > 0;
      const hasChaptersId = $('#chapters').length > 0;
      const chapterHeadings = $('h2.heading, h3.title').filter((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        return text.startsWith('chapter');
      }).length;
      const chapterDivs = $('div.chapter').length;
      const chapterDivsWithId = $('div.chapter[id^="chapter-"]').length;
      
      // Log what we found
      console.error('[parseEntireWork] Chapters section not found!');
      console.error(`[parseEntireWork] Diagnostics:`);
      console.error(`  - hasPreface (#preface): ${hasPreface}`);
      console.error(`  - hasPrefaceGroup (div.preface.group): ${hasPrefaceGroup}`);
      console.error(`  - hasChaptersId (#chapters): ${hasChaptersId}`);
      console.error(`  - chapterHeadings (h2.heading/h3.title with "chapter"): ${chapterHeadings}`);
      console.error(`  - chapterDivs (div.chapter): ${chapterDivs}`);
      console.error(`  - chapterDivsWithId (div.chapter[id^="chapter-"]): ${chapterDivsWithId}`);
      
      // Check HTML content for debugging
      const htmlSample = html.substring(0, 500);
      console.error(`[parseEntireWork] HTML sample (first 500 chars): ${htmlSample}`);
      
      throw new Error(
        `Chapters section not found in HTML. ` +
        `Diagnostics: hasPreface=${hasPreface}, hasPrefaceGroup=${hasPrefaceGroup}, hasChaptersId=${hasChaptersId}, ` +
        `chapterHeadings=${chapterHeadings}, chapterDivs=${chapterDivs}, chapterDivsWithId=${chapterDivsWithId}. ` +
        `The page structure may be different from expected.`
      );
    }
    
    console.log(`[parseEntireWork] Found chapters container!`);

    // Extract chapters
    const chapters = [];
    
    // Strategy 1: For view_full_work format - find all div.chapter elements
    const chapterDivs = chaptersDiv.find('div.chapter[id^="chapter-"]');
    
    if (chapterDivs.length > 0) {
      chapterDivs.each((i, chapterEl) => {
        const $chapter = $(chapterEl);
        
        // Extract chapter title from h3.title > a
        let chapterTitle = $chapter.find('h3.title a').first().text().trim();
        
        // Fallback: try h3.title text directly
        if (!chapterTitle) {
          chapterTitle = $chapter.find('h3.title').first().text().trim();
        }
        
        // Fallback: try h2.heading
        if (!chapterTitle) {
          chapterTitle = $chapter.find('h2.heading').first().text().trim();
        }
        
        // Fallback: use chapter number from id
        if (!chapterTitle) {
          const chapterId = $chapter.attr('id') || '';
          const chapterNum = chapterId.match(/chapter-(\d+)/);
          if (chapterNum) {
            chapterTitle = `Chapter ${chapterNum[1]}`;
          } else {
            chapterTitle = `Chapter ${i + 1}`;
          }
        }
        
        // Extract content from div.userstuff.module or div.userstuff
        let $contentDiv = $chapter.find('div.userstuff.module').first();
        if ($contentDiv.length === 0) {
          $contentDiv = $chapter.find('div.userstuff').first();
        }
        
        if ($contentDiv.length > 0) {
          // Remove the "Chapter Text" heading if present
          $contentDiv.find('h3.landmark.heading#work').remove();
          
          const htmlContent = $contentDiv.html() || '';
          if (htmlContent.trim()) {
            const markdownContent = convertHtmlToMarkdown(htmlContent);
            chapters.push({
              title: chapterTitle,
              content: markdownContent
            });
          }
        }
      });
    }
    
    // Strategy 2: For downloaded HTML format - structured approach
    if (chapters.length === 0) {
      const children = chaptersDiv.children().toArray();
      
      if (children.length > 0) {
        let currentChapterTitle = null;
        let currentChapterContent = null;
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const $child = $(child);
          
          // Check if this is a chapter meta group with heading
          if ($child.hasClass('meta') && $child.hasClass('group')) {
            const $heading = $child.find('h2.heading');
            
            if ($heading.length > 0) {
              const headingText = $heading.text().trim();
              
              // If we have a previous chapter, save it
              if (currentChapterTitle && currentChapterContent) {
                const markdownContent = convertHtmlToMarkdown(currentChapterContent);
                chapters.push({
                  title: currentChapterTitle,
                  content: markdownContent
                });
              }
              
              // Start new chapter
              if (headingText.toLowerCase().startsWith('chapter')) {
                currentChapterTitle = headingText;
                currentChapterContent = null;
              } else {
                currentChapterTitle = null;
                currentChapterContent = null;
              }
            }
          }
          // Check if this is a userstuff div (chapter content)
          else if ($child.hasClass('userstuff') && currentChapterTitle) {
            const htmlContent = $child.html() || '';
            if (htmlContent.trim()) {
              currentChapterContent = htmlContent;
            }
          }
        }
        
        // Don't forget the last chapter
        if (currentChapterTitle && currentChapterContent) {
          const markdownContent = convertHtmlToMarkdown(currentChapterContent);
          chapters.push({
            title: currentChapterTitle,
            content: markdownContent
          });
        }
      }
    }
    
    // Strategy 3: Fallback - find all chapter headings and their content
    if (chapters.length === 0) {
      const chapterHeadings = $('h2.heading, h3.title').filter((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        return text.startsWith('chapter');
      });
      
      chapterHeadings.each((i, headingEl) => {
        const $heading = $(headingEl);
        const chapterTitle = $heading.text().trim();
        
        // Find the next userstuff div after this heading
        let $contentDiv = null;
        let $next = $heading.parent().next();
        
        // Look for the next userstuff div
        while ($next.length > 0 && !$contentDiv) {
          if ($next.hasClass('userstuff')) {
            $contentDiv = $next;
            break;
          }
          // Check if we hit another chapter heading
          if ($next.find('h2.heading, h3.title').length > 0) {
            break;
          }
          $next = $next.next();
        }
        
        // Alternative: look within the same parent
        if (!$contentDiv || $contentDiv.length === 0) {
          const $parent = $heading.closest('div');
          $contentDiv = $parent.find('div.userstuff').first();
        }
        
        if ($contentDiv && $contentDiv.length > 0) {
          const htmlContent = $contentDiv.html() || '';
          if (htmlContent.trim()) {
            const markdownContent = convertHtmlToMarkdown(htmlContent);
            chapters.push({
              title: chapterTitle,
              content: markdownContent
            });
          }
        }
      });
    }

    if (chapters.length === 0) {
      throw new Error('No chapters found in HTML');
    }

    return {
      metadata,
      chapters
    };
  } catch (error) {
    console.error('Error parsing entire work:', error);
    throw new Error(`Failed to parse entire work: ${error.message}`);
  }
}

export function isWorkLocked(html) {
  if (!html || html.trim() === '') {
    return false;
  }

  try {
    const $ = cheerio.load(html);
    
    // Check for explicit locked work elements
    const lockedMessage = $('div.locked, p.locked, .locked-message, .locked').filter((i, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('locked') || 
             text.includes('this work is only available to registered users') ||
             text.includes('log in to view');
    }).length > 0;
    
    // Check for work content - if we can find the actual work content, it's not locked
    const hasWorkContent = $('div#chapters, div.userstuff, div.chapter, .work.meta.group').length > 0;
    
    // Check for specific locked work messages in main content area
    const mainContent = $('div#main, div.work, .work.meta.group, .preface.group').first();
    const mainContentText = mainContent.text().toLowerCase();
    const hasLockedMessage = mainContentText.includes('this work is only available to registered users') ||
                            mainContentText.includes('log in to view this work') ||
                            (mainContentText.includes('locked') && mainContentText.includes('work'));
    
    // If we have work content, it's definitely not locked
    if (hasWorkContent && !hasLockedMessage) {
      return false;
    }
    
    // Only return true if we have explicit locked indicators AND no work content
    return lockedMessage || (hasLockedMessage && !hasWorkContent);
  } catch (error) {
    console.error('Error checking if work is locked:', error);
    return false;
  }
}
