import { Link } from "@/ui/react";

export default function DevPage() {
  return (
    <div>
      <h1>Dev Page</h1>
      <ul>
        <li>
          <Link to="/dev/one">one</Link>
        </li>
        <li>
          <Link to="/dev/two">two</Link>
        </li>
      </ul>
    </div>
  );
}
