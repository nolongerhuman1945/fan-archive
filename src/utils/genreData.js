// Genre data structure based on issues.md
// Hierarchical structure: Top-level category > Sub-category > Individual genres

export const genreHierarchy = [
  {
    id: 'fiction',
    name: 'Fiction (Prose)',
    children: [
      {
        id: 'literary-fiction',
        name: 'Literary Fiction',
        children: [
          { id: 'literary-fiction-general', name: 'Literary fiction' },
          { id: 'contemporary-literary-fiction', name: 'Contemporary literary fiction' },
          { id: 'psychological-fiction', name: 'Psychological fiction' },
          { id: 'philosophical-fiction', name: 'Philosophical fiction' },
          { id: 'experimental-fiction', name: 'Experimental fiction' },
          { id: 'metafiction', name: 'Metafiction' },
          { id: 'stream-of-consciousness', name: 'Stream-of-consciousness' },
          { id: 'absurdist-fiction', name: 'Absurdist fiction' },
          { id: 'surrealist-fiction', name: 'Surrealist fiction' },
          { id: 'symbolist-fiction', name: 'Symbolist fiction' }
        ]
      },
      {
        id: 'speculative-fiction',
        name: 'Speculative Fiction (Umbrella)',
        children: [
          { id: 'speculative-fiction-general', name: 'Speculative fiction (general)' },
          { id: 'alternate-reality', name: 'Alternate reality / alternate history' },
          { id: 'utopian-fiction', name: 'Utopian fiction' },
          { id: 'dystopian-fiction', name: 'Dystopian fiction' },
          { id: 'apocalyptic-fiction', name: 'Apocalyptic fiction' },
          { id: 'post-apocalyptic-fiction', name: 'Post-apocalyptic fiction' }
        ]
      },
      {
        id: 'science-fiction',
        name: 'Science Fiction',
        children: [
          { id: 'hard-science-fiction', name: 'Hard science fiction' },
          { id: 'soft-science-fiction', name: 'Soft science fiction' },
          { id: 'space-opera', name: 'Space opera' },
          { id: 'military-science-fiction', name: 'Military science fiction' },
          { id: 'cyberpunk', name: 'Cyberpunk' },
          { id: 'biopunk', name: 'Biopunk' },
          { id: 'solarpunk', name: 'Solarpunk' },
          { id: 'steampunk', name: 'Steampunk' },
          { id: 'dieselpunk', name: 'Dieselpunk' },
          { id: 'atompunk', name: 'Atompunk' },
          { id: 'time-travel-fiction', name: 'Time travel fiction' },
          { id: 'first-contact-fiction', name: 'First-contact fiction' },
          { id: 'artificial-intelligence-fiction', name: 'Artificial intelligence fiction' },
          { id: 'climate-fiction', name: 'Climate fiction (Cli-Fi)' }
        ]
      },
      {
        id: 'fantasy',
        name: 'Fantasy',
        children: [
          { id: 'high-fantasy', name: 'High fantasy (epic fantasy)' },
          { id: 'low-fantasy', name: 'Low fantasy' },
          { id: 'dark-fantasy', name: 'Dark fantasy' },
          { id: 'sword-and-sorcery', name: 'Sword and sorcery' },
          { id: 'mythic-fantasy', name: 'Mythic fantasy' },
          { id: 'urban-fantasy', name: 'Urban fantasy' },
          { id: 'portal-fantasy', name: 'Portal fantasy' },
          { id: 'grimdark-fantasy', name: 'Grimdark fantasy' },
          { id: 'cozy-fantasy', name: 'Cozy fantasy' },
          { id: 'fairy-tale-retellings', name: 'Fairy tale retellings' },
          { id: 'arthurian-fantasy', name: 'Arthurian / legendary fantasy' }
        ]
      },
      {
        id: 'horror',
        name: 'Horror',
        children: [
          { id: 'gothic-horror', name: 'Gothic horror' },
          { id: 'psychological-horror', name: 'Psychological horror' },
          { id: 'supernatural-horror', name: 'Supernatural horror' },
          { id: 'cosmic-horror', name: 'Cosmic horror (Lovecraftian)' },
          { id: 'body-horror', name: 'Body horror' },
          { id: 'folk-horror', name: 'Folk horror' },
          { id: 'occult-horror', name: 'Occult horror' },
          { id: 'survival-horror', name: 'Survival horror' },
          { id: 'slasher-fiction', name: 'Slasher fiction' }
        ]
      },
      {
        id: 'romance',
        name: 'Romance',
        children: [
          { id: 'contemporary-romance', name: 'Contemporary romance' },
          { id: 'historical-romance', name: 'Historical romance' },
          { id: 'romantic-comedy', name: 'Romantic comedy' },
          { id: 'dark-romance', name: 'Dark romance' },
          { id: 'paranormal-romance', name: 'Paranormal romance' },
          { id: 'fantasy-romance', name: 'Fantasy romance' },
          { id: 'science-fiction-romance', name: 'Science-fiction romance' },
          { id: 'erotic-romance', name: 'Erotic romance' },
          { id: 'lgbtq-romance', name: 'LGBTQ+ romance' }
        ]
      },
      {
        id: 'mystery-crime',
        name: 'Mystery & Crime',
        children: [
          { id: 'mystery', name: 'Mystery' },
          { id: 'detective-fiction', name: 'Detective fiction' },
          { id: 'cozy-mystery', name: 'Cozy mystery' },
          { id: 'noir', name: 'Noir' },
          { id: 'hardboiled-fiction', name: 'Hardboiled fiction' },
          { id: 'crime-fiction', name: 'Crime fiction' },
          { id: 'police-procedural', name: 'Police procedural' },
          { id: 'legal-thriller', name: 'Legal thriller' },
          { id: 'whodunit', name: 'Whodunit' }
        ]
      },
      {
        id: 'thriller-suspense',
        name: 'Thriller & Suspense',
        children: [
          { id: 'psychological-thriller', name: 'Psychological thriller' },
          { id: 'political-thriller', name: 'Political thriller' },
          { id: 'spy-fiction', name: 'Spy fiction' },
          { id: 'techno-thriller', name: 'Techno-thriller' },
          { id: 'action-thriller', name: 'Action thriller' },
          { id: 'domestic-thriller', name: 'Domestic thriller' },
          { id: 'medical-thriller', name: 'Medical thriller' }
        ]
      },
      {
        id: 'historical-fiction',
        name: 'Historical Fiction',
        children: [
          { id: 'historical-fiction-general', name: 'Historical fiction' },
          { id: 'alternate-historical-fiction', name: 'Alternate historical fiction' },
          { id: 'biographical-historical-fiction', name: 'Biographical historical fiction' },
          { id: 'period-fiction', name: 'Period fiction' },
          { id: 'war-fiction', name: 'War fiction' }
        ]
      },
      {
        id: 'adventure-action',
        name: 'Adventure & Action',
        children: [
          { id: 'adventure-fiction', name: 'Adventure fiction' },
          { id: 'survival-fiction', name: 'Survival fiction' },
          { id: 'pirate-fiction', name: 'Pirate fiction' },
          { id: 'exploration-fiction', name: 'Exploration fiction' },
          { id: 'military-adventure', name: 'Military adventure' }
        ]
      },
      {
        id: 'ya-children',
        name: 'Young Adult / Children\'s Fiction',
        children: [
          { id: 'childrens-literature', name: 'Children\'s literature' },
          { id: 'middle-grade-fiction', name: 'Middle-grade fiction' },
          { id: 'young-adult', name: 'Young adult (YA)' },
          { id: 'coming-of-age-fiction', name: 'Coming-of-age fiction' },
          { id: 'school-stories', name: 'School stories' },
          { id: 'fables', name: 'Fables' }
        ]
      }
    ]
  },
  {
    id: 'non-fiction',
    name: 'Non-Fiction',
    children: [
      {
        id: 'narrative-literary-nonfiction',
        name: 'Narrative & Literary Non-Fiction',
        children: [
          { id: 'memoir', name: 'Memoir' },
          { id: 'autobiography', name: 'Autobiography' },
          { id: 'biography', name: 'Biography' },
          { id: 'personal-essays', name: 'Personal essays' },
          { id: 'creative-nonfiction', name: 'Creative nonfiction' },
          { id: 'travel-writing', name: 'Travel writing' }
        ]
      },
      {
        id: 'academic-informational',
        name: 'Academic & Informational',
        children: [
          { id: 'history', name: 'History' },
          { id: 'philosophy', name: 'Philosophy' },
          { id: 'sociology', name: 'Sociology' },
          { id: 'anthropology', name: 'Anthropology' },
          { id: 'political-science', name: 'Political science' },
          { id: 'economics', name: 'Economics' },
          { id: 'psychology', name: 'Psychology' },
          { id: 'science-writing', name: 'Science writing' },
          { id: 'mathematics-writing', name: 'Mathematics writing' }
        ]
      },
      {
        id: 'practical-instructional',
        name: 'Practical & Instructional',
        children: [
          { id: 'self-help', name: 'Self-help' },
          { id: 'personal-development', name: 'Personal development' },
          { id: 'productivity', name: 'Productivity' },
          { id: 'health-wellness', name: 'Health & wellness' },
          { id: 'fitness', name: 'Fitness' },
          { id: 'diet-nutrition', name: 'Diet & nutrition' },
          { id: 'how-to-instructional', name: 'How-to / instructional manuals' },
          { id: 'parenting', name: 'Parenting' },
          { id: 'education', name: 'Education' }
        ]
      },
      {
        id: 'business-technology',
        name: 'Business & Technology',
        children: [
          { id: 'business', name: 'Business' },
          { id: 'entrepreneurship', name: 'Entrepreneurship' },
          { id: 'marketing', name: 'Marketing' },
          { id: 'management', name: 'Management' },
          { id: 'finance', name: 'Finance' },
          { id: 'investing', name: 'Investing' },
          { id: 'economics-popular', name: 'Economics (popular)' },
          { id: 'technology', name: 'Technology' },
          { id: 'programming', name: 'Programming' },
          { id: 'information-systems', name: 'Information systems' },
          { id: 'ai-data-science', name: 'AI & data science' }
        ]
      },
      {
        id: 'journalism-commentary',
        name: 'Journalism & Commentary',
        children: [
          { id: 'essays', name: 'Essays' },
          { id: 'opinion-writing', name: 'Opinion writing' },
          { id: 'investigative-journalism', name: 'Investigative journalism' },
          { id: 'long-form-journalism', name: 'Long-form journalism' },
          { id: 'reportage', name: 'Reportage' }
        ]
      }
    ]
  },
  {
    id: 'poetry',
    name: 'Poetry',
    children: [
      { id: 'poetry-general', name: 'Poetry (general)' },
      { id: 'lyric-poetry', name: 'Lyric poetry' },
      { id: 'narrative-poetry', name: 'Narrative poetry' },
      { id: 'epic-poetry', name: 'Epic poetry' },
      { id: 'free-verse', name: 'Free verse' },
      { id: 'sonnets', name: 'Sonnets' },
      { id: 'haiku', name: 'Haiku' },
      { id: 'ghazal', name: 'Ghazal' },
      { id: 'ballads', name: 'Ballads' },
      { id: 'spoken-word-poetry', name: 'Spoken word poetry' },
      { id: 'concrete-visual-poetry', name: 'Concrete / visual poetry' },
      { id: 'experimental-poetry', name: 'Experimental poetry' }
    ]
  },
  {
    id: 'drama-performance',
    name: 'Drama & Performance Writing',
    children: [
      { id: 'drama', name: 'Drama' },
      { id: 'stage-plays', name: 'Stage plays' },
      { id: 'tragedy', name: 'Tragedy' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'tragicomedy', name: 'Tragicomedy' },
      { id: 'screenplays', name: 'Screenplays' },
      { id: 'teleplays', name: 'Teleplays' },
      { id: 'radio-drama', name: 'Radio drama' },
      { id: 'musical-theatre-librettos', name: 'Musical theatre librettos' },
      { id: 'monologues', name: 'Monologues' }
    ]
  },
  {
    id: 'genre-crossing',
    name: 'Genre-Crossing / Hybrid Forms',
    children: [
      { id: 'literary-fantasy', name: 'Literary fantasy' },
      { id: 'science-fantasy', name: 'Science fantasy' },
      { id: 'romantic-fantasy', name: 'Romantic fantasy' },
      { id: 'horror-romance', name: 'Horror romance' },
      { id: 'fantasy-mystery', name: 'Fantasy mystery' },
      { id: 'historical-fantasy', name: 'Historical fantasy' },
      { id: 'speculative-romance', name: 'Speculative romance' },
      { id: 'experimental-genre-fiction', name: 'Experimental genre fiction' }
    ]
  },
  {
    id: 'niche-internet',
    name: 'Niche / Internet / Modern Categories',
    children: [
      { id: 'fanfiction', name: 'Fanfiction' },
      { id: 'web-novels', name: 'Web novels' },
      { id: 'light-novels', name: 'Light novels' },
      { id: 'visual-novel-scripts', name: 'Visual novel scripts' },
      { id: 'interactive-fiction', name: 'Interactive fiction' },
      { id: 'game-narrative-writing', name: 'Game narrative writing' },
      { id: 'litrpg', name: 'LitRPG' },
      { id: 'progression-fantasy', name: 'Progression fantasy' },
      { id: 'cultivation-fiction', name: 'Cultivation fiction' },
      { id: 'slice-of-life', name: 'Slice of life' },
      { id: 'fix-it-fiction', name: 'Fix-it fiction' },
      { id: 'alternate-universe', name: 'Alternate universe (AU)' }
    ]
  },
  {
    id: 'format-based',
    name: 'Format-Based Categories (Not Genres, but Commonly Used)',
    children: [
      { id: 'short-stories', name: 'Short stories' },
      { id: 'novellas', name: 'Novellas' },
      { id: 'novels', name: 'Novels' },
      { id: 'flash-fiction', name: 'Flash fiction' },
      { id: 'anthologies', name: 'Anthologies' },
      { id: 'serial-fiction', name: 'Serial fiction' },
      { id: 'epistolary-fiction', name: 'Epistolary fiction' }
    ]
  }
]

// Helper function to flatten hierarchy and get all genre IDs with their names
export function getAllGenres() {
  const genres = []
  
  function traverse(categories) {
    categories.forEach(category => {
      if (category.children) {
        category.children.forEach(subcategory => {
          if (subcategory.children) {
            subcategory.children.forEach(genre => {
              genres.push({ id: genre.id, name: genre.name })
            })
          } else {
            genres.push({ id: subcategory.id, name: subcategory.name })
          }
        })
      } else {
        genres.push({ id: category.id, name: category.name })
      }
    })
  }
  
  traverse(genreHierarchy)
  return genres
}

// Helper function to get genre name by ID
export function getGenreName(genreId) {
  const allGenres = getAllGenres()
  const genre = allGenres.find(g => g.id === genreId)
  return genre ? genre.name : genreId
}

// Helper function to get genre IDs from names (for backward compatibility with tags)
export function getGenreIdsFromNames(tagNames) {
  if (!tagNames || !Array.isArray(tagNames)) return []
  const allGenres = getAllGenres()
  const nameMap = new Map(allGenres.map(g => [g.name.toLowerCase(), g.id]))
  return tagNames
    .map(tag => nameMap.get(tag.toLowerCase()))
    .filter(Boolean)
}
