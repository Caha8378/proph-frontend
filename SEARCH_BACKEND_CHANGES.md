# Backend Search Endpoint Changes

## Current State
- Endpoint: `GET /api/players/search?q={query}`
- Returns: `{ players, schools, coaches, coachingStaffs }`
- Uses helper functions: `getHomePagePlayers()`, `getUniqueSchools()`, `getHomePageCoaches()`, `getUniqueCoachingStaffs()`

## Required Changes

### 1. Remove Individual Coaches
- ❌ Remove `coaches` from results
- ❌ Remove `getHomePageCoaches()` helper function call
- ❌ Remove coach filtering logic

### 2. Remove High School Helper Function
- ❌ Remove `getUniqueSchools()` helper function call
- ❌ Remove `filteredSchools` logic
- Note: High schools are searched via player's `school` field, not a separate schools table

### 3. Keep Only Players and Coaching Staffs
- ✅ Keep `players` results
- ✅ Keep `coachingStaffs` results (college coaching staffs grouped by school)

### 4. Enhanced Player Search
- ✅ Search players by: name, city, state
- ✅ **NEW**: Search players by high school name (via `player.school` field)
- When searching a high school name, show all players from that high school

## Updated Backend Code

### Modified `searchPlayers` Function

```javascript
// Updated searchPlayers function
exports.searchPlayers = async (req, res) => {
  try {
    const query = req.query.q;
    
    // Helper function to sanitize text inputs
    const sanitizeText = (input) => {
      if (!input || typeof input !== 'string') return null;
      return input.trim().replace(/[<>\";&]/g, '').substring(0, 100);
    };
    
    // Sanitize the search query
    const sanitizedQuery = sanitizeText(query);
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return res.json({ 
        players: [], 
        coachingStaffs: [] 
      });
    }

    // Get players and coaching staffs from cache/database
    const [allPlayers, allCoachingStaffs] = await Promise.all([
      getHomePagePlayers(),
      getUniqueCoachingStaffs()
    ]);
    
    const searchTerm = sanitizedQuery.toLowerCase();
    
    // Filter coaching staffs by school name (college teams)
    const filteredCoachingStaffs = allCoachingStaffs
      .filter(staff => 
        staff.school.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8); // Limit to 8 coaching staffs
    
    // Filter players by:
    // - Name
    // - City
    // - State
    // - High school name (school field)
    const filteredPlayers = allPlayers
      .filter(player => 
        player.name.toLowerCase().includes(searchTerm) ||
        (player.city && player.city.toLowerCase().includes(searchTerm)) ||
        (player.state && player.state.toLowerCase().includes(searchTerm)) ||
        (player.school && player.school.toLowerCase().includes(searchTerm)) // High school search
      )
      .slice(0, 10); // Limit to 10 results

    res.json({ 
      players: filteredPlayers,
      coachingStaffs: filteredCoachingStaffs
    });
    
  } catch (error) {
    console.error('Player search error:', error);
    res.status(500).json({ 
      error: 'Failed to search players',
      players: [],
      coachingStaffs: []
    });
  }
};
```

## Response Format

### Before:
```json
{
  "players": [...],
  "schools": [...],
  "coaches": [...],
  "coachingStaffs": [...]
}
```

### After:
```json
{
  "players": [
    {
      "id": 123,
      "name": "John Doe",
      "school": "Lincoln High School",  // High school name
      "city": "Denver",
      "state": "CO",
      "position": "PG",
      "photo": "...",
      // ... other player fields
    }
  ],
  "coachingStaffs": [
    {
      "id": 1,
      "school": "Duke University",  // College name
      "logo": "...",
      "division": "D1",
      "location": "Durham, NC",
      // ... other coaching staff fields
    }
  ]
}
```

## Key Changes Summary

1. **Removed:**
   - `schools` array (high schools searched via player.school)
   - `coaches` array (individual coaches)
   - `getUniqueSchools()` helper call
   - `getHomePageCoaches()` helper call

2. **Kept:**
   - `players` array (with enhanced high school search)
   - `coachingStaffs` array (college coaching staffs)

3. **Enhanced:**
   - Player search now includes `player.school` field (high school name)
   - When user searches "Lincoln High", shows all players from Lincoln High School

## Frontend Implications

The frontend will need to:
1. Update API response type to only expect `players` and `coachingStaffs`
2. Display results in two categories:
   - **Players** (individual player cards)
   - **Coaching Staffs** (college teams with their coaching staff)
3. Handle clicking:
   - Player → Open player profile modal or navigate to player page
   - Coaching Staff → Navigate to school page (`/school/:schoolId`)

## Search Behavior Examples

### Example 1: Search "Lincoln"
- **Players**: All players named "Lincoln" OR from "Lincoln High School"
- **Coaching Staffs**: Any college with "Lincoln" in the name

### Example 2: Search "Duke"
- **Players**: Players named "Duke" OR from "Duke High School" (if exists)
- **Coaching Staffs**: Duke University coaching staff

### Example 3: Search "Denver"
- **Players**: All players from Denver (city) OR from schools with "Denver" in name
- **Coaching Staffs**: Colleges in Denver

## Testing Checklist

- [ ] Search by player name returns matching players
- [ ] Search by high school name returns all players from that school
- [ ] Search by city returns players from that city
- [ ] Search by state returns players from that state
- [ ] Search by college name returns coaching staff for that college
- [ ] Empty query returns empty arrays
- [ ] Query < 2 characters returns empty arrays
- [ ] Response only contains `players` and `coachingStaffs` (no `schools` or `coaches`)

