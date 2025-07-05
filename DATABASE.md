# Database Schema

## Tables

### family_members

Stores information about family members and their dining preferences.

```sql
CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### dietary_restrictions

Stores available dietary restrictions.

```sql
CREATE TABLE dietary_restrictions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### member_dietary_restrictions

Junction table linking family members to their dietary restrictions.

```sql
CREATE TABLE member_dietary_restrictions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    dietary_restriction_id INTEGER REFERENCES dietary_restrictions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, dietary_restriction_id)
);
```

### cuisines

Stores different types of cuisine.

```sql
CREATE TABLE cuisines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### restaurants

Stores restaurant information.

```sql
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    cuisine_id INTEGER REFERENCES cuisines(id),
    price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    website VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### restaurant_dietary_accommodations

Links restaurants to dietary restrictions they can accommodate.

```sql
CREATE TABLE restaurant_dietary_accommodations (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    dietary_restriction_id INTEGER REFERENCES dietary_restrictions(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, dietary_restriction_id)
);
```

### member_cuisine_preferences

Stores family member preferences for different cuisines.

```sql
CREATE TABLE member_cuisine_preferences (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    cuisine_id INTEGER REFERENCES cuisines(id) ON DELETE CASCADE,
    preference_level INTEGER CHECK (preference_level >= 1 AND preference_level <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, cuisine_id)
);
```

### dining_sessions

Tracks dining sessions when family members are selected.

```sql
CREATE TABLE dining_sessions (
    id SERIAL PRIMARY KEY,
    session_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### dining_session_members

Links family members to dining sessions.

```sql
CREATE TABLE dining_session_members (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES dining_sessions(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, member_id)
);
```

## Initial Data

### Default Dietary Restrictions

```sql
INSERT INTO dietary_restrictions (name, description) VALUES
('Gluten Free', 'Cannot consume gluten-containing foods'),
('Vegetarian', 'Does not eat meat'),
('Vegan', 'Does not eat any animal products'),
('Dairy Free', 'Cannot consume dairy products'),
('Nut Allergy', 'Allergic to nuts'),
('Shellfish Allergy', 'Allergic to shellfish'),
('Kosher', 'Follows kosher dietary laws'),
('Halal', 'Follows halal dietary laws'),
('Low Sodium', 'Requires low sodium options'),
('Diabetic Friendly', 'Requires low sugar/carb options');
```

### Default Cuisines

```sql
INSERT INTO cuisines (name, description) VALUES
('American', 'Traditional American cuisine'),
('Italian', 'Italian cuisine including pizza and pasta'),
('Mexican', 'Mexican and Tex-Mex cuisine'),
('Chinese', 'Chinese cuisine'),
('Japanese', 'Japanese cuisine including sushi'),
('Indian', 'Indian cuisine'),
('Thai', 'Thai cuisine'),
('Mediterranean', 'Mediterranean cuisine'),
('French', 'French cuisine'),
('Greek', 'Greek cuisine'),
('Vietnamese', 'Vietnamese cuisine'),
('Korean', 'Korean cuisine'),
('BBQ', 'Barbecue and grilled foods'),
('Seafood', 'Seafood-focused restaurants'),
('Steakhouse', 'Steak and grilled meat focused');
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_id);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_member_dietary_restrictions_member ON member_dietary_restrictions(member_id);
CREATE INDEX idx_restaurant_dietary_accommodations_restaurant ON restaurant_dietary_accommodations(restaurant_id);
CREATE INDEX idx_member_cuisine_preferences_member ON member_cuisine_preferences(member_id);
```