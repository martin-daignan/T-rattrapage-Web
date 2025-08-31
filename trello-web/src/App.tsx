import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import BoardScreen from "./screens/BoardsScreen";
import ListScreen from "./screens/ListScreen";
import './index.css'   

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/workspaces/:workspaceId" element={<BoardScreen />} />
        <Route path="/boards/:boardId/lists" element={<ListScreen />} />

      </Routes>
    </Router>
  );
}

export default App;
