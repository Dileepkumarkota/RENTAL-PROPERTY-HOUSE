import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Plus, Home, Star, Eye, MessageCircle, Trash2, Edit } from 'lucide-react';
import { DEMO_MODE } from '@/config/demo';
import { mockListings } from '@/data/mockListings';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Demo Mode: Use mock data
      if (DEMO_MODE) {
        const demoListings = mockListings.slice(0, 3).map(l => ({
          _id: l.id,
          title: l.title,
          type: l.type,
          price: l.price,
          addressText: l.location,
          images: l.images
        }));
        setListings(demoListings);
        setStats({ totalListings: demoListings.length, totalReviews: 5, averageRating: 4.5 });
        setProfile({ contactNumber: '+91 9876543210', description: 'Demo Property Owner' });
        setLoading(false);
        return;
      }
      
      // Real Mode: Fetch from backend
      // Fetch owner's listings
      const listingsRes = await axios.get(`${API_URL}/api/listings?ownerId=${user.id}`);
      if (listingsRes.data.success) {
        setListings(listingsRes.data.listings);
        setStats(prev => ({ ...prev, totalListings: listingsRes.data.listings.length }));
      }

      // Fetch owner profile
      try {
        const profileRes = await axios.get(`${API_URL}/api/owner/profile`);
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
      } catch (error) {
        // Profile doesn't exist yet
        console.log('No profile found');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to demo data
      const demoListings = mockListings.slice(0, 3).map(l => ({
        _id: l.id,
        title: l.title,
        type: l.type,
        price: l.price,
        addressText: l.location,
        images: l.images
      }));
      setListings(demoListings);
      setProfile({ contactNumber: '+91 9876543210', description: 'Property Owner' });
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`${API_URL}/api/listings/${id}`);
      setListings(listings.filter(l => l._id !== id));
    } catch (error) {
      alert('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Profile Alert */}
        {!profile && (
          <div className="mb-6 bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20 rounded-xl p-4">
            <p className="text-foreground">
              ⚠️ Please complete your owner profile to start adding listings.
              <Link to="/owner/profile" className="ml-2 font-medium text-secondary underline">
                Complete Profile
              </Link>
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl">
                <Home className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-xl">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                <Eye className="h-6 w-6 text-primary dark:text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/owner/add-listing"
            className={`flex items-center justify-center px-6 py-4 bg-gradient-to-r from-secondary to-accent text-white rounded-xl hover:from-[#d16a50] hover:to-[#c49565] transition shadow-lg ${
              !profile ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            <Plus className="mr-2" />
            Add New Listing
          </Link>
          <Link
            to="/owner/profile"
            className="flex items-center justify-center px-6 py-4 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition shadow-lg"
          >
            <Edit className="mr-2" />
            {profile ? 'Edit Profile' : 'Complete Profile'}
          </Link>
          <Link
            to="/owner/inbox"
            className="flex items-center justify-center px-6 py-4 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition shadow-lg"
          >
            <MessageCircle className="mr-2" />
            Messages
          </Link>
        </div>

        {/* Listings Table */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Your Listings</h2>
          </div>
          
          {listings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't added any listings yet.</p>
              {profile && (
                <Link
                  to="/owner/add-listing"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Listing
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={listing.images?.[0] || 'https://via.placeholder.com/100'}
                              alt={listing.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{listing.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary/10 text-secondary capitalize">
                          {listing.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        ₹{listing.price?.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {listing.addressText?.substring(0, 30)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/listing/${listing._id}`}
                          className="text-secondary hover:text-secondary/80 mr-4"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => deleteListing(listing._id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
