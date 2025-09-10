import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUpload from "./components/FileUpload";
import FileTable from "./components/FileTable";
import Toolbar from "./components/Toolbar";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Footer from "./components/Footer";

/**
 * App Component
 * - Root component managing authentication, routing, and layout.
 * - Handles file/folder navigation state (prefix).
 * - Coordinates refresh triggers for child components.
 */
function App() {
  const [prefix, setPrefix] = useState(""); // Current folder path
  const [uploadedFile, setUploadedFile] = useState(null); // Last uploaded file
  const [user, setUser] = useState(null); // Logged-in user { email, token }
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now()); // Used to re-fetch file list

  /**
   * ======================================
   * Authentication Routing
   * - If no user is logged in → show login/signup routes.
   * - Otherwise → render main application.
   * ======================================
   */
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<LoginPage onLogin={setUser} />} />
        </Routes>
      </Router>
    );
  }

  /**
   * ======================================
   * Main Authenticated App Layout
   * ======================================
   */
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
            🚀 CVault
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Hello, <span className="font-medium">{user.email}</span>
            </span>
            <button
              onClick={() => setUser(null)} // Logout clears user state
              className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-10 py-10 space-y-8">
        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Upload Files
          </h2>
          <FileUpload
            onFileUploaded={(file) => {
              setUploadedFile(file);
              setRefreshTrigger(Date.now()); // Trigger re-fetch
            }}
            currentPrefix={prefix}
          />
        </div>

        {/* File Browser Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
          {/* Breadcrumb Toolbar */}
          <Toolbar
            prefix={prefix}
            onPrefixChange={setPrefix}
            onRefresh={() => setRefreshTrigger(Date.now())}
          />

          {/* File List / Table */}
          <div className="mt-6">
            <FileTable
              prefix={prefix}
              refreshTrigger={refreshTrigger}
              uploadedFile={uploadedFile}
              onPrefixChange={setPrefix}
              onRefresh={() => setRefreshTrigger(Date.now())}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
