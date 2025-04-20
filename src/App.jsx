import React, { useState, useEffect } from "react";
import NotifikasiIcon from "./assets/notifikasi.png";
import UnlikeIcon from "./assets/unlike.png";
import LikeIcon from "./assets/like.png";
import CommentIcon from "./assets/comment.png";
import ShareIcon from "./assets/share.png";
import BookmarkIcon from "./assets/bookmark.png";
import HomeIcon from "./assets/home.png";
import SearchIcon from "./assets/search.png";
import MessageIcon from "./assets/message.png";
import CommunityIcon from "./assets/community.png";
import PPIcon from "./assets/profilepicture.png";
import { create } from "zustand";
import "./App.css";

const CharacterCounter = ({ current, max, show }) => {
  if (!show) return null;
  
  return (
    <div className={`character-counter ${current > max ? 'over-limit' : ''}`}>
      {current}/{max}
    </div>
  );
};

const defaultPosts = [
  {
    id: "1",
    user: "Mr",
    time: "08:39 am",
    content: "TNI ga sekolah ya mereka?",
    likes: 1964,
    comments: []
  },
  {
    id: "2",
    user: "Jastok",
    time: "08:59 am",
    content: "Kita butuh pelatih orang belanda juga",
    likes: 4000,
    comments: []
  },
  {
    id: "3",
    user: "SJW",
    time: "10:00 am",
    content: "Lu cakep lu aman😆",
    likes: 1234,
    comments: []
  },
  {
    id: "4",
    user: "China Media",
    time: "13:00 am",
    content: "Indonesian reporter receives pig's head in incident condemned as 'terror attack'",
    likes: 10000,
    comments: []
  }
];

const API_BASE_URL = "https://tugas2-fe.labse.id/api";

