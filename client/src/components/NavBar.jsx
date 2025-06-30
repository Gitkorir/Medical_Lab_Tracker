// client/src/components/NavBar.jsx
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-around">
      <Link to="/reference-ranges" className="hover:underline">Reference Ranges</Link>
      <Link to="/add-test" className="hover:underline">Add Test Result</Link>
    </nav>
  );
}
