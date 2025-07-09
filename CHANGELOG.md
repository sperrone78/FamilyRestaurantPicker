# Changelog

All notable changes to the Family Restaurant Picker project will be documented in this file.

## [2025-01-08] - Session Updates

### Added
- **New Specialty Cuisine Categories**: Added three new cuisine categories to better categorize specialty food establishments:
  - `Dessert & Ice Cream` - For ice cream shops, dessert parlors, and specialty sweet treats
  - `Bakery & Pastries` - For bakeries, pastry shops, and fresh baked goods  
  - `Cafe & Coffee` - For coffee shops, cafes, and light breakfast/lunch spots
- **Cuisine Management Script**: `scripts/add-specialty-cuisines.js` to add new cuisine categories and update restaurants automatically

### Fixed
- **Recommendation Scoring Bug**: Fixed critical bug in dietary restriction matching that prevented proper scoring
  - Issue: `uniqueRestrictions` array was becoming `[undefined]` instead of actual restriction IDs
  - Cause: Code was trying to access `.id` property on string values instead of objects
  - Solution: Added type checking to handle both string IDs and object formats: `typeof r === 'string' ? r : r.id`
  - Impact: Restaurants now correctly receive dietary accommodation points (up to 30 points)

### Enhanced
- **Complete Cuisine Preference Display**: Removed filtering that only showed high-rated preferences (≥4/5)
  - Now displays ALL cuisine preferences for family members (1-5 scale)
  - Added color-coded visual distinction:
    - 🟢 Green (4-5/5): High preference - loved cuisines
    - 🔵 Blue (3/5): Medium preference - liked cuisines  
    - ⚪ Gray (1-2/5): Low preference - neutral/disliked cuisines
  - Provides complete transparency of family member preferences for better decision making

### Updated
- **Restaurant Categorization**: 
  - Recategorized `Theo's Microcreamery` from "American" to "Dessert & Ice Cream"
  - Recategorized `Ivy Lane Bakery` from "American" to "Bakery & Pastries"
- **Documentation**: Updated README.md and DATABASE-FIRESTORE.md to reflect new cuisine categories and bug fixes

### Technical Details
- **Database**: New cuisine categories are global (shared across all families)
- **Restaurant Updates**: Family-specific (only affects restaurants in specific family collections)
- **Firestore Collections**: No schema changes, only new documents in existing `cuisines` collection
- **Recommendation Algorithm**: Scoring calculation remains the same, but now works correctly for dietary restrictions

### Migration Required
Run the following script to add new cuisine categories to your Firestore database:
```bash
node scripts/add-specialty-cuisines.js YOUR_FAMILY_ID
```

---

## Development Notes

### Debugging Process
1. **Issue Discovery**: User reported Brass Pig BBQ restaurant scoring 77% instead of expected ~97%
2. **Root Cause Analysis**: Used debug logging to trace recommendation scoring algorithm
3. **Bug Identification**: Found dietary restriction ID mapping bug in `src/services/recommendationService.ts`
4. **Solution Implementation**: Added robust type checking for string vs object handling
5. **Verification**: Confirmed fix increased Brass Pig score from 67% to 97% (expected)

### UI/UX Improvements
1. **Problem**: Many cuisine preferences were hidden from users (only showing 4-5/5 ratings)
2. **Impact**: Users couldn't see complete preference picture for family members
3. **Solution**: Display all preferences with visual distinction by rating level
4. **Benefit**: Better transparency and decision-making capability for families