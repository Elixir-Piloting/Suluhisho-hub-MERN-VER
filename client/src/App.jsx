import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Navbar } from "./Components/Navbar";
import { PostDetail } from "./pages/PostDetail";
import { SignUp } from "./Components/SignUp";
import { SignIn } from "./Components/SignIn";
import ProtectedRoute from "./Components/ProtectedRoute";
import { Map } from "./pages/Map";

export const App = () => {
  return (
    <div data-theme="light" className="flex flex-col h-full">
      <Router>
        <Navbar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};