const useStore = create((set) => ({
  posts: JSON.parse(localStorage.getItem("posts")) || [],
  likedPosts: JSON.parse(localStorage.getItem("likedPosts")) || {},
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  currentUserLikes: {},
  likedComments: JSON.parse(localStorage.getItem("likedComments")) || {},
  
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    const allLikedPosts = JSON.parse(localStorage.getItem("likedPosts")) || {};
    const userLikes = allLikedPosts[user?.username] || {};
    const allLikedComments = JSON.parse(localStorage.getItem("likedComments")) || {};
    const userCommentLikes = allLikedComments[user?.username] || {};
    
    set({ 
      token, 
      user,
      currentUserLikes: userLikes,
      likedComments: userCommentLikes
    });
  },
  
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ 
      token: null, 
      user: null,
      currentUserLikes: {},
      likedComments: {}
    });
  },
  
  addPost: (newPostData) => set((state) => {
    const newPosts = [newPostData, ...state.posts];
    localStorage.setItem("posts", JSON.stringify(newPosts));  
    return { posts: newPosts };
  }),
  
  deletePost: (postId) => set((state) => {
    const newPosts = state.posts.filter((post) => post.id !== postId);
    localStorage.setItem("posts", JSON.stringify(newPosts));
    return { posts: newPosts };
  }),
  
  editPost: (postId, editedContent) => set((state) => {
    const newPosts = state.posts.map((post) =>
      post.id === postId ? { ...post, content: editedContent } : post
    );
    localStorage.setItem("posts", JSON.stringify(newPosts));
    return { posts: newPosts };
  }),
  
  toggleLike: (postId, isLiked) => set((state) => {
    const username = state.user?.username;
    if (!username) return state;
    
    const newUserLikes = {
      ...state.currentUserLikes,
      [postId]: !isLiked
    };
    
    const newAllLikes = {
      ...state.likedPosts,
      [username]: newUserLikes
    };
    
    localStorage.setItem("likedPosts", JSON.stringify(newAllLikes));
    
    const newPosts = state.posts.map((post) =>
      post.id === postId
        ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
        : post
    );
    localStorage.setItem("posts", JSON.stringify(newPosts));
    
    return {
      likedPosts: newAllLikes,
      currentUserLikes: newUserLikes,
      posts: newPosts
    };
  }),
  
  setUserLikes: (username, likes) => {
    const newAllLikes = {
      ...JSON.parse(localStorage.getItem("likedPosts")) || {},
      [username]: likes
    };
    
    localStorage.setItem("likedPosts", JSON.stringify(newAllLikes));
    
    set({
      likedPosts: newAllLikes,
      currentUserLikes: username === useStore.getState().user?.username ? likes : useStore.getState().currentUserLikes
    });
  },
  
  addComment: (postId, commentData, parentCommentId = null) => set((state) => {
    const newPosts = state.posts.map(post => {
      if (post.id !== postId) return post;
      
      const newComment = {
        ...commentData,
        id: `comment-${Date.now()}`,
        likes: 0,
        isLiked: false,
        replies: []
      };
      
      if (!parentCommentId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      } else {
        const addReplyToComment = (comments) => {
          return comments.map(comment => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: addReplyToComment(comment.replies)
              };
            }
            
            return comment;
          });
        };
        
        return {
          ...post,
          comments: addReplyToComment(post.comments || [])
        };
      }
    });
    
    localStorage.setItem("posts", JSON.stringify(newPosts));
    return { posts: newPosts };
  }),
  
  editComment: (postId, commentId, newContent) => set((state) => {
    const newPosts = state.posts.map(post => {
      if (post.id !== postId) return post;
      
      const updateComment = (comments) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: newContent
            };
          }
          
          if (comment.replies?.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          
          return comment;
        });
      };
      
      return {
        ...post,
        comments: updateComment(post.comments || [])
      };
    });
    
    localStorage.setItem("posts", JSON.stringify(newPosts));
    return { posts: newPosts };
  }),
  
  deleteComment: (postId, commentId) => set((state) => {
    const newPosts = state.posts.map(post => {
      if (post.id !== postId) return post;
      
      const removeComment = (comments) => {
        return comments.filter(comment => {
          if (comment.id === commentId) return false;
          
          if (comment.replies?.length > 0) {
            comment.replies = removeComment(comment.replies);
          }
          
          return true;
        });
      };
      
      return {
        ...post,
        comments: removeComment(post.comments || [])
      };
    });
    
    localStorage.setItem("posts", JSON.stringify(newPosts));
    return { posts: newPosts };
  }),
  
  toggleCommentLike: (postId, commentId, isLiked) => set((state) => {
    const username = state.user?.username;
    if (!username) return state;
    
    const newLikedComments = {
      ...state.likedComments,
      [username]: {
        ...(state.likedComments[username] || {}),
        [`${postId}-${commentId}`]: !isLiked
      }
    };
    
    localStorage.setItem("likedComments", JSON.stringify(newLikedComments));
    
    const updateCommentLikes = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.likes + (isLiked ? -1 : 1),
            isLiked: !isLiked
          };
        }
        
        if (comment.replies?.length > 0) {
          return {
            ...comment,
            replies: updateCommentLikes(comment.replies)
          };
        }
        
        return comment;
      });
    };
    
    const newPosts = state.posts.map(post => {
      if (post.id !== postId) return post;
      
      return {
        ...post,
        comments: updateCommentLikes(post.comments || [])
      };
    });
    
    localStorage.setItem("posts", JSON.stringify(newPosts));
    
    return {
      likedComments: newLikedComments,
      posts: newPosts
    };
  })
}));

const AuthForm = ({ onLogin, onRegister, isLogin, isLoading, error, setShowLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.username, formData.password);
    } else {
      onRegister(formData.name, formData.username, formData.password);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">SOSMEDIN</h1>
      
      <div className="auth-welcome">
        <h2>Halo!</h2>
        <h2>{isLogin ? "Selamat datang!" : "Daftar untuk memulai!"}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>
        )}
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>
        
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
        
        {error && <div className="auth-error">{error}</div>}
      </form>
      
      <div className="auth-footer">
        <span 
          onClick={() => {
            setShowLogin(!isLogin);
            setFormData({ name: "", username: "", password: "" });
          }} 
          className="auth-toggle"
        >
          {isLogin ? "Tidak punya akun? Daftar" : "Sudah punya akun? Login"}
        </span>
        {isLogin && <span className="forgot-password">Lupa Password</span>}
      </div>
    </div>
  );
};

