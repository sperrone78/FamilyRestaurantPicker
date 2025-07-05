import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Welcome to Family Restaurant Picker
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
        A smart way to choose restaurants that accommodate everyone's dietary 
        restrictions and preferences. Add your family members, discover restaurants, 
        and get personalized recommendations.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Manage Family Members
          </h3>
          <p className="text-gray-600 mb-4">
            Add family members with their dietary restrictions and cuisine preferences.
          </p>
          <Link
            to="/family-members"
            className="inline-block bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
          >
            Get Started
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Restaurants
          </h3>
          <p className="text-gray-600 mb-4">
            Build your restaurant database with dietary accommodations and details.
          </p>
          <Link
            to="/restaurants"
            className="inline-block bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
          >
            Add Restaurants
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Find Perfect Match
          </h3>
          <p className="text-gray-600 mb-4">
            Get smart recommendations based on who's dining and their needs.
          </p>
          <Link
            to="/recommendations"
            className="inline-block bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
          >
            Find Restaurant
          </Link>
        </div>
      </div>

      <div className="mt-16 bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🍽️ Dietary Restrictions</h4>
            <p className="text-gray-600">
              Full support for gluten-free, vegetarian, vegan, and other dietary needs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">⭐ Smart Scoring</h4>
            <p className="text-gray-600">
              Restaurants are scored based on dietary accommodation and preferences.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">👨‍👩‍👧‍👦 Family-Focused</h4>
            <p className="text-gray-600">
              Select which family members are dining to get tailored recommendations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🎯 Personalized</h4>
            <p className="text-gray-600">
              Cuisine preferences are weighted to find the best match for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}