import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import ReferenceRangeManager from "./components/ReferenceRangeManager";
import TestResultForm from "./components/TestResultForm";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div className="App">
        {/* ✅ Show NavBar only if logged in */}
        {isLoggedIn && <NavBar />}

        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/reference-ranges" />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/reference-ranges"
            element={isLoggedIn ? <ReferenceRangeManager /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-test"
            element={isLoggedIn ? <TestResultForm /> : <Navigate to="/login" />}
          />
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/reference-ranges" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
