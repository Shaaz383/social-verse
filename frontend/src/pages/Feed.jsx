import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Feed = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/feed');
        setUser(response.data.user);
        setPosts(response.data.posts.reverse());
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleLike = async (postId) => {
      try {
          const response = await api.get(`/like/post/${postId}`);
          if (response.data.success) {
               // Update posts state to reflect like change
               // The backend returns the updated post with populated likes usually? 
               // Wait, the backend route /like/post/:id returns { success: true, post }
               // And in backend: const post = await postModel.findOne({ _id: req.params.id }).populate('likes');
               // So the returned post has POPULATED likes. 
               // But our local posts state has UNPOPULATED likes (array of IDs).
               // We need to be careful.
               
               // Let's check backend route again.
               // router.get("/like/post/:id", ... ) -> populates likes.
               // if (post.likes.map(like => like._id).indexOf(user._id) === -1) ...
               
               // So the returned post from like API has populated likes.
               // But the feed API returns unpopulated likes.
               
               // We should transform the returned post's likes back to array of IDs for consistency, 
               // OR just reload the feed (easier but slower), 
               // OR just update the local state manually.
               
               const updatedPost = response.data.post;
               // Transform populated likes back to IDs if necessary for consistency, 
               // or just use the count and check existence.
               // But wait, if I replace the post object, I need to make sure consistency.
               
               // Simplest: Just toggle the ID in the local state without using response (optimistic UI) 
               // or use response but map likes to IDs.
               
               const likeIds = updatedPost.likes.map(l => l._id || l);
               
               setPosts(posts.map(post => {
                   if (post._id === postId) {
                       return { ...post, likes: likeIds };
                   }
                   return post;
               }));
          }
      } catch (err) {
          console.error(err);
      }
  };

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="w-full px-4 flex items-center justify-between">
        <img className="w-1/4" src="/images/logo.png" alt="logo" />
        <div className="icons -mt-2 flex gap-5 items-center">
          <Link to="/notification">
            <i className="text-[1.4rem] ri-heart-3-line"></i>
          </Link>
          <Link to="/message">
            <i className="text-[1.4rem] ri-messenger-line"></i>
          </Link>
        </div>
      </div>
      
      {/* Stories - Static for now as in EJS */}
      <div className="story px-3 flex gap-3 overflow-auto mt-5">
         <div className="circle flex-shrink-0">
          <div className="w-[18vw] h-[18vw] bg-sky-100 rounded-full flex items-center justify-center">
            <div className="inner w-[92%] h-[92%] rounded-full overflow-hidden">
              <img
                src={`http://localhost:3000/images/uploads/${user.profileImage}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
         {[
            { name: "sixer_king", img: "https://ss-i.thgim.com/public/cricket/t7tdzn/article54603981.ece/alternates/FREE_1200/Yuvraj-Singh" },
            { name: "mr_360", img: "https://images.news18.com/ibnlive/uploads/2021/07/1627310607_ab-de-villiers.jpg" },
            { name: "king_kohli", img: "https://imgnew.outlookindia.com/public/uploads/articles/2021/10/12/Kohli-IPL-RCB-Celeb.jpg" },
            { name: "mahi", img: "https://images.indianexpress.com/2019/04/dhoni-759-10.jpg" }
         ].map((story, idx) => (
             <div key={idx} className="circle flex-shrink-0 flex flex-col items-center gap-1">
              <div className="gradient w-[18vw] h-[18vw] bg-sky-100 rounded-full bg-gradient-to-r from-purple-700 to-orange-500 flex items-center justify-center">
                <div className="inner w-[92%] h-[92%] rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={story.img}
                    alt=""
                  />
                </div>
              </div>
              <p className="name">{story.name}</p>
            </div>
         ))}
      </div>

      <div className="posts mb-20">
        {posts.map((elem) => (
          <div key={elem._id} className="post mt-10 w-full min-h-[50vh]">
            <div className="title px-4 flex items-center gap-2">
              <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={`http://localhost:3000/images/uploads/${elem.user.profileImage}`}
                  alt=""
                />
              </div>
              <Link to={`/userprofile/${elem.user.username}`} className="text-sm">
                {elem.user.username}
              </Link>
            </div>
            <div className="w-full h-96 mt-4 bg-sky-100 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={`http://localhost:3000/images/uploads/${elem.picture}`}
                alt=""
              />
            </div>
            <div className="options w-full px-4 flex justify-between items-center text-[1.4rem]">
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleLike(elem._id)}>
                  {elem.likes.includes(user._id) ? (
                    <i className="ri-heart-3-fill text-red-600"></i>
                  ) : (
                    <i className="ri-heart-line"></i>
                  )}
                </button>
                <i className="ri-chat-3-line"></i>
                <i className="ri-share-circle-line"></i>
              </div>
              <i className="ri-bookmark-line"></i>
            </div>
            <h3 className="px-4 mt-2 text-sm leading-none tracking-tight">
              {elem.likes.length} likes
            </h3>
            <h2 className="text-white font-light text-sm mt-2">
              <span className="font-semibold pl-4 pr-2">{elem.user.username}</span>
              {elem.caption}
            </h2>
          </div>
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Feed;
