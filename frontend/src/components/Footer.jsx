/**
 * Footer Component
 * - Simple, reusable site-wide footer.
 * - Displays branding and current year dynamically.
 */
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 text-center text-sm text-gray-600">
        {/* Dynamic year ensures no manual updates are needed */}
        © {new Date().getFullYear()} CVault. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