const Comment = ({ 
  comment, 
  postId, 
  onReply, 
  onEdit, 
  onDelete,
  onLikeComment,
  currentUser,
  depth = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleReplySubmit = () => {
    if (replyContent.trim() === "") return;
    
    if (replyContent.length > 140) {
      alert("Reply cannot exceed 140 characters!");
      return;
    }
    
    onReply(postId, {
      user: currentUser?.name || currentUser?.username || "Anda",
      time: new Date().toLocaleTimeString(),
      content: replyContent,
      likes: 0,
      isLiked: false
    }, comment.id);
    
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true);
  };
  
  const handleEditSubmit = () => {
    if (editContent.trim() === "") return;
    
    if (editContent.length > 140) {
      alert("Comment cannot exceed 140 characters!");
      return;
    }
    
    onEdit(postId, comment.id, editContent);
    setIsEditing(false);
  };
  
  const isCurrentUserComment = comment.user === (currentUser?.name || currentUser?.username || "Anda");
  
  return (
    <div className={`comment ${depth > 0 ? 'reply' : ''}`} style={{ marginLeft: `${depth * 20}px` }}>
      <div className="comment-header">
        <img src={PPIcon} alt="User profile" className="comment-avatar" />
        <div className="comment-info">
          <h4>{comment.user}</h4>
          <p>{comment.time}</p>
        </div>
        {isCurrentUserComment && (
          <div className="comment-menu">
            <button 
              className="comment-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="comment-dropdown">
                <button onClick={() => {
                  setIsEditing(true);
                  setMenuOpen(false);
                }}>
                  Edit Komentar
                </button>
                <button onClick={() => {
                  onDelete(postId, comment.id);
                  setMenuOpen(false);
                }}>
                  Hapus Komentar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isEditing ? (
  <div className="edit-comment">
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      maxLength={140}
    />
    <CharacterCounter 
      current={editContent.length} 
      max={140} 
      show={editContent.length > 0} 
    />
    <div className="edit-comment-buttons">
      <button onClick={() => setIsEditing(false)}>Cancel</button>
      <button 
        onClick={handleEditSubmit}
        disabled={editContent.length > 140 || editContent.trim() === ""}
      >
        Save
      </button>
    </div>
  </div>
) : (
  <div className="comment-content">{comment.content}</div>
)}
      
      <div className="comment-footer">
        <span 
          onClick={() => onLikeComment(postId, comment.id)} 
          style={{ cursor: "pointer" }} 
          className="icon-action-container"
        >
          <img src={comment.isLiked ? LikeIcon : UnlikeIcon} alt="Like" className="icon-action" />
          <span>{comment.likes || 0}</span>
        </span>
        <span 
          onClick={() => setIsReplying(!isReplying)} 
          style={{ cursor: "pointer" }} 
          className="icon-action-container"
        >
          <img src={CommentIcon} alt="Reply" className="icon-action" />
          <span>{comment.replies?.length || 0}</span>
        </span>
        <span className="icon-action-container">
          <img src={ShareIcon} alt="Share" className="icon-action" />
          <span>Share</span>
        </span>
        <span className="icon-action-container">
          <img src={BookmarkIcon} alt="Save" className="icon-action" />
          <span>Save</span>
        </span>
      </div>
      
      {isReplying && (
  <div className="reply-form">
    <textarea
      placeholder="Tulis balasan..."
      value={replyContent}
      onChange={(e) => setReplyContent(e.target.value)}
      maxLength={140}
      rows={3}
    />
    <CharacterCounter 
      current={replyContent.length} 
      max={140} 
      show={replyContent.length > 0} 
    />
    <div className="reply-actions">
      <button 
        onClick={() => setIsReplying(false)}
        className="cancel-btn"
      >
        Cancel
      </button>
      <button 
        onClick={handleReplySubmit}
        disabled={!replyContent.trim() || replyContent.length > 140}
        className="submit-btn"
      >
        Kirim balasan
      </button>
    </div>
  </div>
)}
      
      {comment.replies?.length > 0 && (
        <>
          <div 
            className="show-replies" 
            onClick={() => setShowReplies(!showReplies)}
            style={{ cursor: "pointer" }}
          >
            {showReplies ? "Sembunyikan balasan" : `Lihat balasan (${comment.replies.length})`}
          </div>
          
          {showReplies && (
            <div className="replies">
              {comment.replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLikeComment={onLikeComment}
                  currentUser={currentUser}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Post = ({ 
  post, 
  onLike, 
  onComment, 
  onEditPost, 
  onDeletePost,
  onLikeComment,
  currentUserLikes,
  currentUser,
  isProfilePage = false
}) => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  
  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
    setMenuOpen(null);
  };

  const handleEditPost = () => {
    if (editedContent.trim() === "") {
      alert("Konten tidak boleh kosong!");
      return;
    }

    if (editedContent.length > 140) {
      alert("Post cannot exceed 140 characters!");
      return;
    }

    onEditPost(editingPostId, editedContent);
    setEditingPostId(null);
  };

  const handleCommentSubmit = () => {
    if (commentContent.trim() === "") {
      alert("Comment cannot be empty!");
      return;
    }
    
    if (commentContent.length > 140) {
      alert("Comment cannot exceed 140 characters!");
      return;
    }
    
    onComment(post.id, {
      user: currentUser?.name || currentUser?.username || "Anda",
      time: new Date().toLocaleTimeString(),
      content: commentContent,
      likes: 0,
      isLiked: false
    });
    
    setCommentContent("");
    setShowComments(true);
  };
  
  const isCurrentUserPost = post.user === (currentUser?.name || currentUser?.username || "Anda");
  
  return (
    <div className="post">
      <div className="post-header">
        <img src={PPIcon} alt="User profile" />
        <div className="post-info">
          <h2>{post.user}</h2>
          <p>{post.time}</p>
        </div>

        {isCurrentUserPost && (
          <div className="post-menu">
            <span onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}>⋮</span>
            {menuOpen === post.id && (
              <div className="menu-dropdown">
                <button onClick={() => handleEditClick(post)}>Edit Postingan</button>
                <button onClick={() => onDeletePost(post.id)}>Hapus Postingan</button>
              </div>
            )}
          </div>
        )}
      </div>

      {editingPostId === post.id ? (
  <div className="edit-post-container">
    <textarea
      className="edit-textarea"
      value={editedContent}
      onChange={(e) => setEditedContent(e.target.value)}
      maxLength={140}
    />
    <CharacterCounter 
      current={editedContent.length} 
      max={140} 
      show={editedContent.length > 0} 
    />
    <div className="edit-actions">
      <button className="cancel-button" onClick={() => setEditingPostId(null)}>Batal</button>
      <button 
        className="save-button" 
        onClick={handleEditPost}
        disabled={editedContent.length > 140 || editedContent.trim() === ""}
      >
        Simpan
      </button>
    </div>
  </div>
) : (
  <p className="post-content">{post.content}</p>
)}

      <div className="post-actions">
        <span onClick={() => onLike(post.id)} style={{ cursor: "pointer" }} className="icon-action-container">
          <img src={currentUserLikes[post.id] ? LikeIcon : UnlikeIcon} alt="Like" className="icon-action" />
          <span>{post.likes}</span>
        </span>
        <span 
          onClick={() => setShowComments(!showComments)} 
          style={{ cursor: "pointer" }} 
          className="icon-action-container"
        >
          <img src={CommentIcon} alt="Comment" className="icon-action" />
          <span>{post.comments?.length || 0}</span>
        </span>
        <span className="icon-action-container">
          <img src={ShareIcon} alt="Share" className="icon-action" />
          <span>Bagikan</span>
        </span>
        <span className="icon-action-container">
          <img src={BookmarkIcon} alt="Bookmark" className="icon-action" />
          <span>Simpan</span>
        </span>
      </div>
      
      {showComments && (
        <div className="comments-section">
          <div className="comment-input">
            <img src={PPIcon} alt="User profile" className="comment-avatar" />
            <input
              type="text"
              placeholder="Tulis komentar..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
              maxLength={140}
            />
            <CharacterCounter current={commentContent.length} max={140} />
            <button 
              onClick={handleCommentSubmit}
              disabled={commentContent.length > 140 || commentContent.trim() === ""}
            >
              Kirim
            </button>
          </div>
          
          {post.comments?.length > 0 ? (
            <div className="comments-list">
              {post.comments.map(comment => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onReply={onComment}
                  onEdit={(postId, commentId, newContent) => {
                    const { editComment } = useStore.getState();
                    editComment(postId, commentId, newContent);
                  }}
                  onDelete={(postId, commentId) => {
                    const { deleteComment } = useStore.getState();
                    deleteComment(postId, commentId);
                  }}
                  onLikeComment={onLikeComment}
                  currentUser={currentUser}
                />
              ))}
            </div>
          ) : (
            <p className="no-comments">No comments yet</p>
          )}
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ onBack, userPosts, onHomeClick, onLogout, user }) => {
  const {
    currentUserLikes,
    toggleLike,
    editPost,
    deletePost,
    toggleCommentLike,
    token
  } = useStore();

  const handleLike = async (postId) => {
    const isLiked = currentUserLikes[postId] || false;
    
    try {
      if (isLiked) {
        await fetch(`${API_BASE_URL}/likes/${postId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } else {
        await fetch(`${API_BASE_URL}/likes/${postId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }

      toggleLike(postId, isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleCommentLike = async (postId, commentId) => {
    const isLiked = useStore.getState().likedComments[user?.username]?.[`${postId}-${commentId}`] || false;
    
    try {
      if (isLiked) {
        await fetch(`${API_BASE_URL}/comments/${commentId}/likes`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } else {
        await fetch(`${API_BASE_URL}/comments/${commentId}/likes`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }

      toggleCommentLike(postId, commentId, isLiked);
    } catch (error) {
      console.error("Error updating comment like:", error);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button onClick={onBack} className="back-button">←</button>
          <h2>Profil</h2>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
        
        <div className="profile-info">
          <div className="profile-picture">
            <img src={PPIcon} alt="Profile" />
          </div>
          <div className="profile-stats">
            <h3>{user?.name || user?.username || 'User'}</h3>
            <p>{userPosts.length} postingan</p>
          </div>
        </div>
        
        <div className="profile-posts">
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <Post
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={(postId, commentData, parentCommentId) => {
                  const { addComment } = useStore.getState();
                  addComment(postId, commentData, parentCommentId);
                }}
                onEditPost={(postId, content) => {
                  editPost(postId, content);
                }}
                onDeletePost={(postId) => {
                  deletePost(postId);
                }}
                onLikeComment={handleCommentLike}
                currentUserLikes={currentUserLikes}
                currentUser={user}
                isProfilePage={true}
              />
            ))
          ) : (
            <p className="no-posts">Tidak ada postingan</p>
          )}
        </div>
      </div>
      
      <div className="footer">
        <span onClick={onHomeClick} className="footer-icon">
          <img src={HomeIcon} alt="Home" />
        </span>
        <span className="footer-icon">
          <img src={SearchIcon} alt="Search" />
        </span>
        <span className="footer-icon">
          <img src={MessageIcon} alt="Message" />
        </span>
        <span className="footer-icon">
          <img src={CommunityIcon} alt="Community" />
        </span>
        <span className="footer-icon active-icon">
          <img src={PPIcon} alt="ProfilePicture" />
        </span>
      </div>
    </div>
  );
};

const App = () => {
  const {
    posts,
    currentUserLikes,
    likedComments,
    addPost,
    deletePost,
    editPost,
    toggleLike,
    toggleCommentLike,
    addComment,
    token,
    user,
    setAuth,
    clearAuth,
    setUserLikes
  } = useStore();
  
  const [newPost, setNewPost] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [defaultPostsWithLikes, setDefaultPostsWithLikes] = useState(defaultPosts);

  const fetchLikes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/likes`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const formattedLikes = data.reduce((acc, like) => {
          acc[like.post_id] = true;
          return acc;
        }, {});
        setUserLikes(user.username, formattedLikes);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedToken && !token) {
      setAuth(storedToken, storedUser);
    }
  }, [token, setAuth]);

  useEffect(() => {
    if (token) {
      fetchLikes();
    }
  }, [token]);

  const handleLogin = async (username, password) => {
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuth(data.token, { username, name: username });
        fetchLikes();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name, username, password) => {
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuth(data.token, { username, name });
        fetchLikes();
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setShowProfile(false);
  };

  const handleLike = async (postId) => {
    const isLiked = currentUserLikes[postId] || false;
    
    try {
      if (isLiked) {
        await fetch(`${API_BASE_URL}/likes/${postId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } else {
        await fetch(`${API_BASE_URL}/likes/${postId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }

      if (defaultPosts.some(post => post.id === postId)) {
        setDefaultPostsWithLikes(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + (isLiked ? -1 : 1) } 
            : post
        ));
      }

      toggleLike(postId, isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleCommentLike = async (postId, commentId) => {
    const isLiked = likedComments[user?.username]?.[`${postId}-${commentId}`] || false;
    
    try {
      if (isLiked) {
        await fetch(`${API_BASE_URL}/comments/${commentId}/likes`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } else {
        await fetch(`${API_BASE_URL}/comments/${commentId}/likes`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }

      toggleCommentLike(postId, commentId, isLiked);
    } catch (error) {
      console.error("Error updating comment like:", error);
    }
  };

  const handlePost = () => {
    if (newPost.trim() === "") {
      alert("Postingan tidak boleh kosong!");
      return;
    }
    
    if (newPost.length > 140) {
      alert("Postingan tidak boleh lebih dari 140 karakter!");
      return;
    }

    const newPostData = {
      id: `post-${Date.now()}`,
      user: user?.name || user?.username || "Anda",
      time: new Date().toLocaleTimeString(),
      content: newPost,
      likes: 0,
      comments: []
    };

    addPost(newPostData);
    setNewPost("");
  };

  const handleComment = (postId, commentData, parentCommentId = null) => {
    if (!token) return;
    addComment(postId, commentData, parentCommentId);
  };

  const handleHomeClick = () => {
    setShowProfile(false);
  };

  const userPosts = posts.filter(post => 
    post.user === (user?.name || user?.username || "Anda")
  );

  return (
    <div className="container">
      {!token ? (
        <div className="auth-page">
          <AuthForm 
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLogin={showLogin}
            isLoading={isLoading}
            error={error}
            setShowLogin={setShowLogin}
          />
        </div>
      ) : showProfile ? (
        <ProfilePage 
          onBack={() => setShowProfile(false)} 
          onHomeClick={handleHomeClick}
          userPosts={userPosts}
          onLogout={handleLogout}
          user={user}
        />
      ) : (
        <>
          <div className="header">
            <h1>SOSMEDIN</h1>
            <div className="icons">
              <img src={NotifikasiIcon} alt="Notifikasi" className="icon-notification" />
            </div>
          </div>

          <div className="post-input">
  <div className="post-input-container">
    <img src={PPIcon} alt="User profile" />
    <input
      type="text"
      placeholder="Sosmedin disini!"
      value={newPost}
      onChange={(e) => setNewPost(e.target.value)}
      maxLength={140}
    />
  </div>
  <div className="post-actions">
    <CharacterCounter 
      current={newPost.length} 
      max={140} 
      show={newPost.length > 0} 
    />
    <button 
      onClick={handlePost} 
      disabled={newPost.length > 140 || newPost.trim() === ""}
    >
      Posting
    </button>
  </div>
</div>

          {[...posts, ...defaultPostsWithLikes].map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onEditPost={(postId, content) => {
                editPost(postId, content);
              }}
              onDeletePost={(postId) => {
                deletePost(postId);
              }}
              onLikeComment={handleCommentLike}
              currentUserLikes={currentUserLikes}
              currentUser={user}
            />
          ))}

          <div className="footer">
            <span onClick={handleHomeClick} className="footer-icon home-active">
              <img src={HomeIcon} alt="Home" />
            </span>
            <span className="footer-icon">
              <img src={SearchIcon} alt="Search" />
            </span>
            <span className="footer-icon">
              <img src={MessageIcon} alt="Message" />
            </span>
            <span className="footer-icon">
              <img src={CommunityIcon} alt="Community" />
            </span>
            <span onClick={() => setShowProfile(true)} className="footer-icon" style={{ cursor: "pointer" }}>
              <img src={PPIcon} alt="ProfilePicture" />
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default App;