const { Pool } = require('pg');

require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const pool = new Pool({
  connectionString: process.env.NODE_ENV === 'test' 
    ? process.env.DATABASE_URL_TEST 
    : process.env.DATABASE_URL,
  ssl: false,
});

const dietaryRestrictions = [
  { name: 'Gluten Free', description: 'Cannot consume gluten-containing foods' },
  { name: 'Vegetarian', description: 'Does not eat meat' },
  { name: 'Vegan', description: 'Does not eat any animal products' },
  { name: 'Dairy Free', description: 'Cannot consume dairy products' },
  { name: 'Nut Allergy', description: 'Allergic to nuts' },
  { name: 'Shellfish Allergy', description: 'Allergic to shellfish' },
  { name: 'Kosher', description: 'Follows kosher dietary laws' },
  { name: 'Halal', description: 'Follows halal dietary laws' },
  { name: 'Low Sodium', description: 'Requires low sodium options' },
  { name: 'Diabetic Friendly', description: 'Requires low sugar/carb options' },
];

const cuisines = [
  { name: 'American', description: 'Traditional American cuisine' },
  { name: 'Italian', description: 'Italian cuisine including pizza and pasta' },
  { name: 'Mexican', description: 'Mexican and Tex-Mex cuisine' },
  { name: 'Chinese', description: 'Chinese cuisine' },
  { name: 'Japanese', description: 'Japanese cuisine including sushi' },
  { name: 'Indian', description: 'Indian cuisine' },
  { name: 'Thai', description: 'Thai cuisine' },
  { name: 'Mediterranean', description: 'Mediterranean cuisine' },
  { name: 'French', description: 'French cuisine' },
  { name: 'Greek', description: 'Greek cuisine' },
  { name: 'Vietnamese', description: 'Vietnamese cuisine' },
  { name: 'Korean', description: 'Korean cuisine' },
  { name: 'BBQ', description: 'Barbecue and grilled foods' },
  { name: 'Seafood', description: 'Seafood-focused restaurants' },
  { name: 'Steakhouse', description: 'Steak and grilled meat focused' },
];

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Check if data already exists
    const restrictionsCount = await pool.query('SELECT COUNT(*) FROM dietary_restrictions');
    const cuisinesCount = await pool.query('SELECT COUNT(*) FROM cuisines');
    
    // Seed dietary restrictions
    if (parseInt(restrictionsCount.rows[0].count) === 0) {
      console.log('Seeding dietary restrictions...');
      for (const restriction of dietaryRestrictions) {
        await pool.query(
          'INSERT INTO dietary_restrictions (name, description) VALUES ($1, $2)',
          [restriction.name, restriction.description]
        );
      }
      console.log(`Seeded ${dietaryRestrictions.length} dietary restrictions`);
    } else {
      console.log('Dietary restrictions already seeded');
    }
    
    // Seed cuisines
    if (parseInt(cuisinesCount.rows[0].count) === 0) {
      console.log('Seeding cuisines...');
      for (const cuisine of cuisines) {
        await pool.query(
          'INSERT INTO cuisines (name, description) VALUES ($1, $2)',
          [cuisine.name, cuisine.description]
        );
      }
      console.log(`Seeded ${cuisines.length} cuisines`);
    } else {
      console.log('Cuisines already seeded');
    }
    
    // Add sample data for development environment
    if (process.env.NODE_ENV === 'development') {
      await seedSampleData();
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function seedSampleData() {
  console.log('Seeding sample data for development...');
  
  // Check if sample data already exists
  const membersCount = await pool.query('SELECT COUNT(*) FROM family_members');
  const restaurantsCount = await pool.query('SELECT COUNT(*) FROM restaurants');
  
  if (parseInt(membersCount.rows[0].count) === 0) {
    // Add sample family members
    const johnResult = await pool.query(
      'INSERT INTO family_members (name, email) VALUES ($1, $2) RETURNING id',
      ['John Doe', 'john@example.com']
    );
    const johnId = johnResult.rows[0].id;
    
    const janeResult = await pool.query(
      'INSERT INTO family_members (name, email) VALUES ($1, $2) RETURNING id',
      ['Jane Doe', 'jane@example.com']
    );
    const janeId = janeResult.rows[0].id;
    
    // Add dietary restrictions for John (Gluten Free)
    await pool.query(
      'INSERT INTO member_dietary_restrictions (member_id, dietary_restriction_id) VALUES ($1, $2)',
      [johnId, 1]
    );
    
    // Add dietary restrictions for Jane (Vegetarian)
    await pool.query(
      'INSERT INTO member_dietary_restrictions (member_id, dietary_restriction_id) VALUES ($1, $2)',
      [janeId, 2]
    );
    
    // Add cuisine preferences for John (loves Italian)
    await pool.query(
      'INSERT INTO member_cuisine_preferences (member_id, cuisine_id, preference_level) VALUES ($1, $2, $3)',
      [johnId, 2, 5]
    );
    
    // Add cuisine preferences for Jane (likes Mexican)
    await pool.query(
      'INSERT INTO member_cuisine_preferences (member_id, cuisine_id, preference_level) VALUES ($1, $2, $3)',
      [janeId, 3, 4]
    );
    
    console.log('Added sample family members');
  }
  
  if (parseInt(restaurantsCount.rows[0].count) === 0) {
    // Add sample restaurants
    const pizzaResult = await pool.query(
      'INSERT INTO restaurants (name, address, phone, cuisine_id, price_range, rating, website, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      ['Pizza Palace', '123 Main St', '555-0123', 2, 2, 4.5, 'https://pizzapalace.com', 'Great gluten-free options']
    );
    const pizzaId = pizzaResult.rows[0].id;
    
    const veggieResult = await pool.query(
      'INSERT INTO restaurants (name, address, phone, cuisine_id, price_range, rating, website, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      ['Veggie Delight', '456 Oak Ave', '555-0456', 3, 2, 4.0, 'https://veggiedelight.com', 'All vegetarian menu']
    );
    const veggieId = veggieResult.rows[0].id;
    
    // Add dietary accommodations for Pizza Palace (Gluten Free)
    await pool.query(
      'INSERT INTO restaurant_dietary_accommodations (restaurant_id, dietary_restriction_id, notes) VALUES ($1, $2, $3)',
      [pizzaId, 1, 'Gluten-free pizza available']
    );
    
    // Add dietary accommodations for Veggie Delight (Vegetarian)
    await pool.query(
      'INSERT INTO restaurant_dietary_accommodations (restaurant_id, dietary_restriction_id, notes) VALUES ($1, $2, $3)',
      [veggieId, 2, 'Completely vegetarian']
    );
    
    console.log('Added sample restaurants');
  }
}

seedDatabase();