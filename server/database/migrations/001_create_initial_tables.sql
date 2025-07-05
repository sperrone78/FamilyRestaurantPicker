-- Create family_members table
CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dietary_restrictions table
CREATE TABLE dietary_restrictions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create member_dietary_restrictions junction table
CREATE TABLE member_dietary_restrictions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    dietary_restriction_id INTEGER REFERENCES dietary_restrictions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, dietary_restriction_id)
);

-- Create cuisines table
CREATE TABLE cuisines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
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

-- Create restaurant_dietary_accommodations table
CREATE TABLE restaurant_dietary_accommodations (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    dietary_restriction_id INTEGER REFERENCES dietary_restrictions(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, dietary_restriction_id)
);

-- Create member_cuisine_preferences table
CREATE TABLE member_cuisine_preferences (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    cuisine_id INTEGER REFERENCES cuisines(id) ON DELETE CASCADE,
    preference_level INTEGER CHECK (preference_level >= 1 AND preference_level <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, cuisine_id)
);

-- Create dining_sessions table
CREATE TABLE dining_sessions (
    id SERIAL PRIMARY KEY,
    session_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dining_session_members table
CREATE TABLE dining_session_members (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES dining_sessions(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_id);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_member_dietary_restrictions_member ON member_dietary_restrictions(member_id);
CREATE INDEX idx_restaurant_dietary_accommodations_restaurant ON restaurant_dietary_accommodations(restaurant_id);
CREATE INDEX idx_member_cuisine_preferences_member ON member_cuisine_preferences(member_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();