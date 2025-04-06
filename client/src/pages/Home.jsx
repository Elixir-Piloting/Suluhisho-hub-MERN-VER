import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
  ThumbsUpIcon, 
  MessageCircleIcon, 
  ChevronDown,
  Search,
  Filter,
  Calendar,
  PlusCircle,
  TrendingUp,
  Clock,
  Bookmark
} from "lucide-react";
import { CreatePost } from "../Components/CreatePost";
import { format, parseISO } from "date-fns";

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);

  const categories = [
    "Public service",
    "Health",
    "Education",
    "Security",
    "general",
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/post");
      if (res.data.success) {
        // Sort by newest first by default
        const sortedPosts = res.data.posts.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  const handleStatusChange = (status) => {
    if (status === "Pending") {
      setStatusFilter(false);
    } else if (status === "Resolved") {
      setStatusFilter(true);
    } else {
      setStatusFilter(null);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (option) => {
    setSortOption(option);
  };

  const applySort = (posts) => {
    switch (sortOption) {
      case "newest":
        return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "mostUpvoted":
        return [...posts].sort((a, b) => b.upvoteCount - a.upvoteCount);
      case "mostCommented":
        return [...posts].sort((a, b) => b.commentCount - a.commentCount);
      default:
        return posts;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post) =>
        selectedCategories.includes(post.category)
      );
    }

    // Filter by status
    if (statusFilter !== null) {
      filtered = filtered.filter((post) => post.resolved === statusFilter);
    }

    // Filter by search term
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          post.userId.username.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sortedFiltered = applySort(filtered);
    setFilteredPosts(sortedFiltered);
  }, [selectedCategories, statusFilter, searchQuery, sortOption, posts]);

  const trendingPosts = posts
    .filter((post) => !post.resolved)
    .map((post) => ({
      ...post,
      score: (post.upvoteCount * 2 + post.commentCount) / 3, // Weighted score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Side Filter */}
      <div className="filter-bar left-0 top-0 w-72 bg-white shadow-lg p-5 space-y-6 h-screen overflow-y-auto sticky">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Filter size={20} className="mr-2 text-blue-500" />
            Filters
          </h2>
          <button 
            onClick={() => {
              setSelectedCategories([]);
              setStatusFilter(null);
              setSearchQuery("");
            }}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Reset All
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearch}
            className="input input-bordered w-full pr-10 bg-gray-50 focus:bg-white"
          />
          <Search size={18} className="absolute right-3 top-3 text-gray-400" />
        </div>

        {/* Sort */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <Clock size={18} className="mr-2 text-blue-500" />
            Sort By
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "mostUpvoted", label: "Most Upvoted" },
              { value: "mostCommented", label: "Most Discussed" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortOption === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <Bookmark size={18} className="mr-2 text-blue-500" />
            Categories
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category, idx) => (
              <div
                key={idx}
                onClick={() => handleCategoryChange(category)}
                className={`cursor-pointer px-3 py-2 rounded-lg text-sm flex items-center ${
                  selectedCategories.includes(category)
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary mr-2"
                  checked={selectedCategories.includes(category)}
                  onChange={() => {}}
                />
                <span className="truncate">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <Calendar size={18} className="mr-2 text-blue-500" />
            Status
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { value: null, label: "All", color: "gray" },
              { value: false, label: "Pending", color: "orange" },
              { value: true, label: "Resolved", color: "green" }
            ].map((status) => (
              <button
                key={status.label}
                onClick={() => handleStatusChange(status.value === null ? null : status.value ? "Resolved" : "Pending")}
                className={`px-4 py-2 rounded-lg text-sm flex items-center justify-between ${
                  statusFilter === status.value
                    ? `bg-${status.color}-100 text-${status.color}-700 border border-${status.color}-300`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{status.label}</span>
                <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => document.getElementById('my_modal_3').showModal()}
          className="btn btn-primary w-full gap-2 mt-4"
        >
          <PlusCircle size={18} />
          Create New Post
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content flex-1 p-6 overflow-y-auto min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {searchQuery ? "Search Results" : "Latest Posts"}
              {selectedCategories.length > 0 && ` • ${selectedCategories.join(", ")}`}
              {statusFilter !== null && ` • ${statusFilter ? "Resolved" : "Pending"}`}
            </h1>
            
            <button 
              onClick={() => document.getElementById('my_modal_3').showModal()}
              className="btn btn-primary btn-sm md:btn-md gap-2"
            >
              <PlusCircle size={16} />
              New Post
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <span className="loading loading-spinner loading-lg text-blue-500"></span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="text-gray-400 mb-2">No posts found</div>
                <p className="text-gray-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Link
                        to={`/profile/${post.userId._id}`}
                        className="flex items-center gap-3 hover:text-blue-500"
                      >
                        <img
                          className="h-10 w-10 rounded-full object-cover border-2 border-gray-100"
                          src={post.userId.profilePic}
                          alt={post.userId.username}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{post.userId.username}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </Link>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {post.category || "General"}
                      </span>
                    </div>

                    <Link to={`/posts/${post._id}`} className="block">
                      <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-2 mb-4">{post.content}</p>
                    </Link>

                    {post.image && (
                      <Link to={`/posts/${post._id}`} className="block mb-4">
                        <img
                          src={post.image}
                          alt=""
                          className="rounded-lg w-full max-h-80 object-cover"
                        />
                      </Link>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                          <ThumbsUpIcon size={14} />
                          {post.upvoteCount}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                          <MessageCircleIcon size={14} />
                          {post.commentCount}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.resolved
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {post.resolved ? "Resolved" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="trending w-80 bg-white shadow-lg p-5 sticky top-0 h-screen overflow-y-auto hidden lg:block">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <TrendingUp size={20} className="text-red-500" />
          <h2 className="text-xl font-bold text-gray-800">Trending Posts</h2>
        </div>

        {trendingPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>No trending posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <Link key={post._id} to={`/posts/${post._id}`}>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUpIcon size={12} className="text-blue-500" />
                      {post.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircleIcon size={12} className="text-blue-500" />
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePost />
    </div>
  );
};