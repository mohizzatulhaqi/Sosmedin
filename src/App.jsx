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
import "./App.css";

const defaultPosts = [
  { id: "default-1", user: "mr", time: "08:39 am", content: "tni ga sekolah ya mereka?", likes: 1964 },
  { id: "default-2", user: "jastok", time: "08:59 am", content: "kita butuh pelatih orang belanda juga", likes: 4000 },
  { id: "default-3", user: "sjw", time: "10:00 am", content: "lu cakep lu aman😆", likes: 1234 },
  { id: "default-4", user: "china media", time: "13:00 am", content: "Indonesian reporter receives pig’s head in incident condemned as ‘terror attack’", likes: 10000 },
];

const App = () => {
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem("posts");
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  const [likedPosts, setLikedPosts] = useState(() => {
    const savedLikes = localStorage.getItem("likedPosts");
    return savedLikes ? JSON.parse(savedLikes) : {};
  });

  const [newPost, setNewPost] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  const handleLike = (postId) => {
    setLikedPosts((prevLiked) => {
      const isLiked = prevLiked[postId] || false;
      const updatedLikes = { ...prevLiked, [postId]: !isLiked };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: Math.round(post.likes + (isLiked ? -1 : 1)) }
            : post
        )
      );

      return updatedLikes;
    });
  };

  const handlePost = () => {
    if (newPost.trim() === "") {
      alert("Postingan tidak boleh kosong!");
      return;
    }

    const newPostData = {
      id: `post-${Date.now()}`,
      user: "Anda",
      time: new Date().toLocaleTimeString(),
      content: newPost,
      likes: 0,
    };

    setPosts([newPostData, ...posts]);
    setNewPost("");
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
    setMenuOpen(null);
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };

  const handleEditPost = () => {
    if (editedContent.trim() === "") {
      alert("Konten tidak boleh kosong!");
      return;
    }

    setPosts(
      posts.map((post) =>
        post.id === editingPostId ? { ...post, content: editedContent } : post
      )
    );

    setEditingPostId(null);
    setMenuOpen(null);
  };

  return (
    <div className="container">
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
          />
        </div>
        <div className="post-actions">
          <button onClick={handlePost}>Posting</button>
        </div>
      </div>

      {[...posts, ...defaultPosts].map((post) => (
        <div className="post" key={post.id}>
          <div className="post-header">
            <img src={PPIcon} alt="User profile" />
            <div className="post-info">
              <h2>{post.user}</h2>
              <p>{post.time}</p>
            </div>

            {post.user === "Anda" && (
              <div className="post-menu">
                <span onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}>⋮</span>
                {menuOpen === post.id && (
                  <div className="menu-dropdown">
                    <button onClick={() => handleEditClick(post)}>Edit Postingan</button>
                    <button onClick={() => handleDeletePost(post.id)}>Hapus Postingan</button>
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
              />
              <div className="edit-actions">
                <button className="cancel-button" onClick={() => setEditingPostId(null)}>Batal</button>
                <button className="save-button" onClick={handleEditPost}>Simpan</button>
              </div>
            </div>
          ) : (
            <p className="post-content">{post.content}</p>
          )}

          <div className="post-actions">
            <span onClick={() => handleLike(post.id)} style={{ cursor: "pointer" }} className="icon-action-container">
              <img src={likedPosts[post.id] ? LikeIcon : UnlikeIcon} alt="Like" className="icon-action" />
              <span>{defaultPosts.some((p) => p.id === post.id) ? post.likes + (likedPosts[post.id] ? 1 : 0) : post.likes}</span>
            </span>
            <span className="icon-action-container">
              <img src={CommentIcon} alt="Comment" className="icon-action" />
              <span>Komentar</span>
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
        </div>
      ))}

      <div className="footer">
        <span><img src={HomeIcon} alt="Home" /></span>
        <span><img src={SearchIcon} alt="Search" /></span>
        <span><img src={MessageIcon} alt="Message" /></span>
        <span><img src={CommunityIcon} alt="Community" /></span>
        <span><img src={PPIcon} alt="ProfilePicture" /></span>
      </div>
    </div>
  );
};

export default App;
