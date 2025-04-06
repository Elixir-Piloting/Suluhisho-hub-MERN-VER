import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { 
  Send, 
  ThumbsUp, 
  MessageCircle, 
  ArrowLeft, 
  X,
  Calendar
} from "lucide-react";
import { format, parseISO } from "date-fns";

export const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/post/${postId}`);
        if (res.data.success) {
          const postData = res.data.post;
          
          // Add upvoteCount and commentCount properties
          const commentCount = res.data.comments ? res.data.comments.length : 0;
          const upvoteCount = postData.upvotes ? postData.upvotes.length : 0;
          
          setPost({
            ...postData,
            comments: res.data.comments || [],
            commentCount,
            upvoteCount
          });
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post details");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      await api.post(`/post/${postId}/comment`, { content: commentText });
      setCommentText("");
      toast.success("Comment added successfully");

      // Fetch updated post data
      const updatedRes = await api.get(`/post/${postId}`);
      if (updatedRes.data.success) {
        const postData = updatedRes.data.post;
        const commentCount = updatedRes.data.comments ? updatedRes.data.comments.length : 0;
        const upvoteCount = postData.upvotes ? postData.upvotes.length : 0;
        
        setPost({
          ...postData,
          comments: updatedRes.data.comments || [],
          commentCount,
          upvoteCount
        });
      }
    } catch (error) {
      console.error("Comment failed:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleUpvote = async () => {
    try {
      await api.post(`/post/${postId}/upvote`);
      toast.success("Vote recorded");

      // Fetch updated post data
      const updatedRes = await api.get(`/post/${postId}`);
      if (updatedRes.data.success) {
        const postData = updatedRes.data.post;
        const commentCount = updatedRes.data.comments ? updatedRes.data.comments.length : 0;
        const upvoteCount = postData.upvotes ? postData.upvotes.length : 0;
        console.log(postData.upvotes)
        
        setPost({
          ...postData,
          comments: updatedRes.data.comments || [],
          commentCount,
          upvoteCount
        });
        
      }
    } catch (error) {
      console.error("Upvote failed:", error);
      toast.error("Failed to record vote");
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Post not found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto pt-4 pb-16 px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Feed</span>
        </Link>

        <div className="flex flex-col md:flex-row gap-4 transition-all duration-300 ease-in-out">
          {/* Post content */}
          <div
            className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 
              ${isCommentsOpen ? "md:w-1/2" : "w-full md:w-3/5 mx-auto"}`}
          >
            {/* Author info */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-100"
                    src={post.userId?.profilePic || "https://via.placeholder.com/40"}
                    alt={post.userId?.username || "User"}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{post.userId?.username || "Anonymous"}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {post.category || "General"}
                </span>
              </div>
            </div>

            {/* Post image */}
            {post.image && (
              <div className="relative pb-[60%] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="absolute w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post content */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>
              <p className="text-gray-700 whitespace-pre-line mb-6">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <div 
                    onClick={handleUpvote} 
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition"
                  >
                    <ThumbsUp size={14} />
                    <span>{post.upvoteCount || 0}</span>
                  </div>
                  <button
                    onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                  >
                    <MessageCircle size={14} />
                    <span>{post.commentCount || 0}</span>
                  </button>
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

          {/* Comments section - hidden on mobile when closed */}
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 flex flex-col
              ${isCommentsOpen
                ? "md:w-1/2 h-auto max-h-none md:max-h-[calc(100vh-120px)]"
                : "hidden md:hidden"
              }`}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-lg text-blue-700">Comments</h3>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition md:block hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="overflow-y-auto flex-grow">
              {!post.comments || post.comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {comment.userId?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-800">
                            {comment.userId?.username || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-800 ml-11">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment input - fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                />
                <button
                  onClick={handleCommentSubmit}
                  className={`p-2 rounded-full flex-shrink-0 ${
                    commentText.trim() 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  } transition`}
                  disabled={!commentText.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile comment button - visible only on small screens */}
        <div className="md:hidden fixed bottom-6 right-6">
          {!isCommentsOpen && (
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              <MessageCircle size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};